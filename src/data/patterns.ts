import {
    Layout, Code, Workflow, Zap, Play, Activity, Component, Share2,
    RotateCcw, ArrowRightLeft, Boxes, DatabaseZap, Box, AppWindow,
    LayoutTemplate, LucideIcon
} from 'lucide-react';

export interface DesignPattern {
    id: string;
    name: string;        // 模式名稱 (e.g. "Composite + Prototype")
    chapter: string;     // 章節名稱 (e.g. "1. 結構與複製")
    description: string; // 簡短描述 (用於 DomainTab 列表)
    icon: LucideIcon;    // 圖示 (用於 CodeTab Dock)

    mermaid: string;     // UML 類別圖定義

    // DomainTab 的使用範例
    usage: {
        title: string;       // 情境標題 (e.g. "統一操作介面")
        description: string; // 情境描述
        code: string;        // 使用範例代碼
    };

    // CodeTab 的正反例對比
    comparison: {
        positiveTitle?: string; // 正面標題 (Default: Pattern Title)
        positive: string;       // 正面範例代碼
        negativeTitle?: string; // 反面標題 (Default: Anti/God Function)
        negative: string;       // 反面範例代碼 (God Function)
    };
}

export const patterns: DesignPattern[] = [
    {
        id: 'composite',
        name: 'Composite + Prototype',
        chapter: '1. 結構與複製',
        description: '定義檔案系統共通介面 (EntryComponent)，讓 Client 不需區分檔案與目錄，並實作 Prototype 模式讓可自我複製。',
        icon: Workflow,
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
        usage: {
            title: '統一操作介面',
            description: 'Client 因依賴抽象介面 EntryComponent，無需區分檔案或目錄，即可進行一致的操作。',
            code: `const dir = new DirectoryComposite('Root');
// 加入檔案
dir.add(new FileLeaf('Doc.pdf', 1024));
// 加入目錄 (Composite) - 操作完全相同
dir.add(new DirectoryComposite('SubFolder'));

// [Prototype] 複製整棵樹
const clone = dir.clone();
console.log(clone !== dir); // true (新的實體)
console.log(clone.name);   // "Root" (狀態相同)`
        },
        comparison: {
            positive: `// 正面：結構遞迴與自我複製 (多型注入，只認抽象介面 EntryComponent)
abstract class EntryComponent {
  public id: string,
  public name: string,
  // ...
}

class DirectoryComposite extends EntryComponent {
  // [Composite] 核心：不論子節點是檔案(各類型檔案，例：Image、Word、Text)或目錄，操作一致。
  public add(component: EntryComponent): void {
    this.#children.push(component);
    this.#applySort();
  }

  // [Prototype] 核心：對象自己負責複製邏輯，外部不需知細節。
  public clone(): DirectoryComposite {
    // 特別注意：雖然是複製，但 id 要用全新的 uuid()，因為即使複製，id 也是唯一的 
    // 還有一些屬性的細節，只有自身會知道。所以由自身實作最適合
    const newDir = new DirectoryComposite(uuid(), this.name);
    // 遞迴複製所有子節點
    this.#children.forEach(c => newDir.add(c.clone()));
    return newDir;
  }
}`,
            negative: `// 反面：硬編碼類型與外部手動遞迴複製
class Directory {
  // 痛點：每加一型就要改核心 (addFile, addDir...)
  public addFile(f: File): void { ... }
  public addDir(d: Directory): void { ... }
  public addImage(i: Image): void { ... } // 痛點：每加一型就要改核心
  public addWord(doc: WordDoc): void { ... } // 痛點：不斷膨脹
  // Directory 淪為類型檢查的垃圾場。
}

// 外部複製邏輯 (Manual Construction)
function cloneDir(orig: any): any {
  const copy = new Directory(orig.name);
  orig.children.forEach((c: any) => {
    // 痛點 1：【類型判斷】外部必須認識所有具體類別 (Image, Word...)，每加一種就多一個 if
    if(c.isDir) copy.addDir(cloneDir(c));
    // 痛點 2：【屬性依賴】外部必須知道每個類別的「配方」，漏掉長寬或頁數就複製出半殘物件
    else if(c.type === 'image') copy.addImage(new Image(c.name, c.width, c.height));
    else if(c.type === 'word') copy.addFile(new WordDoc(c.name, c.pageCount));
  });
  return copy;
}`
        }
    },
    {
        id: 'visitor',
        name: 'Visitor',
        chapter: '2. 行為分離',
        description: '將操作邏輯 (統計、搜尋、Finder) 從資料結構中分離,實現插件化擴展。',
        icon: Zap,
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
        usage: {
            title: '業務邏輯解耦',
            description: '透過 accept 方法實現兩次分派 (Double Dispatch)。Entry 節點只需負責結構走訪，而具體的匯出、搜尋、甚至節點查找邏輯都封裝在不同的 Visitor 中。',
            code: `// A. 統計全目錄容量與數量
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
        comparison: {
            positive: `// 正面：行為插件化，結構不需要改動
// 只要實施 accept，就能動態注入不同功能 (搜尋、匯出、統計)
root.accept(new XmlExporterTemplate());

// 不用修改結構，無痛就可以支援搜尋功能
root.accept(new FileSearchVisitor("API"));

// 關鍵實作：結構類別，定義 accept 介面
abstract class EntryComponent {
  // 將「被拜訪」的權力交給外部插件
  public abstract accept(visitor: IVisitor): void;
}`,
            negative: `// 反面：將所有邏輯塞進資料結構 (O(N) Traversal Hell)
class Directory {
  // 痛點 1：每次想要加新功能 (XML、搜尋、大小統計)，
  // 痛點 2：不寫在 Directory 內，而是寫在外部，不停的寫遞迴，
  exportXML(): string { ... }
  search(keyword: string): string[] { ... }
  calculateSize(): number { ... }
}

// 或者以外部 function 手動撰寫重複的遞迴遍歷
function exportXML(node) {
  if(node.isDir) node.children.forEach(c => exportXML(c));
  else handleXML(node); // 痛點 3：重複遞迴遍歷
}
`
        }
    },
    {
        id: 'template',
        name: 'Template Method',
        chapter: '3. 行為骨架',
        description: '封裝演算法骨架（如：遞迴走訪、層級縮排、字元脫逸），將具體實作交給子類別（如 XML、Markdown 格式匯出）。',
        icon: LayoutTemplate,
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
        usage: {
            title: '自動化縮排與內容脫逸',
            description: '基底類別的 `visit` 方法負責維護 `depth` (深度) 並自動插入縮排空白，確保輸出格式整齊；同時透過 `format` 標籤模板強制進行 `escape` (脫逸) 處理，防止如 XML 注入等安全隱患。',
            code: `// 子類別只需專注於「單行內容」的定義
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
        comparison: {
            positive: `// 正面：封裝不變流程 (走訪)，開放變化細節 (標籤格式)
abstract class BaseExporterTemplate extends BaseVisitor {
  // [Template Method] 實作 Visitor 的遞迴走訪、但多加處理縮排深度、字元脫逸等細節。
  public visitDirectory(dir: DirectoryComposite): void {
    this.output += this.renderDirectoryStart(dir); // Hook 1: 開始
    this.depth++;
    dir.getChildren().forEach(c => c.accept(this)); // 共通：遞迴走訪
    this.depth--;
    this.output += this.renderDirectoryEnd(dir);   // Hook 2: 結束
  }
  
  // 留給子類別 XML / Markdown 實作的變化點，只回傳格式，不用處理縮排、字元脫逸
  protected abstract renderDirectoryStart(dir: DirectoryComposite): string;
  protected abstract renderDirectoryEnd(dir: DirectoryComposite): string;
}`,
            negative: `// 反面：格式邏輯與走訪邏輯強烈耦合
let xmlResult = ""; // 痛點：外洩的狀態，容易造成污染
function exportToXml(node, depth) {
  // 痛點：每個格式都要手動算縮排
  const indent = " ".repeat(depth * 2); 
  xmlResult += \`\${indent}<\${node.tag}>\\n\`; 
  // 痛點：遞迴參數越來越多，還要手動傳遞狀態
  node.children.forEach(c => { exportToXml(c, depth + 1); });
  xmlResult += \`\${indent}</\${node.tag}>\\n\`;
}

// 痛點：複製貼上走訪代碼，再寫一次 for Markdonw，違反 DRY 原則
function exportToMarkdown(dir: any): string {
  // 實作輸出 Markdown 格式
}
`
        }
    },
    {
        id: 'observer',
        name: 'Observer',
        chapter: '4. 解耦通訊',
        description: '建立發佈-訂閱機制，讓核心邏輯（如 Visitor、Command）能在不耦合 UI 的情況下，透過介面同步狀態更新。',
        icon: Activity,
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
        usage: {
            title: '事件訂閱與廣播',
            description: '主體 (Subject) 不需知道觀察者 (Observer) 的具體實作，僅透過 notify 進行廣播，達成鬆散耦合。',
            code: `// 1. 初始化 Subject
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
        comparison: {
            positive: `// 正面：通知器廣播機制，UI 與核心完全解耦
class FileSearchVisitor implements IVisitor {
  private notifier: Subject = new Subject(); // 使用組合 (Has-a) Observer Pattern
  public visitFile(f: File): void {
    if (f.name.includes(this.keyword)) {
      // 任務物件不須認識 UI 組件，只需廣播「我找到了」
      this.notifier.notify({ msg: \`找到: \${f.name}\` });
    }
  }
}`,
            negative: `// 反面：商業邏輯直接呼叫 UI 狀態 (Coupled)
function search(node: any, kw: string): void {
  if (node.name.includes(kw)) {
    // 痛點：核心算法中混雜 React State，無法由終端機或其他框架複用
    setReactState(\`搜尋中: \${node.name}\`);
    // 痛點：直接操作 DOM，無法由終端機或其他框架複用。綁定太深
    document.getElementById('status')!.innerText = '...';
  }
}`
        }
    },
    {
        id: 'decorator',
        name: 'Decorator',
        chapter: '5. 裝飾鏈條',
        description: '動態地為 Observer 附加額外行為 (如日誌樣式)，不修改原始 Observer 的程式碼，展現層層包裹的靈活性。',
        icon: Component,
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
        usage: {
            title: '物件行為疊加',
            description: '像俄羅斯套娃一樣層層包裹物件，每一層 Decorator 加入新的行為，且客戶端無需修改程式碼。',
            code: `let obs = new ConsoleObserver();

// 1. 疊加顏色裝飾
obs = new HighlightDecorator(obs, 'Error', 'text-red-500');

// 2. 疊加圖標裝飾
obs = new IconDecorator(obs, 'Error', '⚠️');

// 3. 執行 (裝飾器鏈條會直接修改 event.message 內容)
obs.update({ message: 'Error occurred' });
// 最終 message: ⚠️ <span class="text-red-500">Error occurred</span>`
        },
        comparison: {
            positive: `// 正面：多維度裝飾，動態組合行為
let observer: IObserver = new ConsoleObserver(addLog);
// 維度疊加：先加圖標，再加顏色
observer = new IconDecorator(observer, '[Command]', '⚡');
observer = new IconDecorator(observer, '刪除', '⛔');
observer = new HighlightDecorator(observer, '[Error]', 'text-red-400');

class HighlightDecorator extends BaseDecorator {
  public override update(event: NotificationEvent): void {
    // 1. 符合條件，裝飾訊息
    if (this.isMatch(event.message, this.keyword)) {
      event.message = \`<span class="\${this.style}">\${event.message}</span>\`;
    }
    // 2. 繼續傳遞給下一個裝飾者
    this.wrapped.update(event);
  }  
}`,
            negative: `// 反面：企圖用一堆參數來控制所有樣式，結果邏輯互相打架。
function notify(msg: string, action: number, level: string, withIcon: boolean) {
  // 痛點：邏輯耦合，宣告所有可能用到的變數
  let prefix = "";
  let color = "text-gray-500";

  // 痛點：巢狀地獄開始了...
  if (level === 'error') {
    color = "text-red-500";
    if (action === 1) prefix = "⚡";
    else if (action === 2) prefix = "↩️";
    if (withIcon) prefix += "❌ ";
  } else if (level === 'warning') {
    color = "text-yellow-500";
    // 略…
  }
}`
        }
    },
    {
        id: 'adapter',
        name: 'Adapter',
        chapter: '6. 介面轉換',
        description: '將不相容的事件資料 (NotificationEvent) 轉換為 UI 期待的格式 (Dashboard)，解決介面不對接問題。',
        icon: Share2,
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
        usage: {
            title: '資料形狀的橋接',
            description: '當「原始事件 (Adaptee)」與「UI 組件 (Target)」需要的資料模型不一致時，透過 Adapter 進行欄位映射（例如將 event.data.currentNode 轉向給 adapter.name）。',
            code: `// 1. 原始事件 (Adaptee)
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
        comparison: {
            positive: `// 正面：透過轉接器橋接原始資料與 UI 期待
class DashboardAdapter {
  constructor(event: NotificationEvent, total: number) {
    // 適配動作：重新映射欄位
    this.name = event.data?.currentNode || '-';
    this.total = total; // 補全資料
  }
}

class DashboardObserver implements IObserver {
  update(event: NotificationEvent) {
    // 將原始 NotificationEvent 轉換成 UI 需要的格式
    const stats = new DashboardAdapter(event, this.total);
    this.updateStatsFn(stats); // UI 仍是接收到自己的格式 name / total
  }
}`,
            negative: `// 反面：UI 依賴實作細節 (Coupled to Implementation)

// 痛點 1：UI 遷就於資料來源的設計
// 因為後端傳 event 過來，UI 就只好設計成接收 event，而不是設計成接收它真正需要的 { name, total }
function MonitorDashboard({ event }: { event: any }) {

  // 痛點 2：洩漏的底層知識 (Leaky Abstraction)
  // UI 元件本不該知道資料是存在 data.currentNode 還是 payload.title。
  const name = event?.data?.currentNode ?? 'N/A';
  
  // 痛點 3：要求後端配合 UI 也不對 (Polluting Domain Model)
  // 若反過來要求後端 API 直接回傳 UI 格式 (View Model)，
  // 後端將不再純粹，無法複用於 Mobile App 或其他場景。

  return <div className="card">{name}</div>;
}`
        }
    },
    {
        id: 'command',
        name: 'Command',
        chapter: '7. 行為物件化',
        description: '將操作封裝成物件,支援 Undo/Redo 功能,實現精確的歷史記錄管理。',
        icon: RotateCcw,
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
        usage: {
            title: '行為物件化與復原系統',
            description: '透過將操作封裝成 Command 物件，Invoker 可以統一管理執行 (Execute)、復原 (Undo) 與重做 (Redo)，並透過 Subject 通知 UI 狀態變更。',
            code: `// 1. 準備 Invoker
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
        comparison: {
            positive: `// 正面：將動作打包成可紀錄、可復原的物件
class DeleteCommand implements ICommand {
  private backup: EntryComponent | undefined;
  public execute(): void {
    this.backup = this.dir.getChildren().find(c => c.id === this.id);
    this.dir.remove(this.id);
  }
  public undo(): void {
    // 被打包後，動作就具備了「反向」執行的能力
    if (this.backup) this.dir.add(this.backup);
  }
}
commandInvoker.execute(new DeleteCommand(id, dir));
// 需要時可以回復
commandInvoker.undo();
`,
            negative: `// 反面：分散的邏輯與昂貴的快照 (Scattered Logic & Expensive Snapshots)
// 痛點 1：邏輯散落在各個 Button Click Handler
function onDeleteClick(id: string) {
  // 為了 Undo，只能硬幹：備份整份文件狀態
  // 記憶體殺手：O(N) 的備份成本
  const previousState = JSON.parse(JSON.stringify(dir));
  undoStack.push(previousState);
  // 直接操作：破壞性的變更
  dir.removeItem(id);
}

// 痛點 2：無法統一管理「所有操作」
function onPasteClick(targetId: string) {
  // 每個操作都要自己手寫備份邏輯，容易漏寫或寫錯。
  // 複製貼上邏輯混在 UI 裡...
}`
        }
    },
    {
        id: 'strategy',
        name: 'Strategy',
        chapter: '8. 策略注入',
        description: '定義排序演算法家族,讓排序規則 (名稱、大小、標籤) 可在執行時動態切換。',
        icon: ArrowRightLeft,
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
        usage: {
            title: '動態演算法切換',
            description: '將排序邏輯抽離成策略物件，讓目錄 (Context) 在執行時可以動態注入不同的排序規則，而不需修改目錄本身的程式碼。',
            code: `// 1. 準備策略 A: 依標籤排序 (由小到大)
const tagStrategy = new LabelSortStrategy(tagMediator, 'asc');
root.sort(tagStrategy); // 目錄現在會按標籤排序

// 2. 準備策略 B: 依名稱排序 (由大到小)
const nameStrategy = new AttributeSortStrategy('name', 'desc');

// 3. 動態更換策略
root.sort(nameStrategy); // 瞬間切換排序行為

// 目錄 (DirectoryComposite) 內部只需呼叫 strategy.sort(this.children)`
        },
        comparison: {
            positive: `// 正面：動態注入演算策略，演算法與執行者解耦

// 抽換策略物件，但 Command 本身不需要修改
const s1: ISortStrategy = new LabelSortStrategy(tagManager);

const s2: ISortStrategy = new AttributeSortStrategy('name');

// 依需求，動態注入策略，可達到不同的排序結果
commandInvoker.execute(new SortCommand(root, s2));`,
            negative: `// 反面：參數混亂與條件地獄
// 痛點 1：為了支援「依標籤排序」，傳入 tagManager。函式簽名「有時需要、有時不需要」的參數，調用端困惑。
function sort(nodes: any[], type: 'name' | 'tag', tagManager?: any) {
  // 痛點 2：條件地獄...無限增長的 if-else
  if (type === 'name') {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
  } else if (type === 'size') { 
  } else if (type === 'tag') {
    if (!tagManager) throw new Error("Missing dependency");
    nodes.sort((a, b) => tagManager.getRank(a) - tagManager.getRank(b));
  }
}`
        }
    },
    {
        id: 'flyweight',
        name: 'Flyweight + Factory',
        chapter: '9. 資源共享',
        description: '透過標籤工廠共享相同配色的標籤實體,減少記憶體開銷。',
        icon: Boxes,
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
        usage: {
            title: '享元物件的共享快取',
            description: '標籤工廠會控管所有 Label 實體的建立。當請求同名的標籤時，直接回傳記憶體中已存在的實體，並自動套用預設色票。',
            code: `// 1. 第一次請求 "Urgent": 工廠會 new 一個紅色標籤並快取
const urgent1 = labelFactory.getLabel('Urgent');

// 2. 第二次請求 "Urgent": 工廠直接從 Map 吐出同一個實體
const urgent2 = labelFactory.getLabel('Urgent');

// 3. 驗證：兩者指向同一個記憶體位址，達成節省記憶體開銷
console.log(urgent1 === urgent2); // true

// 4. 請求不同的名稱，則會建立新實體
const workLabel = labelFactory.getLabel('Work');`
        },
        comparison: {
            positive: `// 正面：工廠控管實體，達成資源共享

// 1. 取得唯一實體 (Flyweight)，標籤實體全域共享
const label1 = LabelFactory.getLabel('Urgent');
// 2. 統一都由工廠，取得標籤
const label2 = LabelFactory.getLabel('Work');
// 3. 關鍵實作：統一由工廠取得實體
class LabelFactory {
  private static labels: Record<string, Label> = {};
  public static getLabel(name: string): Label {
    if(!this.labels[name]) {
      this.labels[name] = new Label(name, "bg-blue-500");
    }
    return this.labels[name]; // 共享記憶體中的同一個實體
  }
}`,
            negative: `// 反面：無限制的 new 記憶體浪費

// 痛點 1：重複實例化 (Memory Leak)
file1.tags.push(new Label('Urgent', 'bg-red-500'));
file1.tags.push(new Label('Work', 'bg-blue-500'));

// 痛點 2：每次使用者又選不同的檔案就會 new 一次 Label。
fileX.tags.push(new Label('Urgent', 'bg-red-500'));
fileX.tags.push(new Label('Personal', 'bg-green-500'));

// 痛點：若 1000 個檔案標註 Urgent，就 new 了 1000 次。
// 記憶體浪費嚴重，且無法統一管理標籤外觀。`
        }
    },
    {
        id: 'mediator',
        name: 'Mediator',
        chapter: '10. 關係管理',
        description: '集中管理檔案與標籤的多對多關聯,避免物件間的網狀依賴,實現 O(1) 雙向查詢。',
        icon: DatabaseZap,
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
        usage: {
            title: '複雜關聯的集中化',
            description: '檔案不需要知道自己有哪些標籤，標籤也不需要知道有哪些檔案。所有的連線資訊都儲存在 Mediator 的雙向索引 (Index) 中。',
            code: `// 1. 建立關連 (透過 Mediator 進行，不需改動 File 物件)
tagMediator.attach(file.id, 'Urgent');
tagMediator.attach(file.id, 'Work');

// 2. 正向查詢: 拿到的是結合了 Flyweight 顏色的標籤物件列表
const labels = tagMediator.getLabels(file.id); 
// Output: [{name: 'Urgent', color: 'bg-red-500'}, ...]

// 3. 反向查詢: 哪些檔案有 'Urgent' 標籤？ (O(1) 高效率)
const fileIds = tagMediator.getFiles('Urgent');
console.log(fileIds); // [file.id, ...]`
        },
        comparison: {
            positive: `// 正面：中介者管理多對多關聯，避免網狀依賴

// 1. 透過中介者貼標籤，不污染 File 物件。
tagMediator.attach(file.id, label.name);
// 2. 反向查詢：不用遞迴，O(1) 取得所有 "Work" 檔案
const files = tagMediator.getFiles('Work');

// 3. 關鍵實作：透過中介者介面，建立雙向映射表
class TagMediator {
  constructor() {
    this.labelToFiles = new Map(); // 反向索引技術
  }
  attach(id, name) { this.labelToFiles.get(name).add(id); }
  getFiles(name) { return this.labelToFiles.get(name); }
}`,
            negative: `// 反面：屬性入侵與暴力掃描 (O(N))

// 1. 直接修改檔案類別結構 (汚染 - 檔案應該只負責檔案的事情，無 tags 屬性)
file.tags = [];

// 2. 直接貼到該檔案的 tags 陣列中 (汚染)
file.tags.push(new Label('Work', 'bg-blue-500'));
file.tags.push(new Label('Urgent', 'bg-red-500'));

// 痛點：如果要查詢「哪些檔案貼了 Work」？
const results = files.filter(f => f.tags.includes('Work'));

// 災難：這是一個 O(N) 暴力掃描。又要再遞迴遍歷所有檔案。`
        }
    },
    {
        id: 'singleton',
        name: 'Singleton',
        chapter: '11. 全域狀態',
        description: '保證 Clipboard (剪貼簿) 在全應用程式中只有一個實例，並統一管理複製內容與通知。',
        icon: Box,
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
        usage: {
            title: '全域唯一存取點與副本機制',
            description: '保證剪貼簿實體在記憶體中只有一份。雖然實體唯一，但透過 get() 取出資料時會利用 Prototype 模式進行 clone，避免原始資料被外部意外修改。',
            code: `// 1. 獲取全域唯一實體
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
        comparison: {
            positive: `// 正面：唯一入口，保證狀態全域一致

// 1. 禁止直接 new，會拋出錯誤
const c1 = new Clipboard(); // Error!

// 2. 只能透過靜態方法取得唯一實體
const c2 = Clipboard.getInstance();

// 3. 關鍵實作：只允許一個靜態實體
class Clipboard {
  private static instance: Clipboard | null = null;
  // 私有建構，禁止外部 new，保護單例完整性
  private constructor() {} 
  // 靜態方法，提供唯一入口
  public static getInstance(): Clipboard {
    if (!this.instance) this.instance = new Clipboard();
    return this.instance;
  }
}`,
            negative: `// 反面：多個實例導致狀態不同步
// 1. Toolbar 元件自己 new 一個
class Toolbar {
  onCopy(file) {
    const cb = new Clipboard(); // 實體 A
    cb.set(file);
  }
}

// 2. ContextMenu 元件也自己 new 一個
class ContextMenu {
  onPaste() {
    const cb = new Clipboard(); // 實體 B
    const item = cb.get(); // null! 兩個剪貼簿不互通
  }
}

// 3. 解決方案？Props Drilling 地獄，只能被迫把 instance 從最上層一路傳下來...
// <App clipboard={cb}>`
        }
    },
    {
        id: 'facade',
        name: 'Facade',
        chapter: '12. 統一介面',
        description: '提供一個簡易的單一介面 (FileSystemFacade) 來操作複雜的子系統 (Command, Visitor, Mediator)，降低 Client 與系統的耦合度。',
        icon: AppWindow,
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
        usage: {
            title: '高層次介面的簡化開發',
            description: 'Facade 隱藏了內部 Visitor、Command 與 Mediator 的複雜交互過程。Client 只需呼叫一個簡單的方法，後端會自動完成物件建立、Subject 訂閱與流程執行。',
            code: `// 1. 初始化系統外觀 (一次性注入 Root)
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
        },
        comparison: {
            positive: `// 正面：外觀模式 (Facade) - 封裝複雜性與統一入口
class FileSystemFacade {
  constructor(root) {
    // 1. 整合檔案管理功能
    this.root = root;
    this.invoker = commandInvokerInstance;
    this.mediator = tagMediator;
    this.clipboard = Clipboard.getInstance();
  }

  // --- Visitor: 唯讀分析 (隱藏 accept/visitor 細節) ---
  async searchFiles(keyword) {
    const visitor = new FileSearchVisitor(keyword);
    await this._runVisitor(visitor);
    return visitor.foundIds;
  }
  async calculateSize() {
    const visitor = new StatisticsVisitor();
    await this._runVisitor(visitor);
    return visitor.totalSize;
  }
  async exportXml() {
    const visitor = new XmlExporterTemplate();
    await this._runVisitor(visitor);
    return visitor.xml;
  }

  // --- Command: 狀態變更 (封裝建構參數) ---
  deleteItem(id) {
    const parent = this.findParent(id); // 內部查找父節點
    if (parent) this.invoker.execute(new DeleteCommand(id, parent));
  }
  tagItem(id, label) {
    this.invoker.execute(new TagCommand(this.mediator, id, label));
  }
  copyItem(id) {
    this.invoker.execute(new CopyCommand(id, this.root));
  }
  pasteItem(targetId) {
    const target = this.findItem(targetId);
    if (this.clipboard.hasContent()) {
      this.invoker.execute(new PasteCommand(target));
    }
  }
  undo() { this.invoker.undo(); }
  redo() { this.invoker.redo(); }

  // --- Strategy: 策略選擇 (自動判斷) ---
  sortItems(attr) {
    const strategy = (attr === 'label')
      ? new LabelSortStrategy(this.mediator)
      : new AttributeSortStrategy(attr);
    this.invoker.execute(new SortCommand(this.root, strategy));
  }

  // --- Helpers (內部邏輯封裝) ---
  findItem(id) {
    const visitor = new FinderVisitor(id);
    this.root.accept(visitor);
    return visitor.foundSelf;
  }
}`,
            negative: `// 反面：上帝函式 (麵條式代碼)
let files = []; // 全域變數，以陣列記錄樹狀結構

// 反面教材：上帝函式 (God Function) - 所有邏輯混雜在一個迴圈
function godProcessing(type, args) {
  // [Observer] 耦合 UI，每多一個 UI 要更新，這裏就得再改
  const updateUI = (msg) => document.getElementById('status').innerText = msg;
  let result = (type === 'size') ? 0 : (type === 'xml') ? '<root>' : [];

  // 試圖用一個通用迴圈處理所有邏輯 (The "One Loop" Fallacy)
  function traverse(nodes, depth) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      // 0. [Observer] 耦合 UI，其實還要判斷那些 type, args 才需要更新
      updateUI(\`Processing \${ node.name }...\`);

      // 1. [Visitor] 搜尋 (依賴 type 變數判斷)
      if (type === 'search' && node.name.includes(args.kw)) result.push(node);

      // 2. [Visitor] XML 匯出
      else if (type === 'xml') result += \`& lt;node name = "\${node.name}" & gt; \`;

      // 3. [Visitor] 計算大小
      else if (type === 'size' && node.type === 'file') result += node.size;

      // 4. [Command] 刪除 (直接修改陣列，非常危險)
      else if (type === 'delete' && node.id === args.id) {
        nodes.splice(i, 1); i--; // 恐怖的索引操作
      }

      // 5. [Mediator] 貼標籤 (直接修改物件屬性)
      else if (type === 'tag' && node.id === args.id) {
        if (!node.tags) node.tags = []; node.tags.push(args.label);
      }
        
      // 6. [Strategy] 排序 (僵化)
      else if (type === 'sort' && node.children) {
        if (args.attr === 'name') node.children.sort((a,b) => a.name.localeCompare(b.name));
        else if (args.attr === 'size') node.children.sort((a,b) => a.size - b.size);
        else if (args.attr === 'tag') node.children.sort((a,b) => (a.tags?.[0] || '').localeCompare(b.tags?.[0] || ''));
        // 每次新增一種排序都要改核心代碼 (違反 OCP)
      }

      // 7. [Singleton] 複製 (全域變數污染)
      else if (type === 'copy' && node.id === args.id) {
        window.tempClipboard = JSON.parse(JSON.stringify(node)); // 隨便掛在 window
      }
      else if (type === 'paste' && node.id === args.parentId) {
        if (window.tempClipboard) node.children.push(window.tempClipboard);
      }
        
      // [Recursion] 遞迴邏輯也混在一起
      if (node.children) {
        traverse(node.children, depth + 1);
        if (type === 'xml') result += \`&lt;/node&gt;\`;
      }
    }
  }
  traverse(files, 0);
  return type === 'xml' ? result + '&lt;/root&gt;' : result;
}`
        }
    }
];
