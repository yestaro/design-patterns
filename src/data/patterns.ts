import {
  Activity,
  AppWindow,
  Box,
  Command,
  Component,
  LayoutTemplate,
  LucideIcon,
  Plug2,
  RefreshCcwDot,
  Share2,
  Tags,
  Workflow,
  Zap,
} from "lucide-react";

export interface DesignPattern {
  id: string;
  name: string; // 模式名稱 (e.g. "Composite + Prototype")
  chapter: string; // 章節名稱 (e.g. "1. 結構與複製")
  description: string; // 簡短描述 (用於 DomainTab 列表)
  icon: LucideIcon; // 圖示 (用於 CodeTab Dock)
  themeColor: string; // 模式主題色 (e.g. "amber", "emerald", 不含 500 等亮度數值)

  mermaid: string; // UML 類別圖定義
  sequence?: string; // UML 序列圖定義 (關鍵流程)

  // DomainTab 的使用範例
  usage: {
    title: string; // 情境標題 (e.g. "統一操作介面")
    description: string; // 情境描述
    code: string; // 使用範例代碼
  };

  // CodeTab 的正反例對比
  comparison: {
    positiveTitle?: string; // 正面標題 (Default: Pattern Title)
    positive: string; // 正面範例代碼
    negativeTitle?: string; // 反面標題 (Default: Anti/God Function)
    negative: string; // 反面範例代碼 (God Function)
  };
}

export const patterns: DesignPattern[] = [
  {
    id: "composite",
    name: "Composite + Prototype",
    chapter: "結構與複製",
    description:
      "定義共通介面 (EntryComponent)，讓 Client 不需區分檔案或目錄，並實作 Clone 自我複製。",
    icon: Workflow,
    themeColor: "amber",
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
    EntryComponent <|-- PlainText : 繼承
    DirectoryComposite o-- EntryComponent : 組合
    DirectoryComposite ..> ISortStrategy : 使用`,
    sequence: `sequenceDiagram
    autonumber
    participant Client as FileSystemFacade
    participant Dir as DirectoryComposite
    participant Comp as child: EntryComponent (Directory/Word/Image/PlainText)
    
    Note over Client, Comp: 【統一操作：增刪與管理】
    Client->>Dir: add(EntryComponent)
    Note over Dir, Comp: 不論是目錄或任何檔案類型，均視為抽象基底
    Client->>Dir: remove(id)
    
    Note over Client, Comp: 【階層複製：遞迴與多型】
    Client->>Dir: clone()
    loop 對每個 child 子節點
        Dir->>Comp: clone()
        Note right of Dir: 觸發多型，複製自身屬性與子節點
        Comp-->>Dir: 返回複本實體
    end
    Dir-->>Client: 返回完整階層複本`,
    usage: {
      title: "統一操作介面",
      description:
        "Client 因依賴抽象介面 EntryComponent，無需區分檔案或目錄，即可進行一致的操作。",
      code: `/* ------ 1. FileSystemFacade.ts (Composite 樹狀結構建構) ------ */
public static getSampleRoot(): EntryComponent {
    const root = new DirectoryComposite('root', '我的根目錄', '2025-01-01');
    const d1 = new DirectoryComposite('d1', '專案文件', '2025-01-10');

    // 統一介面：對目錄新增實體檔案與子目錄，Client 操作完全一致
    d1.add(new WordDocument('f1', '產品開發規畫.docx', 500, '2025-01-10', 35));
    d1.add(new ImageFile('f2', '架構設計圖.png', 2048, '2025-01-10', 1920, 1080));
    root.add(d1);
    // ...更多檔案
    return root;
}

/* ------ 2. Singleton.ts (Prototype 自我複製的實際應用) ------ */
// 當 ExplorerTab 呼叫貼上時，會從統一的 Clipboard 取出節點。
// 為了避免 Call by reference 修改到原始物件，這裡運用了 Prototype 模式
public get(): EntryComponent | null {
    if (!this._content) return null;
    
    // .clone() 把複製自己欄位的責任交還給元件本身（各有所異，如 Word 的頁數）
    // 也能自動遞迴複製其底下所有子目錄，呼叫端都不需介入
    return this._content.clone(); 
}`,
    },
    comparison: {
      positive: `// 正面：結構遞迴與自我複製 (多型注入，只認抽象介面 EntryComponent)
abstract class EntryComponent {
  public id: string,
  public name: string,
  // ...
}

class DirectoryComposite extends EntryComponent {
  // [Composite] 核心：不論子節點是檔案(各類型 Image、Word、Text)或目錄，操作一致
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
    // 痛點 1：外部必須認識所有具體類別 (Image, Word...)，每加一種就多一個 if
    if(c.type === 'Directory') { 
      copy.addDir(cloneDir(c));
    } else if(c.type === 'Image') {
      // 痛點 2：外部必須知道每個類別的「配方」，漏掉長寬或頁數就複製出半殘物件
      copy.addImage(new Image(c.name, c.width, c.height));
    } else if(c.type === 'Word') {
      copy.addFile(new WordDoc(c.name, c.pageCount));
    }
  });
  return copy;
}`,
    },
  },
  {
    id: "visitor",
    name: "Visitor",
    chapter: "行為分離",
    description:
      "將操作邏輯 (統計、搜尋、輸出 XML) 從資料結構中分離，實現功能插件化擴展。",
    icon: Zap,
    themeColor: "emerald",
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
    sequence: `sequenceDiagram
    autonumber
    participant Client as FileSystemFacade
    participant Visitor as StatisticsVisitor
    participant Root as root: DirectoryComposite
    participant Comp as child: EntryComponent
    
    Note over Client, Comp: 【雙重分派：Double Dispatch】
    Client->>Root: 1. accept(visitor)
    Root->>Visitor: 2. visitDirectory(this)
    Note right of Visitor: 執行目錄統計邏輯
    
    Note over Root, Comp: 遞迴走訪結構
    Root->>Comp: 3. accept(visitor)
    Comp->>Visitor: 4. visitFile(this)
    Note right of Visitor: 執行檔案統計邏輯
    
    Client->>Visitor: 5. getResults()
    Visitor-->>Client: 返回運算結果`,
    usage: {
      title: "業務邏輯解耦",
      description:
        "透過 accept 方法實現分派。Entry 節點只需負責結構走訪，而具體的匯出、搜尋、節點查找邏輯都由不同的 Visitor 專門負責。",
      code: `/* ------ FileSystemFacade.ts (Visitor 的分派) ------ */
