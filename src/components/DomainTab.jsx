import React, { useState, useEffect } from 'react';
import { Layout, Code } from 'lucide-react';
import CodeBlock from './CodeBlock';
import mermaid from 'mermaid';

const DomainTab = () => {
    const [activeTab, setActiveTab] = useState('composite');

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose'
        });
    }, []);

    useEffect(() => {
        // 切換 tab 時自動滾動到最上方
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 延遲渲染，確保 DOM 已就緒，避免 getBBox / firstChild 錯誤
        // 使用 requestAnimationFrame 取代 setTimeout，加速渲染並避免閃爍
        requestAnimationFrame(async () => {
            try {
                const mermaidElements = document.querySelectorAll('.mermaid');
                mermaidElements.forEach(el => {
                    el.removeAttribute('data-processed');
                    // 隱藏原始文字，直到渲染完成 (透過 mermaid.run 自動處理)
                    el.style.visibility = 'hidden';
                });

                await mermaid.run({ querySelector: '.mermaid' });

                // 渲染後顯示
                mermaidElements.forEach(el => el.style.visibility = 'visible');
            } catch (e) {
                console.warn('[Mermaid] render skipped:', e.message);
            }
        });
    }, [activeTab]);

    const patterns = [
        {
            id: 'composite',
            name: 'Composite + Prototype',
            stage: '1. 結構與複製',
            description: '定義檔案系統共通介面 (EntryComponent)，讓 Client 不需區分檔案與目錄，並實作 Prototype 模式讓可自我複製。',
            mermaid: `classDiagram
    class EntryComponent {
        <<abstract>>
        +id
        +name
        +type
        +size
        +created
        +attributes
        +accept(visitor)*
        +clone()*
    }
    
    class FileLeaf {
        <<abstract>>
        +accept(visitor)
        +clone()*
    }
    
    class WordDocument {
        +pageCount
        +clone()
    }
    
    class ImageFile {
        +width
        +height
        +clone()
    }
    
    class PlainText {
        +encoding
        +clone()
    }
    
    class DirectoryComposite {
        -children
        -activeStrategy
        +add(child)
        +remove(childId)
        +sort(strategy)
        +getChildren()
        +clone()
    }
    
    EntryComponent <|-- FileLeaf : 繼承
    EntryComponent <|-- DirectoryComposite : 繼承
    FileLeaf <|-- WordDocument : 繼承
    FileLeaf <|-- ImageFile : 繼承
    FileLeaf <|-- PlainText : 繼承
    DirectoryComposite o-- EntryComponent : 組合`,
            usageTitle: '統一操作介面',
            usageDesc: 'Client 因依賴抽象介面 EntryComponent，無需區分檔案或目錄，即可進行一致的操作。',
            usageCode: `const dir = new DirectoryComposite('Root');
// 加入檔案
dir.add(new FileLeaf('Doc.pdf', 1024));
// 加入目錄 (Composite) - 操作完全相同
dir.add(new DirectoryComposite('SubFolder'));

// [Prototype] 複製整棵樹
const clone = dir.clone();
console.log(clone !== dir); // true (新的實體)
console.log(clone.name);   // "Root" (狀態相同)`
        },
        {
            id: 'visitor',
            name: 'Visitor',
            stage: '2. 行為分離',
            description: '將操作邏輯 (XML 匯出、搜尋、大小計算) 從資料結構中分離,實現插件化擴展。',
            mermaid: `classDiagram
    class BaseVisitor {
        <<abstract>>
        +notifier
        +processedCount
        +visitFile(file)*
        +visitDirectory(dir)*
        +changeState(message, currentNode)
    }
    
    class NodeCountVisitor {
        +total
        +visitFile(file)
        +visitDirectory(dir)
    }
    
    class SizeCalculatorVisitor {
        +totalSize
        +visitFile(file)
        +visitDirectory(dir)
    }
    
    class FileSearchVisitor {
        +keyword
        +foundIds
        +visitFile(file)
        +visitDirectory(dir)
    }
    
    class XmlExportVisitor {
        +xml
        +depth
        +visitFile(file)
        +visitDirectory(dir)
    }
    
    class EntryComponent {
        +accept(visitor)
    }
    
    BaseVisitor <|-- NodeCountVisitor : 繼承
    BaseVisitor <|-- SizeCalculatorVisitor : 繼承
    BaseVisitor <|-- FileSearchVisitor : 繼承
    BaseVisitor <|-- XmlExportVisitor : 繼承
    EntryComponent ..> BaseVisitor : 使用`,
            usageTitle: '行為插件化',
            usageDesc: '透過 accept 方法掛載不同 Visitor，在不修改物件結構的前提下，隨插即用新的業務邏輯。',
            usageCode: `// 情境 A: 匯出 XML
root.accept(new XmlExportVisitor());

// 情境 B: 搜尋檔案
root.accept(new FileSearchVisitor("API"));

// 情境 C: 計算大小
root.accept(new SizeCalculatorVisitor());`
        },
        {
            id: 'observer',
            name: 'Observer',
            stage: '3. 解耦通訊',
            description: '建立發布-訂閱機制,不耦合 UI 組件 (Console、Dashboard)，獨立發佈業務的狀態變化。',
            mermaid: `classDiagram
    class NotificationEvent {
        +source
        +type
        +message
        +data
    }

    class Subject {
        -observers[]
        +subscribe(obs)
        +unsubscribe(obs)
        +notify(event)
    }
    
    class BaseObserver {
        <<abstract>>
        +update(event)*
    }
    
    class ConsoleObserver {
        -addLogFn
        +update(event)
    }
    
    class DashboardObserver {
        -updateStatsFn
        -total
        +update(event)
    }
    
    Subject o-- BaseObserver : 持有
    Subject ..> NotificationEvent : 發送
    BaseObserver ..> NotificationEvent : 接收
    BaseObserver <|-- ConsoleObserver : 繼承
    BaseObserver <|-- DashboardObserver : 繼承`,
            usageTitle: '事件訂閱與廣播',
            usageDesc: '主體 (Subject) 不需知道觀察者 (Observer) 的具體實作，僅透過 notify 進行廣播，達成鬆散耦合。',
            usageCode: `const consoleObs = new ConsoleObserver();
const dashObs = new DashboardObserver();

// 1. 同時訂閱多個觀察者
subject.subscribe(consoleObs);
subject.subscribe(dashObs);

// 2. 發送通知 (廣播給所有訂閱者)
subject.notify({ 
    message: 'File deleted', 
    type: 'DELETE' 
});
// -> Console: 印出日誌
// -> Dashboard: 更新統計數字`
        },
        {
            id: 'flyweight',
            name: 'Flyweight + Factory',
            stage: '4. 資源共享',
            description: '透過標籤工廠共享相同配色的標籤實體,減少記憶體開銷。',
            mermaid: `classDiagram
    class Label {
        +name
        +color
    }
    
    class LabelFactory {
        -labels
        +getLabel(name)
    }
    
    LabelFactory ..> Label : 創建與快取
    LabelFactory o-- Label : 管理`,
            usageTitle: '工廠與實體共享',
            usageDesc: '透過工廠控管實體建立，確保相同屬性的物件在記憶體中只有一份。',
            usageCode: `// 第一次請求：建立新物件
const urgentLabel = LabelFactory.getLabel('Urgent');

// 第二次請求：回傳既有的快取物件 (不需 new)
const sameLabel = LabelFactory.getLabel('Urgent');

// 驗證：兩者指向同一個記憶體位址
console.log(urgentLabel === sameLabel); // true`
        },
        {
            id: 'singleton',
            name: 'Singleton',
            stage: '5. 全域狀態',
            description: '保證 Clipboard (剪貼簿) 在全應用程式中只有一個實例，並統一管理複製內容。',
            mermaid: `classDiagram
    class Clipboard {
        -_content
        +notifier
        -static instance
        +static getInstance()
        +set(content)
        +get()
        +hasContent()
        +clear()
    }
    `,
            usageTitle: '全域唯一存取點',
            usageDesc: '保證全應用程式中只有一個剪貼簿實體，並提供全域存取點。',
            usageCode: `// 獲取唯一實例
const clipboard = Clipboard.getInstance();
clipboard.set(file);

// 在應用程式的任何其他地方獲取
const cb2 = Clipboard.getInstance();

// 確保操作的是同一個狀態
console.log(cb2.get() === file); // true`
        },
        {
            id: 'mediator',
            name: 'Mediator',
            stage: '6. 關係管理',
            description: '集中管理檔案與標籤的多對多關聯,避免物件間的網狀依賴,實現 O(1) 查詢效率。',
            mermaid: `classDiagram
    class TagMediator {
        -fileToLabels
        -labelToFiles
        +attach(fileId, labelName)
        +detach(fileId, labelName)
        +getLabels(fileId)
        +getFiles(labelName)
    }
    
    class LabelFactory {
        +getLabel(name)
    }
    
    class Label {
        +name
        +color
    }
    
    class EntryComponent {
        +id
        +name
    }
    
    TagMediator ..> LabelFactory : 使用
    LabelFactory ..> Label : 取得/共享
    TagMediator ..> EntryComponent : 管理關聯`,
            usageTitle: '複雜關聯解耦',
            usageDesc: '透過中介者處理多對多關係，讓檔案物件不需直接包含標籤資訊，反之亦然。',
            usageCode: `// 貼標籤 (透過 Mediator，不修改 File 物件本身)
tagMediator.attach(file.id, 'Urgent');

// 正向查詢: 這個檔案有哪些標籤？
const labels = tagMediator.getLabels(file.id);

// 反向查詢: 哪些檔案有 'Urgent' 標籤？ (O(1) 高效查詢)
const urgentFiles = tagMediator.getFiles('Urgent');`
        },
        {
            id: 'command',
            name: 'Command',
            stage: '7. 行為物件化',
            description: '將操作封裝成物件,支援 Undo/Redo 功能,實現精確的歷史記錄管理。',
            mermaid: `classDiagram
    class BaseCommand {
        <<abstract>>
        +name
        +isUndoable
        +execute()*
        +undo()*
    }
    
    class DeleteCommand {
        -targetId
        -parentDir
        -targetEntry
        +execute()
        +undo()
    }
    
    class TagCommand {
        -tagMediator
        -fileId
        -labelName
        -isAttach
        +execute()
        +undo()
    }
    
    class SortCommand {
        -root
        -oldStrategy
        -newStrategy
        -oldSortState
        -newSortState
        +execute()
        +undo()
    }

    class CopyCommand {
        -component
        +isUndoable = false
        +execute()
        +undo()
    }

    class PasteCommand {
        -destinationDir
        -pastedComponent
        +execute()
        +undo()
    }
    
    class CommandInvoker {
        -undoStack[]
        -redoStack[]
        -notifier
        +execute(cmd)
        +undo()
        +redo()
    }
    
    BaseCommand <|-- DeleteCommand : 繼承
    BaseCommand <|-- TagCommand : 繼承
    BaseCommand <|-- SortCommand : 繼承
    BaseCommand <|-- CopyCommand : 繼承
    BaseCommand <|-- PasteCommand : 繼承
    CommandInvoker o-- BaseCommand : 管理
    `,
            usageTitle: '行為物件化與復原',
            usageDesc: '將「刪除」、「排序」等動作封裝成物件，讓 Invoker 可以統一執行、堆疊與復原。',
            usageCode: `// 將 "刪除" 封裝為物件
const deleteCmd = new DeleteCommand(fileId, parentDir);
invoker.execute(deleteCmd);

// 將 "貼標籤" 封裝為物件
const tagCmd = new TagCommand(mediator, fileId, 'Urgent', true);
invoker.execute(tagCmd);

// 復原最後一個動作 (貼標籤 -> 取消標籤)
invoker.undo();

// 再復原前一個動作 (刪除檔案 -> 恢復檔案)
invoker.undo();`
        },
        {
            id: 'strategy',
            name: 'Strategy',
            stage: '8. 策略注入',
            description: '定義排序演算法家族,讓排序規則 (名稱、大小、標籤) 可在執行時動態切換。',
            mermaid: `classDiagram
    class BaseStrategy {
        <<abstract>>
        #direction
        +sort(entries)*
    }
    
    class AttributeSortStrategy {
        -attribute
        +sort(entries)
    }
    
    class LabelSortStrategy {
        -tagMediator
        +sort(entries)
    }
    
    class DirectoryComposite {
        -activeStrategy
        +sort(strategy)
    }
    
    BaseStrategy <|-- AttributeSortStrategy : 繼承
    BaseStrategy <|-- LabelSortStrategy : 繼承
    DirectoryComposite ..> BaseStrategy : 使用`,
            usageTitle: '動態演算法切換',
            usageDesc: '將排序邏輯抽離成策略物件，可在執行時動態注入不同的排序規則。',
            usageCode: `// 策略 A: 依標籤排序
const s1 = new LabelSortStrategy(mediator, 'asc');
root.sort(s1);

// 策略 B: 依名稱排序
const s2 = new AttributeSortStrategy('name', 'asc');
root.sort(s2);

// Context (Directory) 只需要呼叫 sort()，不需修改內部邏輯`
        },
        {
            id: 'decorator',
            name: 'Decorator',
            stage: '9. 行為裝飾',
            description: '動態地為 Observer 附加額外行為 (高亮樣式)，不修改原始 Observer 的程式碼，支援多層疊加。',
            mermaid: `classDiagram
    class BaseObserver {
        <<abstract>>
        +update(event)*
    }
    
    class ConsoleObserver {
        -addLogFn
        +update(event)
    }
    
    class Decorator {
        <<abstract>>
        -wrapped : BaseObserver
        +update(event)
    }

    class HighlightDecorator {
        -keyword : string
        -style : string
        +update(event)
    }

    class IconDecorator {
        -keyword : string
        -icon : string
        +update(event)
    }

    class BoldDecorator {
        -keywords : string[]
        +update(event)
    }
    
    BaseObserver <|-- ConsoleObserver : 繼承
    BaseObserver <|-- Decorator : 繼承
    Decorator <|-- HighlightDecorator : 繼承
    Decorator <|-- IconDecorator : 繼承
    Decorator <|-- BoldDecorator : 繼承
    Decorator o-- BaseObserver : 包裝`,
            usageTitle: '物件行為疊加',
            usageDesc: '像俄羅斯套娃一樣層層包裹物件，每一層 Decorator 加入新的行為，且客戶端無需修改程式碼。',
            usageCode: `let obs = new ConsoleObserver();

// 1. 疊加顏色裝飾
obs = new HighlightDecorator(obs, 'Error', 'red');

// 2. 疊加圖標裝飾
obs = new IconDecorator(obs, 'Error', '⚠️');

// 3. 執行 (觸發所有裝飾層)
obs.update({ message: 'Error occurred' });
// 輸出: ⚠️ [紅色] Error occurred`
        },
        {
            id: 'facade',
            name: 'Facade',
            stage: '10. 統一介面',
            description: '提供一個簡易的單一介面 (FileSystemFacade) 來操作複雜的子系統 (Command, Visitor, Mediator)，降低 Client 與系統的耦合度。',
            usageTitle: '單一入口',
            usageDesc: 'Client 無需面對 Visitor, Command, Mediator 等複雜子系統，只需呼叫 Facade 的簡單方法。',
            usageCode: `const explorer = new FileSystemFacade(root);

// 不需知道背後是 Visitor...
explorer.searchFiles('report');

// 不需知道背後是 Command...
explorer.deleteItem('doc-1');

// 不需知道背後是 Mediator...
explorer.tagItem('doc-1', 'Urgent');`,
            mermaid: `classDiagram
    class FileSystemFacade {
        -root
        -invoker
        -clipboard
        -mediator
        +totalItems()
        +calculateSize(observers)
        +searchFiles(keyword, observers)
        +exportXml(observers)
        +undo()
        +redo()
        +tagItem(id, labelName)
        +removeTag(id, labelName)
        +deleteItem(id)
        +copyItem(id)
        +pasteItem(targetId)
        +sortItems(attribute, currentSortState)
        +findItem(id)
        +findParent(targetId)
        +getLabels(id)
        +getClipboardStatus()
    }

    class CommandInvoker {
        +execute(cmd)
    }
    
    class Clipboard {
        +set(content)
        +get()
    }
    
    class TagMediator {
        +attach()
        +detach()
    }
    
    class DirectoryComposite {
        +accept(visitor)
    }

    FileSystemFacade --> CommandInvoker : 委派命令
    FileSystemFacade --> Clipboard : 操作剪貼簿
    FileSystemFacade --> TagMediator : 管理標籤
    FileSystemFacade --> DirectoryComposite : 持有 Root`
        }
    ];

    // 取得當前選中的 pattern
    const currentPattern = patterns.find(p => p.id === activeTab);

    return (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-left text-base">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2"><Layout className="text-blue-600" /> 系統架構地圖 (System Architecture Roadmap)</h2>

            <div className="grid grid-cols-12 gap-6">
                {/* Left: Roadmap List */}
                <div className="col-span-4">
                    <div className="sticky top-6 overflow-hidden rounded-2xl border-2 border-slate-200">
                        {patterns.map((pattern, index) => (
                            <div
                                key={pattern.id}
                                onClick={() => setActiveTab(pattern.id)}
                                className={`p-4 cursor-pointer transition-all ${activeTab === pattern.id
                                    ? 'bg-blue-600 text-white border-l-4 border-l-blue-800'
                                    : 'bg-white hover:bg-blue-50'
                                    } ${index !== patterns.length - 1 ? 'border-b border-slate-200' : ''}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-base font-bold opacity-90">{pattern.stage}</span>
                                    <span className={`text-sm font-black italic ${activeTab === pattern.id ? 'text-white' : 'text-blue-600'}`}>
                                        {pattern.name}
                                    </span>
                                </div>
                                <p
                                    className={`text-xs leading-relaxed ${activeTab === pattern.id ? 'text-blue-50' : 'text-slate-600'}`}
                                    dangerouslySetInnerHTML={{ __html: pattern.description }}
                                ></p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Tab Content - 單一模板 */}
                <div className="col-span-8">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        {currentPattern && (
                            <div>
                                <h3 className="text-lg font-black text-slate-800 mb-4">{currentPattern.name} Pattern</h3>
                                <p className="text-slate-600 mb-4">{currentPattern.description}</p>

                                {/* UML Diagram */}
                                <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm">
                                    <h4 className="font-bold text-slate-800 mb-3 text-center">{currentPattern.name} Pattern UML</h4>
                                    <div className="mermaid" key={activeTab}>
                                        {currentPattern.mermaid}
                                    </div>
                                </div>

                                {/* Usage Example Section */}
                                {currentPattern.usageCode && (
                                    <div className="mt-6 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-md">
                                        <div className="px-5 py-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                                            <div className="font-bold text-slate-200 flex items-center gap-2">
                                                <Code size={20} className="text-blue-400" /> {currentPattern.usageTitle || 'Usage Example'}
                                            </div>
                                            <span className="text-xs text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded">JavaScript</span>
                                        </div>
                                        <div className="p-5">
                                            {currentPattern.usageDesc && (
                                                <p className="text-slate-400 mb-4 text-sm leading-relaxed border-b border-slate-800 pb-4">
                                                    {currentPattern.usageDesc}
                                                </p>
                                            )}
                                            <CodeBlock code={currentPattern.usageCode} language="javascript" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DomainTab;
