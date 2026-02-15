import React, { useState, useEffect } from 'react';
import { Layout, Code } from 'lucide-react';
import CodeBlock from './CodeBlock';
import mermaid from 'mermaid';

interface Pattern {
    id: string;
    name: string;
    stage: string;
    description: string;
    mermaid: string;
    usageTitle?: string;
    usageDesc?: string;
    usageCode?: string;
}

const DomainTab: React.FC = () => {
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

        requestAnimationFrame(async () => {
            try {
                const mermaidElements = document.querySelectorAll('.mermaid');
                mermaidElements.forEach(el => {
                    const htmlEl = el as HTMLElement;
                    htmlEl.removeAttribute('data-processed');
                    htmlEl.style.visibility = 'hidden';
                });

                await mermaid.run({ querySelector: '.mermaid' });

                mermaidElements.forEach(el => {
                    (el as HTMLElement).style.visibility = 'visible';
                });
            } catch (e: any) {
                console.warn('[Mermaid] render skipped:', e.message);
            }
        });
    }, [activeTab]);

    const patterns: Pattern[] = [
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

    class ISortStrategy {
        <<interface>>
        +sort(entries)*
    }
    
    EntryComponent <|-- FileLeaf : 繼承
    EntryComponent <|-- DirectoryComposite : 繼承
    FileLeaf <|-- WordDocument : 繼承
    FileLeaf <|-- ImageFile : 繼承
    FileLeaf <|-- PlainText : 繼承
    DirectoryComposite o-- EntryComponent : 組合
    DirectoryComposite ..> ISortStrategy : 使用`,
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
            description: '將操作邏輯 (統計、搜尋、Finder) 從資料結構中分離,實現插件化擴展。',
            mermaid: `classDiagram
    class BaseVisitor {
        <<abstract>>
        +notifier : Subject
        +processedCount : int
        +visitFile(file)*
        +visitDirectory(dir)*
        +changeState(message, currentNode)
    }
    
    class StatisticsVisitor {
        +totalNodes
        +totalSize
        +visitFile(file)
        +visitDirectory(dir)
        +getResults()
    }
    
    class FileSearchVisitor {
        +keyword
        +foundIds
        +visitFile(file)
        +visitDirectory(dir)
    }

    class FinderVisitor {
        +targetId
        +foundSelf
        +foundParent
        +visitFile(file)
        +visitDirectory(dir)
    }
    
    class BaseExporterTemplate {
        <<abstract>>
        +depth : int
        +output : string
        +visitDirectory(dir)
        +visitFile(file)
    }
    
    class EntryComponent {
        +accept(visitor)
    }
    
    BaseVisitor <|-- StatisticsVisitor : 繼承
    BaseVisitor <|-- FileSearchVisitor : 繼承
    BaseVisitor <|-- FinderVisitor : 繼承
    BaseVisitor <|-- BaseExporterTemplate : 繼承
    EntryComponent ..> BaseVisitor : 使用`,
            usageTitle: '業務邏輯解耦',
            usageDesc: '透過 accept 方法實現兩次分派 (Double Dispatch)。Entry 節點只需負責結構走訪，而具體的匯出、搜尋、甚至節點查找邏輯都封裝在不同的 Visitor 中。',
            usageCode: `// A. 統計全目錄容量與數量
const stats = new StatisticsVisitor();
root.accept(stats);
console.log(stats.getResults());

// B. 全域搜尋檔案
const searcher = new FileSearchVisitor("config");
root.accept(searcher);
console.log(searcher.foundIds);

// C. 查找特定節點及其父節點
const finder = new FinderVisitor("target-id");
root.accept(finder);`
        },
        {
            id: 'template',
            name: 'Template Method',
            stage: '3. 行為骨架',
            description: '封裝演算法骨架（如：遞迴走訪、層級縮排、字元脫逸），將具體實作交給子類別（如 XML、Markdown 格式匯出）。',
            mermaid: `classDiagram
    class BaseExporterTemplate {
        <<abstract>>
        +depth : int
        +output : string
        +visitDirectory(dir)
        +visitFile(file)
        +escape(text)
        +format(strings, ...values)
        #renderDirectoryStart(dir)*
        #renderDirectoryEnd(dir)*
        #renderFile(file)*
    }
    
    class MarkdownExporterTemplate {
        #renderDirectoryStart(dir)
        #renderFile(file)
    }

    class XmlExporterTemplate {
        #renderDirectoryStart(dir)
        #renderDirectoryEnd(dir)
        #renderFile(file)
    }
    
    BaseExporterTemplate <|-- MarkdownExporterTemplate : 繼承
    BaseExporterTemplate <|-- XmlExporterTemplate : 繼承`,
            usageTitle: '自動化縮排與內容脫逸',
            usageDesc: '基底類別的 `visit` 方法負責維護 `depth` (深度) 並自動插入縮排空白，確保輸出格式整齊；同時透過 `format` 標籤模板強制進行 `escape` (脫逸) 處理，防止如 XML 注入等安全隱患。',
            usageCode: `// 子類別只需專注於「單行內容」的定義
class XmlExporterTemplate extends BaseExporterTemplate {
    constructor() {
        const xmlMap = { '&': '&amp;', '<': '&lt;' }; // 注入 XML 專用脫逸表
        super(xmlMap, 2); // 指定縮排為 2 個空白
    }

    // 只需定義標籤，父類別 visit 會自動處理前方的縮排
    renderFile(file) {
        return this.format\`<File Name="\${file.name}" \${file.attributes} />\`;
    }

    renderDirectoryStart(dir) {
        return this.format\`<Directory Name="\${dir.name}">\`;
    }

    renderDirectoryEnd(dir) {
        return this.format\`</Directory>\`;
    }
}

const exporter = new XmlExporterTemplate();
root.accept(exporter);
console.log(exporter.getResult());`
        },
        {
            id: 'observer',
            name: 'Observer',
            stage: '4. 解耦通訊',
            description: '建立發佈-訂閱機制，讓核心邏輯（如 Visitor、Command）能在不耦合 UI 的情況下，透過介面同步狀態更新。',
            mermaid: `classDiagram
    class NotificationEvent {
        +source : EventSource
        +type : EventType
        +message : string
        +data : Payload
    }

    class IObserver {
        <<interface>>
        +update(event)*
    }

    class Subject {
        -observers : IObserver[]
        +subscribe(obs)
        +unsubscribe(obs)
        +notify(event)
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
    
    Subject o-- IObserver : 訂閱
    Subject ..> NotificationEvent : 廣播
    IObserver <|-- ConsoleObserver : 實作
    IObserver <|-- DashboardObserver : 實作`,
            usageTitle: '事件訂閱與廣播',
            usageDesc: '主體 (Subject) 不需知道觀察者 (Observer) 的具體實作，僅透過 notify 進行廣播，達成鬆散耦合。',
            usageCode: `// 1. 初始化 Subject
const subject = new Subject();

// 2. 準備不同功能的觀察者
const logger = new ConsoleObserver(entry => setLogs(prev => [...prev, entry]));
const dashboard = new DashboardObserver(stats => setProgress(stats), totalNodes);

// 3. 建立訂閱連結
subject.subscribe(logger);
subject.subscribe(dashboard);

// 4. 觸發通知
subject.notify({
    source: 'system',
    type: 'progress',
    message: '執行中...',
    data: { count: 1, total: 10 }
});`
        },
        {
            id: 'decorator',
            name: 'Decorator',
            stage: '5. 裝飾鏈條',
            description: '動態地為 Observer 附加額外行為 (如日誌樣式)，不修改原始 Observer 的程式碼，展現層層包裹的靈活性。',
            mermaid: `classDiagram
    class IObserver {
        <<interface>>
        +update(event)*
    }
    
    class BaseDecorator {
        <<abstract>>
        #wrapped : IObserver
        +update(event)*
        #isMatch(msg, kw)
    }

    class ConsoleObserver {
        -addLogFn
        +update(event)
    }
    
    class HighlightDecorator {
        -keyword : string | string[]
        -style : string
        +update(event)
    }

    class IconDecorator {
        -keyword : string | string[]
        -icon : string
        +update(event)
    }

    class BoldDecorator {
        -keyword : string | string[]
        +update(event)
    }
    
    IObserver <|-- ConsoleObserver : 實作
    IObserver <|-- BaseDecorator : 實作
    BaseDecorator <|-- HighlightDecorator : 繼承
    BaseDecorator <|-- IconDecorator : 繼承
    BaseDecorator <|-- BoldDecorator : 繼承
    BaseDecorator o-- IObserver : 包裝`,
            usageTitle: '物件行為疊加',
            usageDesc: '像俄羅斯套娃一樣層層包裹物件，每一層 Decorator 加入新的行為，且客戶端無需修改程式碼。',
            usageCode: `let obs = new ConsoleObserver();

// 1. 疊加顏色裝飾
obs = new HighlightDecorator(obs, 'Error', 'text-red-500');

// 2. 疊加圖標裝飾
obs = new IconDecorator(obs, 'Error', '⚠️');

// 3. 執行 (裝飾器鏈條會直接修改 event.message 內容)
obs.update({ message: 'Error occurred' });
// 最終 message: ⚠️ <span class="text-red-500">Error occurred</span>`
        },
        {
            id: 'adapter',
            name: 'Adapter',
            stage: '6. 介面轉換',
            description: '將不相容的事件資料 (NotificationEvent) 轉換為 UI 期待的格式 (Dashboard)，解決介面不對接問題。',
            mermaid: `classDiagram
    class NotificationEvent {
        <<Adaptee>>
        +source : EventSource
        +type : EventType
        +message : string
        +data : Payload
    }

    class DashboardAdapter {
        <<Adapter>>
        +name : string
        +count : number
        +total : number
        +type : string
        +constructor(event, total)
    }

    class DashboardObserver {
        <<Client>>
        -updateStatsFn
        +update(event)
    }

    DashboardObserver ..> NotificationEvent : 收到更新訊息
    DashboardObserver ..> DashboardAdapter : 建立並使用
    DashboardAdapter ..> NotificationEvent : 轉換自`,
            usageTitle: '資料形狀的橋接',
            usageDesc: '當「原始事件 (Adaptee)」與「UI 組件 (Target)」需要的資料模型不一致時，透過 Adapter 進行欄位映射（例如將 event.data.currentNode 轉向給 adapter.name）。',
            usageCode: `// 1. 原始事件 (Adaptee)
const event = { 
    data: { currentNode: 'Doc.pdf', count: 5, nodeType: 'file' } 
};

// 2. DashboardObserver 的內部程式碼 - 收到 event 後，透過 Adapter 進行轉換 (補全數據並重新映射欄位)
const adaptedData = new DashboardAdapter(event, 10);

console.log(adaptedData.name);  // "Doc.pdf" (對應自 currentNode)
console.log(adaptedData.total); // 10 (建構時傳入的補全數據)

// 3. 在 Observer 中整合 (誰在使用 Adapter)
const dashObs = new DashboardObserver(data => updateUI(data), 10);
dashObs.update(event);`
        },
        {
            id: 'command',
            name: 'Command',
            stage: '7. 行為物件化',
            description: '將操作封裝成物件,支援 Undo/Redo 功能,實現精確的歷史記錄管理。',
            mermaid: `classDiagram
    class BaseCommand {
        <<abstract>>
        +name : string
        +isUndoable : boolean
        +execute()*
        +undo()*
    }
    
    class DeleteCommand {
        -targetId : string
        -parentDir : DirectoryComposite
        -targetEntry : EntryComponent
        +execute()
        +undo()
    }
    
    class TagCommand {
        -tagMediator : TagMediator
        -fileId : string
        -labelName : string
        -isAttach : boolean
        +execute()
        +undo()
    }
    
    class CopyCommand {
        -component : EntryComponent
        +execute()
        +undo()
    }
    
    class CommandInvoker {
        +undoStack : BaseCommand[]
        +redoStack : BaseCommand[]
        -notifier : Subject
        +execute(cmd)
        +undo()
        +redo()
    }
    
    BaseCommand <|-- DeleteCommand : 繼承
    BaseCommand <|-- TagCommand : 繼承
    BaseCommand <|-- CopyCommand : 繼承
    CommandInvoker o-- BaseCommand : 管理歷程`,
            usageTitle: '行為物件化與復原系統',
            usageDesc: '透過將操作封裝成 Command 物件，Invoker 可以統一管理執行 (Execute)、復原 (Undo) 與重做 (Redo)，並透過 Subject 通知 UI 狀態變更。',
            usageCode: `// 1. 準備 Invoker
const invoker = new CommandInvoker();

// 2. 將 "刪除" 行為打包成物件 (尚未執行)
const deleteCmd = new DeleteCommand(fileId, parentDirectory);

// 3. 透過 Invoker 執行 (這會觸發 execute 並推入 undoStack)
invoker.execute(deleteCmd);

// 4. 將 "貼標籤" 行為打包
const tagCmd = new TagCommand(tagMediator, fileId, 'Urgent', true);
invoker.execute(tagCmd);

// 5. 復原上一步 (貼標籤 -> 取消貼標籤)
invoker.undo();

// 6. 再次復原 (刪除項目 -> 恢復項目)
invoker.undo();`
        },
        {
            id: 'strategy',
            name: 'Strategy',
            stage: '8. 策略注入',
            description: '定義排序演算法家族,讓排序規則 (名稱、大小、標籤) 可在執行時動態切換。',
            mermaid: `classDiagram
    class ISortStrategy {
        <<interface>>
        +sort(entries: EntryComponent[])*
    }

    class BaseStrategy {
        <<abstract>>
        +direction : "asc" | "desc"
        +sort(entries: EntryComponent[])*
    }
    
    class AttributeSortStrategy {
        +attribute : string
        +sort(entries: EntryComponent[])
    }
    
    class LabelSortStrategy {
        -tagMediator : TagMediator
        +sort(entries: EntryComponent[])
    }
    
    class DirectoryComposite {
        -activeStrategy : ISortStrategy
        +sort(strategy: ISortStrategy)
    }
    
    ISortStrategy <|-- BaseStrategy : 實作介面
    BaseStrategy <|-- AttributeSortStrategy : 繼承
    BaseStrategy <|-- LabelSortStrategy : 繼承
    DirectoryComposite o-- ISortStrategy : 使用策略`,
            usageTitle: '動態演算法切換',
            usageDesc: '將排序邏輯抽離成策略物件，讓目錄 (Context) 在執行時可以動態注入不同的排序規則，而不需修改目錄本身的程式碼。',
            usageCode: `// 1. 準備策略 A: 依標籤排序 (由小到大)
const tagStrategy = new LabelSortStrategy(tagMediator, 'asc');
root.sort(tagStrategy); // 目錄現在會按標籤排序

// 2. 準備策略 B: 依名稱排序 (由大到小)
const nameStrategy = new AttributeSortStrategy('name', 'desc');

// 3. 動態更換策略
root.sort(nameStrategy); // 瞬間切換排序行為

// 目錄 (DirectoryComposite) 內部只需呼叫 strategy.sort(this.children)`
        },
        {
            id: 'flyweight',
            name: 'Flyweight + Factory',
            stage: '9. 資源共享',
            description: '透過標籤工廠共享相同配色的標籤實體,減少記憶體開銷。',
            mermaid: `classDiagram
    class Label {
        +name : string
        +color : string
    }
    
    class LabelFactory {
        -labels : Map~string, Label~
        -colors : Record~string, string~
        +getLabel(name) : Label
    }
    
    LabelFactory ..> Label : 創建並共享快取實體
    LabelFactory o-- Label : 管理共享池`,
            usageTitle: '享元物件的共享快取',
            usageDesc: '標籤工廠會控管所有 Label 實體的建立。當請求同名的標籤時，直接回傳記憶體中已存在的實體，並自動套用預設色票。',
            usageCode: `// 1. 第一次請求 "Urgent": 工廠會 new 一個紅色標籤並快取
const urgent1 = labelFactory.getLabel('Urgent');

// 2. 第二次請求 "Urgent": 工廠直接從 Map 吐出同一個實體
const urgent2 = labelFactory.getLabel('Urgent');

// 3. 驗證：兩者指向同一個記憶體位址，達成節省記憶體開銷
console.log(urgent1 === urgent2); // true

// 4. 請求不同的名稱，則會建立新實體
const workLabel = labelFactory.getLabel('Work');`
        },
        {
            id: 'mediator',
            name: 'Mediator',
            stage: '10. 關係管理',
            description: '集中管理檔案與標籤的多對多關聯,避免物件間的網狀依賴,實現 O(1) 雙向查詢。',
            mermaid: `classDiagram
    class TagMediator {
        -fileToLabels : Map~ID, Set~
        -labelToFiles : Map~Name, Set~
        +attach(fileId, labelName)
        +detach(fileId, labelName)
        +getLabels(fileId) : Label[]
        +getFiles(labelName) : ID[]
    }
    
    class LabelFactory {
        +getLabel(name)
    }
    
    TagMediator ..> LabelFactory : 取得享元實體
    TagMediator ..> Label : 傳回繪製用的標籤`,
            usageTitle: '複雜關聯的集中化',
            usageDesc: '檔案不需要知道自己有哪些標籤，標籤也不需要知道有哪些檔案。所有的連線資訊都儲存在 Mediator 的雙向索引 (Index) 中。',
            usageCode: `// 1. 建立關連 (透過 Mediator 進行，不需改動 File 物件)
tagMediator.attach(file.id, 'Urgent');
tagMediator.attach(file.id, 'Work');

// 2. 正向查詢: 拿到的是結合了 Flyweight 顏色的標籤物件列表
const labels = tagMediator.getLabels(file.id); 
// Output: [{name: 'Urgent', color: 'bg-red-500'}, ...]

// 3. 反向查詢: 哪些檔案有 'Urgent' 標籤？ (O(1) 高效率)
const fileIds = tagMediator.getFiles('Urgent');
console.log(fileIds); // [file.id, ...]`
        },
        {
            id: 'singleton',
            name: 'Singleton',
            stage: '11. 全域狀態',
            description: '保證 Clipboard (剪貼簿) 在全應用程式中只有一個實例，並統一管理複製內容與通知。',
            mermaid: `classDiagram
    class Clipboard {
        -static instance : Clipboard
        -_content : EntryComponent
        +notifier : Subject
        -constructor()
        +static getInstance() : Clipboard
        +set(component)
        +get() : EntryComponent
        +hasContent() : boolean
        +clear()
    }

    class CopyCommand {
        <<Client>>
        +execute()
    }

    class PasteCommand {
        <<Client>>
        +execute()
    }

    CopyCommand ..> Clipboard : set() via getInstance()
    PasteCommand ..> Clipboard : get() via getInstance()
    `,
            usageTitle: '全域唯一存取點與副本機制',
            usageDesc: '保證剪貼簿實體在記憶體中只有一份。雖然實體唯一，但透過 get() 取出資料時會利用 Prototype 模式進行 clone，避免原始資料被外部意外修改。',
            usageCode: `// 1. 獲取全域唯一實體
const cb1 = Clipboard.getInstance();
cb1.set(sourceFile); // 存入一個檔案

// 2. 在應用的任何角落獲取，保證是同一個實例
const cb2 = Clipboard.getInstance();
console.log(cb1 === cb2); // true (同一個位址)

// 3. 取得內容 (內部實作了 .clone() 複製品)
const pastedFile = cb2.get(); 

// 4. 驗證：雖然內容相同，但參考位址不同 (安全複製品)
console.log(pastedFile === sourceFile); // false
console.log(pastedFile.name === sourceFile.name); // true`
        },
        {
            id: 'facade',
            name: 'Facade',
            stage: '12. 統一介面',
            description: '提供一個簡易的單一介面 (FileSystemFacade) 來操作複雜的子系統 (Command, Visitor, Mediator)，降低 Client 與系統的耦合度。',
            mermaid: `classDiagram
    class FileSystemFacade {
        -invoker : CommandInvoker
        -clipboard : Clipboard
        +root : EntryComponent
        +mediator : TagMediator
        +totalItems() : number
        +calculateSize(observers) : number
        +searchFiles(kw, observers) : ID[]
        +exportXml(observers) : string
        +tagItem(id, tag)
        +deleteItem(id)
        +undo() / redo()
        +copyItem(id) / pasteItem(target)
        +sortItems(attr, state) : SortState
        +findItem(id) / findParent(id)
    }

    class CommandInvoker {
        +execute(cmd)
        +undo() / redo()
    }
    
    class Clipboard {
        +set(content)
        +get()
    }
    
    class TagMediator {
        +attach(id, tag)
    }
    
    class DirectoryComposite {
        +accept(visitor)
    }

    FileSystemFacade --> CommandInvoker : 委派命令
    FileSystemFacade --> Clipboard : 操作剪貼簿
    FileSystemFacade --> TagMediator : 管理標籤
    FileSystemFacade --> DirectoryComposite : 持有 Root`,
            usageTitle: '高層次介面的簡化開發',
            usageDesc: 'Facade 隱藏了內部 Visitor、Command 與 Mediator 的複雜交互過程。Client 只需呼叫一個簡單的方法，後端會自動完成物件建立、Subject 訂閱與流程執行。',
            usageCode: `// 1. 初始化系統外觀 (一次性注入 Root)
const facade = new FileSystemFacade(rootDirectory);

// 2. 原本複雜的「搜尋」行為 (需手動處理 Visitor 與通知)
// 現在只需一行，還能傳入 Observer 自動建立日誌連線
const result = await facade.searchFiles('config', [consoleObserver]);

// 3. 原本需要多方協作的「刪除並支援復原」
// 內部會自動處理 FinderVisitor -> DeleteCommand -> Invoker
facade.deleteItem('file-123');
facade.undo(); // 直接呼叫 Facade 的 Undo 即可

// 4. 匯出 XML (隱藏了正確掛載 Template 的細節)
const xml = await facade.exportXml();`
        }
    ];

    const currentPattern = patterns.find(p => p.id === activeTab);

    return (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-left text-base">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2"><Layout className="text-blue-600" /> 設計模式：架構演進實戰地圖</h2>

            <div className="grid grid-cols-12 gap-6">
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

                <div className="col-span-8">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        {currentPattern && (
                            <div>
                                <h3 className="text-lg font-black text-slate-800 mb-4">{currentPattern.name} Pattern</h3>
                                <p className="text-slate-600 mb-4">{currentPattern.description}</p>

                                <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm">
                                    <h4 className="font-bold text-slate-800 mb-3 text-center">{currentPattern.name} Pattern UML</h4>
                                    <div className="mermaid" key={activeTab}>
                                        {currentPattern.mermaid}
                                    </div>
                                </div>

                                {currentPattern.usageCode && (
                                    <div className="mt-6 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-md">
                                        <div className="px-5 py-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                                            <div className="font-bold text-slate-200 flex items-center gap-2">
                                                <Code size={20} className="text-blue-400" /> {currentPattern.usageTitle || 'Usage Example'}
                                            </div>
                                            <span className="text-xs text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded">TypeScript</span>
                                        </div>
                                        <div className="p-5">
                                            {currentPattern.usageDesc && (
                                                <p className="text-slate-400 mb-4 text-sm leading-relaxed border-b border-slate-800 pb-4">
                                                    {currentPattern.usageDesc}
                                                </p>
                                            )}
                                            <CodeBlock code={currentPattern.usageCode} language="typescript" />
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
