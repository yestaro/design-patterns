import React, { useState, useEffect } from 'react';
import { Layout } from 'lucide-react';
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
        // Re-render all mermaid diagrams when tab changes
        const renderDiagrams = async () => {
            // 清除之前的渲染
            const mermaidElements = document.querySelectorAll('.mermaid');
            mermaidElements.forEach(el => {
                el.removeAttribute('data-processed');
            });

            // 重新渲染
            await mermaid.run({
                querySelector: '.mermaid',
            });
        };

        renderDiagrams();
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
    DirectoryComposite o-- EntryComponent : 組合`
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
    EntryComponent ..> BaseVisitor : 使用`
        },
        {
            id: 'observer',
            name: 'Observer',
            stage: '3. 解耦通訊',
            description: '建立發布-訂閱機制,不耦合 UI 組件 (Console、Dashboard)，獨立發佈業務的狀態變化。',
            mermaid: `classDiagram
    class Subject {
        -observers[]
        +subscribe(obs)
        +unsubscribe(obs)
        +notify(data)
    }
    
    class BaseObserver {
        <<abstract>>
        +update(data)*
    }
    
    class ConsoleObserver {
        -addLogFn
        +update(data)
    }
    
    class DashboardObserver {
        -updateStatsFn
        -total
        +update(data)
    }
    
    Subject o-- BaseObserver : 持有
    BaseObserver <|-- ConsoleObserver : 繼承
    BaseObserver <|-- DashboardObserver : 繼承`
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
    LabelFactory o-- Label : 管理`
        },
        {
            id: 'singleton',
            name: 'Singleton',
            stage: '5. 全域狀態',
            description: '保證 Clipboard (剪貼簿) 在全應用程式中只有一個實例，並統一管理複製內容。',
            mermaid: `classDiagram
    class Clipboard {
        -instance
        -_content
        +notifier
        +set(component)
        +get()
        +hasContent()
        +clear()
    }
    
    class Singleton {
        <<pattern>>
    }

    Clipboard --|> Singleton : 實作`
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
    TagMediator ..> EntryComponent : 管理關聯`
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
    CommandInvoker o-- BaseCommand : 管理`
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
    DirectoryComposite ..> BaseStrategy : 使用`
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
                    <div className="overflow-hidden rounded-2xl border-2 border-slate-200">
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
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DomainTab;