// 1. 商業邏輯 A：計算大小與總項次
public calculateSize(): number {
    const visitor = new StatisticsVisitor();
    this.root.accept(visitor); // 呼叫端只需分派任務 (Double Dispatch)
    return visitor.totalSize;  // 取回插件運算完的結果
}

// 2. 商業邏輯 B：匯出成 XML 格式
public exportXml(): string {
    const visitor = new XmlExporterTemplate();
    this.root.accept(visitor); 
    return visitor.getResult(); // 取出組合完畢的字串
}

// 3. 商業邏輯 C：搜尋含有特定關鍵字的檔案
public searchFiles(keyword: string): string[] {
    const visitor = new FileSearchVisitor(keyword);
    this.root.accept(visitor);
    return visitor.foundIds;   // 取得符合條件的檔案 ID 陣列
}`,
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
`,
    },
  },
  {
    id: "template",
    name: "Template Method",
    chapter: "行為骨架",
    description:
      "處理一致的演算法骨架（遞迴走訪、層級縮排、字元脫逸），將差異化實作交由子類別（格式匯出）。",
    icon: LayoutTemplate,
    themeColor: "indigo",
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
    sequence: `sequenceDiagram
    participant Client as DirectoryComposite
    participant Template as BaseExporterTemplate
    participant Concrete as XmlExporterTemplate
    
    Note over Client, Concrete: 樣板方法骨架流程
    Client->>Template: visitDirectory(dir)
    Template->>Concrete: renderDirectoryStart(dir)
    
    create participant Frag as SafeFragment
    Concrete->>Frag: new SafeFragment(escaped)
    Note right of Concrete: 強制子類別回傳防護型別
    Concrete-->>Template: return SafeFragment
    Template->>Template: depth++
    Note right of Template: 處理縮排與遞迴子節點
    Template->>Template: depth--
    
    Template->>Concrete: renderDirectoryEnd(dir)
    Note right of Concrete: 強制子類別回傳防護型別
    Concrete-->>Template: return SafeFragment
    
    Template-->>Client: 輸出完整格式`,
    usage: {
      title: "自動化縮排與內容脫逸",
      description:
        "基底的 `visit` 負責維護 `depth` 並插入縮排空白；同時透過 `format` 模板強制 `escape` 處理，防止如 XML 注入等安全隱患。",
      code: `/* ------ 1. Template.ts (定義樣板) ------ */
class XmlExporterTemplate extends BaseExporterTemplate {
    constructor() {
      // 設定各自的跳脫字元庫，與深度縮排數量
      super({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }, 2);
      this.output = '<?xml version="1.0" encoding="UTF-8"?>\\n';
    }

    // 只需要實作「變化點 (Hook)」，走訪與縮排都由 BaseExporterTemplate 統一處理
    override renderDirectoryStart(dir: DirectoryComposite): SafeFragment {
      return this.format\`<Directory Name="\${dir.name}">\`;
    }

    override renderDirectoryEnd(_dir: DirectoryComposite): SafeFragment {
        return this.format\`</Directory>\`;
    }

    override renderFile(file: FileLeaf): SafeFragment {
        const attrs = file.attributes ? this.format\` \${file.attributes}\` : this.format\`\`;
        return this.format\`<File Name="\${file.name}" Size="\${file.size}KB"\${attrs} />\`;
    }
}

/* ------ 2. FileSystemFacade.ts (使用樣板) ------ */
public exportXml(): string {
    // 實例化特定的 Template，然後傳入 Visitor 進行走訪
    const visitor = new XmlExporterTemplate();
    this.root.accept(visitor); 
    return visitor.getResult(); // 取出組合好的 XML 字串
}`,
    },
    comparison: {
      positive: `// 正面：封裝不變流程 (走訪)，開放變化細節 (標籤格式)
abstract class BaseExporterTemplate extends BaseVisitor {
  // [Template Method] 實作 Visitor 的走訪、但多加處理縮排深度、字元脫逸等細節。
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
`,
    },
  },
  {
    id: "observer",
    name: "Observer",
    chapter: "解耦通訊",
    description:
      "建立發佈-訂閱機制，讓核心邏輯（如 Visitor、Command）能在不耦合 UI 的情況下，透過介面同步狀態更新。",
    icon: Activity,
    themeColor: "pink",
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
    
    class DashboardAdapter {
        -updateStatsFn
        -total
        +update(event)
    }
    
    Subject o-- IObserver : 訂閱
    Subject ..> NotificationEvent : 廣播
    IObserver <|-- ConsoleObserver : 實作
    IObserver <|-- DashboardAdapter : 實作`,
    sequence: `sequenceDiagram
    autonumber
    participant Client
    participant Obs1 as ConsoleObserver
    participant Obs2 as DashboardAdapter
    participant Vis as StatisticsVisitor
    
    Note over Client, Vis: 【建立觀察者與訂閱事件】
    Client->>Obs2: new ConsoleObserver(fn) / DashboardAdapter(fn)
    
    Client->>+Vis: new StatisticsVisitor()
    create participant Sub as Subject
    Vis->>Sub: 內部 notifier
    Client->>+Sub: subscribe(consoleObs) / subscribe(dashboardAdapter) 
    
    Note over Client, Vis: 【執行業務並觸發通知】
    Client->>+Vis: visitFile(entry)
    Vis->>+Sub: notify(event)
    
    loop 逐一通知 (Update)
        Sub->>+Obs1: update(event)
        Sub->>+Obs2: update(event)
    end
    deactivate Sub
    `,
    usage: {
      title: "事件訂閱與廣播",
      description:
        "主體 (Subject) 不需知道觀察者 (Observer) 的具體實作，僅透過 notify 進行廣播，達成鬆散耦合。",
      code: `/* ------ ExplorerTab.tsx (Observer 的註冊與廣播) ------ */
// 1. 準備觀察者 A: Dashboard（綁定圓形進度條）
const dashboardAdapter = new DashboardAdapter(
    stats => setLiveStats(stats), 
    facade.totalItems()
);

// 2. 準備觀察者 B: Console 終端機（綁定日誌歷史）
const consoleObs = new ConsoleObserver(
    log => setVisitorLogs(prev => [...prev, log])
);

// 3. 直接建立一個 Visitor 作為 Subject
const visitor = new StatisticsVisitor();

// 4. 將這兩個「互不相處」的 UI 觀察者，掛載(訂閱)到 Visitor 身上
// 當 Visitor 去巡覽結構時，就會不斷觸發 Notify 廣播，更新兩個畫面啦！
visitor.notifier.subscribe(consoleObs);
visitor.notifier.subscribe(dashboardAdapter);`,
    },
    comparison: {
      positive: `// 正面：通知器廣播機制，UI 與核心完全解耦
class FileSearchVisitor implements IVisitor {
  // 使用組合 (Has-a) Observer Pattern
  private notifier: Subject = new Subject();
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
}`,
    },
  },
  {
    id: "decorator",
    name: "Decorator",
    chapter: "裝飾鏈條",
    description:
      "動態地為 Observer 附加額外行為 (如日誌樣式)，不修改原始 Observer 的程式碼，展現層層包裹的靈活性。",
    icon: Component,
    themeColor: "cyan",
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
    sequence: `sequenceDiagram
    autonumber
    participant Client
    participant Sub as Subject
    participant Real as ConsoleObserver
    
    Note over Client, Real: 【初始化：套娃包裝】
    create participant D2 as BoldDecorator
    Client->>D2: new BoldDecorator(consoleObs)
    create participant D1 as IconDecorator
    Client->>D1: new IconDecorator(boldObs, "⛔")
    Note right of D2: 最後 IconDecorator 變成了最外層
    
    Note over Sub, D1: 【執行期：訊息穿透流程】
    Sub->>D1: update(event)
    activate D1
    Note right of D2: 1. 匹配關鍵字，裝飾圖示
    D1->>D2: update(event)
    activate D2
    Note right of D2: 2. 匹配關鍵字，裝飾粗體
    D2->>Real: update(event)
    activate Real
    Note right of Real: 3. 核心物件執行最終輸出
    deactivate Real
    deactivate D2
    deactivate D1`,
    usage: {
      title: "物件行為疊加",
      description:
        "像俄羅斯套娃一樣層層包裹物件，每一層 Decorator 加入新的行為，且客戶端無需修改程式碼。",
      code: `/* ------ ExplorerTab.tsx (套娃般的物件疊加) ------ */
// 1. 初始化最內層、最單純的目標物件 (只負責純文字日誌紀錄)
let logger: IObserver = new ConsoleObserver(entry => setLogs(prev => [...prev, entry]));

// 2. 像洋蔥一樣層層疊上不同的樣式行為 (回傳的都是包著舊物件的新物件)
// --- [加粗處理] ---
logger = new BoldDecorator(logger, ['[Command]', '[Error]']);

// --- [顏色處理] ---
logger = new HighlightDecorator(logger, '[Command]', 'text-cyan-700');
logger = new HighlightDecorator(logger, '刪除', 'text-red-600');

// --- [圖示處理] ---
logger = new IconDecorator(logger, '刪除', '⛔');
logger = new IconDecorator(logger, '[Error]', '❌');

// 3. 實際執行時，訊息會從最外層 (Icon) -> 中間層 (Highlight) -> 核心 (Console) 一路穿透進去
highlightLoggerRef.current = logger;`,
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
function notify(msg: string, action: number, level: string, icon: boolean) {
  // 痛點：邏輯耦合，宣告所有可能用到的變數
  let prefix = "";
  let color = "text-gray-500";

  // 痛點：巢狀地獄開始了...
  if (level === 'error') {
    color = "text-red-500";
    if (action === 1) prefix = "⚡";
    else if (action === 2) prefix = "↩️";
    if (icon) prefix += "❌ ";
  } else if (level === 'warning') {
    color = "text-yellow-500";
    // 略…
  }
}`,
    },
  },
  {
    id: "adapter",
    name: "Adapter",
    chapter: "介面轉換",
    description:
      "將不相容的事件資料 (NotificationEvent) 轉換為 UI 期待的格式 (Dashboard)，解決介面不對接問題。",
    icon: Plug2,
    themeColor: "orange",
    mermaid: `classDiagram
    class NotificationEvent {
        <<Adaptee>>
        +source : EventSource
        +type : EventType
        +message : string
        +data : Payload
    }

    class DashboardAdapter {
        <<Adapter / Target>>
        -updateStatsFn
        -total
        +constructor(updateStatsFn, total)
        +update(event)
    }

    DashboardAdapter ..> NotificationEvent : 轉換與適配
    DashboardAdapter ..> React_SetState : 呼叫並傳遞`,
    sequence: `sequenceDiagram
    participant UI as React UI
    participant Adapter as DashboardAdapter:IObserver
    participant Sub as Subject
    
    Note over UI, Adapter: [初始化階段 - 將依賴塞入 Adapter]
    UI->>Adapter: new (updateStatsFn, total)
    UI->>Sub: subscribe(Adapter)
    
    Note over Sub, UI: [執行期階段 - 廣播與轉接]
    Sub->>Adapter: update(event)
    Note right of Adapter: 1. 接收更新事件<br/>2. 重新映射欄位
    Adapter->>UI: updateStatsFn(adaptedStats)
    Note right of UI: UI 拿到專屬格式，無縫更新狀態`,
    usage: {
      title: "資料形狀的橋接",
      description:
        "當「原始事件 (Adaptee)」與「UI 組件 (Target)」需要的資料模型不一致，並要調用 UI 組件方法時，透過 Adapter 進行橋接。",
      code: `/* ------ Adapter 轉換邏輯 (身兼 Observer 橋樑) ------ */
export class DashboardAdapter implements IObserver {
    constructor(
        private updateStatsFn: (stats: any) => void,
        private total: number
    ) {}

    // 實作 Target 的標準介面；但在此處理不相容資料的轉接
    update(event: NotificationEvent): void {
        const payload = event.data || {};
        
        // [適配轉接] 把深層的 event 資料重新映射成平坦的格式
        const adaptedStats = {
            name: payload.currentNode || '-',
            count: payload.count || 0,
            total: this.total,
            type: payload.nodeType || '-'
        };
        
        // 呼叫 Adaptee (React SetState)
        this.updateStatsFn(adaptedStats);
    }
}`,
    },
    comparison: {
      positive: `// 正面：透過轉接器無縫橋接系統事件與 UI 狀態
// Target 介面為 IObserver，Adaptee 則是純粹吃特定格式的 UI updateFn
class DashboardAdapter implements IObserver {
  constructor(private updateFn, private total) {}

  update(event: NotificationEvent) {
    // 轉接動作：過濾、計算並生出目標形狀
    const stats = {
      name: event.data?.currentNode || '-',
      total: this.total
    };
    
    // 直接呼叫 UI 函式，完成橋接任務
    this.updateFn(stats);
  }
}`,
      negative: `// 反面：UI 依賴實作細節 (Coupled to Implementation)

// 痛點 1：UI 遷就於資料來源的設計
// 因為後端傳 event 過來，UI 就只好設計成接收 event，加深依賴
function MonitorDashboard({ event }: { event: any }) {

  // 痛點 2：洩漏的底層知識 (Leaky Abstraction)
  // UI 元件本不該知道資料是存在 data.currentNode 還是 payload.title。
  const name = event?.data?.currentNode ?? 'N/A';
  
  // 痛點 3：要求後端配合 UI 也不對 (Polluting Domain Model)
  // 若反過來要求後端 API 直接回傳 UI 格式 (View Model)，
  // 後端將不再純粹，無法複用於 Mobile App 或其他場景。

  return <div className="card">{name}</div>;
}`,
    },
  },
  {
    id: "command",
    name: "Command",
    chapter: "行為物件化",
    description:
      "將操作封裝成一致的物件，才能管理 (Undo/Redo 功能)，實現操作的歷史記錄追溯。",
    icon: Command,
    themeColor: "red",
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
    sequence: `sequenceDiagram
    autonumber
    participant Facade as FileSystemFacade
    participant Invoker as CommandInvoker
    participant Cmd as DeleteCommand
    participant Dest as DirectoryComposite
    
    Note over Facade, Dest: 【執行流程 (Execute)】
    Facade->>Cmd: new DeleteCommand(id, parent)
    Facade->>Invoker: execute(cmd)
    Invoker->>Cmd: execute()
    Cmd->>Dest: remove(id)
    Invoker->>Invoker: 紀錄至 undoStack 並清空 redoStack
    
    Note over Facade, Dest: 【復原流程 (Undo)】
    Facade->>Invoker: undo()
    Invoker->>Invoker: 從 undoStack 彈出(pop) 最近一筆命令
    Invoker->>Cmd: undo()
    Cmd->>Dest: add(targetEntry)
    Invoker->>Invoker: 移至 redoStack`,
    usage: {
      title: "行為物件化與復原系統",
      description:
        "透過將操作封裝成 Command 物件，Invoker 可以統一管理執行 (Execute)、復原 (Undo) 與重做 (Redo)。",
      code: `/* ------ FileSystemFacade.ts (建構並發送指令) ------ */
// 1. 商業邏輯：使用者點擊刪除按鈕
public deleteItem(id: string): void {
    const parent = this.findParent(id);
    
    if (parent && id !== 'root') {
        // 2. 將「刪除」這個行為，以及所需的受詞與環境變數，打包進 Command 物件中
        const command = new DeleteCommand(id, parent);
        
        // 3. 不直接執行，而是交給負責統一調度的 Invoker
        // Invoker 會觸發 execute() 並將其推入 UndoStack 中記錄
        this.invoker.execute(command);
    }
}

// 4. 當使用者在 UI 上點擊「[Undo] 復原」按鈕
public undo(): void {
    // 5. Invoker 從 Stack 彈出剛才的 DeleteCommand，呼叫它的 undo() 來恢復該檔案
    this.invoker.undo();
}`,
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
}`,
    },
  },
  {
    id: "strategy",
    name: "Strategy",
    chapter: "策略注入",
    description:
      "定義排序演算法家族，讓排序規則 (名稱、大小、標籤) 可在需要時選擇切換，彈性應用。",
    icon: RefreshCcwDot,
    themeColor: "purple",
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
    sequence: `sequenceDiagram
    autonumber
    participant Facade as FileSystemFacade
    participant Strat as ISortStrategy
    participant Cmd as SortCommand
    participant Invoker as CommandInvoker
    participant Dir as DirectoryComposite
    
    Note over Facade, Strat: 根據 UI 選擇產生排序策略
    Facade->>Strat: new LabelSortStrategy(dir)
    Note over Strat, Cmd: 將策略注入 Command
    Facade->>Cmd: new SortCommand(root, old, new, state)
    
    Facade->>Invoker: execute(cmd)
    Invoker->>Cmd: execute()
    
    Cmd->>Dir: sort(strategy)
    Dir->>Strat: sort(children)
    Note right of Strat: 具體執行排序演算法
    Strat-->>Dir: 返回排序後結果`,
    usage: {
      title: "動態演算法切換",
      description:
        "將排序邏輯抽離成策略物件，讓目錄 (Context) 在執行時可以動態注入不同的排序規則，而不需修改目錄本身的程式碼。",
      code: `/* ------ FileSystemFacade.ts (動態演算法切換) ------ */
public sortItems(attribute: string, currentSortState: SortState): SortState {
    const nextDir = (currentSortState.attr === attribute && currentSortState.dir === 'asc') ? 'desc' : 'asc';

    // 1. 準備一個「策略工廠函數」
    // 如果是要按標籤排序，就生出需要 Mediator 協助的 LabelStrategy
    // 如果是按其它屬性，就生出單純比較屬性的 AttributeStrategy
    const getStrategy = (attr: string, dir: 'asc' | 'desc') =>
        (attr === 'label' 
            ? new LabelSortStrategy(this.mediator, dir) 
            : new AttributeSortStrategy(attr, dir));

    // 2. 製造出「我們原本的策略」與「我們即將要切換的策略」
    const oldStrategy = getStrategy(currentSortState.attr, currentSortState.dir);
    const newStrategy = getStrategy(attribute, nextDir);
    const nextState: SortState = { attr: attribute, dir: nextDir };

    // 3. 將新舊策略一起打包進去 Command 裡
    // DirectoryComposite 的內部在執行時，其實就只是無腦的：this.children.sort(strategy.sort)
    this.invoker.execute(
        new SortCommand(this.root, oldStrategy, newStrategy, currentSortState, nextState)
    );

    return nextState;
}`,
    },
    comparison: {
      positive: `// 正面：動態注入演算策略，演算法與執行者解耦

// 抽換策略物件，但 Command 本身不需要修改
const s1: ISortStrategy = new LabelSortStrategy(tagManager);

const s2: ISortStrategy = new AttributeSortStrategy('name');

// 依需求，動態注入策略，可達到不同的排序結果
commandInvoker.execute(new SortCommand(root, s2));`,
      negative: `// 反面：參數混亂與條件地獄
// 痛點 1：為了支援「依標籤排序」，傳入 tagManager。之後依需求增加更多參數
// 函式簽名「有時需要、有時不需要」的參數，調用端困惑。
function sort(nodes: any[], type: 'name' | 'tag', tagManager?: any) {
  // 痛點 2：條件地獄...無限增長的 if-else
  if (type === 'name') {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
  } else if (type === 'tag') {
    if (!tagManager) throw new Error("Missing dependency");
    nodes.sort((a, b) => tagManager.getRank(a) - tagManager.getRank(b));
  }
}`,
    },
  },
  {
    id: "singleton",
    name: "Singleton",
    chapter: "全域狀態",
    description:
      "保證 Clipboard (剪貼簿) 在全應用程式中只有一個實例，集中管理複製的內容。",
    icon: Box,
    themeColor: "blue",
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
    sequence: `sequenceDiagram
    autonumber
    participant Copy as CopyCommand
    participant Paste as PasteCommand
    participant Clip as Clipboard (Singleton)
    
    Note over Copy, Clip: 【操作 A：複製內容】
    Copy->>Clip: getInstance()
    Clip-->>Copy: return unique instance
    Copy->>Clip: set(content)
    
    Note over Paste, Clip: 【操作 B：貼上內容】
    Paste->>Clip: getInstance()
    Clip-->>Paste: return same instance
    Paste->>Clip: get() 取得內容`,
    usage: {
      title: "全域唯一存取點與副本機制",
      description:
        "保證剪貼簿實體在記憶體中只有一份。雖然實體唯一，但透過 get() 取出資料時會利用 Prototype 模式進行 clone。",
      code: `/* ------ Command.ts (任意指令、任意模組 都能操作同一份實體) ------ */
export class CopyCommand extends BaseCommand {
    public execute(): void {
        if (this.component) {
            // 透過 getInstance() 取得全域唯一的剪貼簿
            Clipboard.getInstance().set(this.component);
        }
    }
}

export class PasteCommand extends BaseCommand {
    public execute(): void {
        const clipboard = Clipboard.getInstance();
        
        // 從同樣的實體中取出內容 (此處運用 Prototype 模式複製了新位址)
        const content = clipboard.get();

        if (content) {
            // 這個獨立拷貝出來的元件可以安全地塞進目錄裡了
            this.destinationDirectory.add(content);
        }
    }
}`,
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
// <App clipboard={cb}>`,
    },
  },
  {
    id: "flyweight",
    name: "Flyweight + Factory",
    chapter: "資源共享",
    description:
      "透過標籤工廠共享相同配色的標籤實體，達成一致化，並減少記憶體開銷。",
    icon: Tags,
    themeColor: "lime",
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
    sequence: `sequenceDiagram
    autonumber
    participant Med as TagMediator
    participant Factory as LabelFactory
    participant Label as Label (Flyweight)
    
    Note over Med, Factory: 1. 請求標籤實體 (第一次)
    Med->>Factory: getLabel('Urgent')
    Note right of Factory: 檢查 Pool (不存在)
    Factory->>Label: new Label('Urgent', 'bg-red-500')
    Label-->>Factory: return new Instance
    Factory-->>Med: return Label
    
    Note over Med, Factory: 2. 請求標籤實體 (第二次)
    Med->>Factory: getLabel('Urgent')
    Note right of Factory: 檢查 Pool (已存在)
    Factory-->>Med: return same Instance (快取共享)`,
    usage: {
      title: "享元物件的共享快取",
      description:
        "標籤工廠會控管所有 Label 實體的建立。當請求同名的標籤時，直接回傳記憶體中已存在的實體，並自動套用預設色票。",
      code: `/* ------ Flyweight.ts (享元物件與工廠) ------ */
// 1. 享元實體: 不論外面誰要用，Label 紀錄的屬性都是共享不變的
export class Label {
    constructor(public name: string, public color: string) { }
}

// 2. 享元工廠: 負責控管所有的實體池 (Pool)
export class LabelFactory {
    private labels: Record<string, Label> = {};

    getLabel(name: string): Label {
        // [核心機制] 若快取中還沒建立過，才真的去 new 一個新實體
        if (!this.labels[name]) {
            this.labels[name] = new Label(name, 'bg-slate-500'); 
        }
        // 反之，永遠回傳記憶體裡同一個位址的實體
        return this.labels[name];
    }
}

/* ------ Mediator.ts (客戶端搭配延遲載入) ------ */
// 3. 綁定標籤時：為節省記憶體，我們連物件參考都不存，只存極輕量的「字串」！
public attach(fileId: string, labelName: string): void {
    this.fileToLabels.get(fileId)!.add(labelName);
}

// 4. 當 UI 真的需要畫出檔案標籤時，才拿著字串去向工廠「借用」實體
public getLabels(fileId: string): Label[] {
    const names = this.fileToLabels.get(fileId);
    
    // 如果有一萬個檔案都綁定 "Urgent"，這裡就只會跟工廠借一萬次，
    // 拿到的永遠是同一個夾帶 bg-red-500 屬性的 Label 實體！
    return names ? Array.from(names).map(n => labelFactory.getLabel(n)) : [];
}`,
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
// 記憶體浪費嚴重，且無法統一管理標籤外觀。`,
    },
  },
  {
    id: "mediator",
    name: "Mediator",
    chapter: "關係管理",
    description:
      "集中管理檔案與標籤的多對多關聯，避免物件間的網狀依賴,實現 O(1) 雙向查詢。",
    icon: Share2,
    themeColor: "fuchsia",
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
    sequence: `sequenceDiagram
    participant Cmd as TagCommand
    participant Med as TagMediator
    participant UI as RenderTree
    
    Note over Cmd, UI: 解耦關聯管理
    Cmd->>Med: attach(fileId, 'Work')
    Note right of Med: 記錄 Map<file, labels>
    
    Note over Cmd, UI: UI 需要渲染時
    UI->>Med: getLabels(fileId)
    Med-->>UI: return Label[]`,
    usage: {
      title: "複雜關聯的集中化",
      description:
        "檔案不需要知道自己有哪些標籤，標籤也不需要知道有哪些檔案。所有的連線資訊都儲存在 Mediator 的雙向索引 (Index) 中。",
      code: `/* ------ 各個模組是如何透過 Mediator (中央聯絡簿) 來互動的？ ------ */

// 1. 在 TagCommand (專注於編輯操作)：
// 只管對 Mediator 下指令建立關聯，完全不用去修改 FileLeaf 原本的結構
if (this.isAttach) {
    this.tagMediator.attach(this.fileId, this.labelName);
} else {
    this.tagMediator.detach(this.fileId, this.labelName);
}

// 2. 在 RenderTree (專注於 UI 渲染)：
// 畫面上要繪製檔案圖示時，直接向 Mediator 取回對應的顏色實體 (O(1) 正向查詢)
const labels = tagMediator.getLabels(node.id);

// 3. 在 LabelSortStrategy (專注於整理分類)：
// 想找出所有 "Urgent" 的檔案優先排在最前面，直接問 Mediator (O(1) 反向查詢)
const priorityFileIds = tagMediator.getFiles('Urgent');

// >> 由於將「關聯關係」獨立抽出來統一由 Mediator 管理
// >> 這三個四散在邏輯層、演算法層、與 UI 層的程式，就完全不會互相卡死了！`,
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

// 災難：這是一個 O(N) 暴力掃描。又要再遞迴遍歷所有檔案。`,
    },
  },
  {
    id: "facade",
    name: "Facade",
    chapter: "簡易存取",
    description:
      "提供簡易的使用介面 (FileSystemFacade) 來操作複雜的功能 (Command, Visitor, Mediator)，降低 Client 耦合度。",
    icon: AppWindow,
    themeColor: "sky",
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
        +moveItem(sourceId, destId) : boolean
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
    sequence: `sequenceDiagram
    participant Client (UI)
    participant Facade
    participant Finder as FinderVisitor
    participant Invoker
    participant Cmd as DeleteCommand
    
    Note over Client, Facade: 簡化介面調用
    Client->>Facade: deleteItem(id)
    Facade->>Finder: new FinderVisitor(id)
    Note right of Finder: 找出父節點資訊
    Facade->>Cmd: new DeleteCommand(id, parent)
    Facade->>Invoker: execute(cmd)
    Invoker->>Cmd: execute()`,
    usage: {
      title: "高層次介面的簡化開發",
      description:
        "Facade 隱藏了內部 Visitor、Command、Observer 與 Mediator 的複雜交互過程。Client 只需呼叫一個簡單的方法。",
      code: `/* ------ ExplorerTab.tsx (Client 視角：無腦操作) ------ */
// 1. 初始化系統外觀 (一次性注入並隱藏龐大的 Root)
const facade = new FileSystemFacade(FileSystemFacade.getSampleRoot());

// 2. 原本複雜的「搜尋」行為 (需手動處理 Visitor 與通知)
// 現在只需一行，還能把 Observer 陣列直接傳入自動建立 UI 連線
const result = await facade.searchFiles('config', [consoleObserver]);

// 3. 原本需要多方協作的「刪除並支援復原」
// Facade 會自動為你接通 FinderVisitor -> DeleteCommand -> Invoker
facade.deleteItem('file-123');
facade.undo(); // 直接呼叫 Facade 的 Undo 即可

// 4. 匯出 XML (隱藏了正確掛載 Template 的實作細節)
const xml = await facade.exportXml([consoleObserver]);`,
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
}`,
    },
  },
];
