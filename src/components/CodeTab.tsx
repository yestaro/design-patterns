import React, { useEffect, useState } from 'react';
import {
  Code, Layers2, Zap, Activity, DatabaseZap, RotateCcw,
  ArrowRightLeft, Share2, Play, Workflow, Boxes, Component,
  Box, AppWindow, Copy, LucideIcon
} from 'lucide-react';
import mermaid from 'mermaid';
import CodeBlock from './CodeBlock';

interface PatternItem {
  id: string;
  icon: LucideIcon;
  label: string;
  title: string;
  positiveCode: string;
  negativeCode: string;
}

const CodeTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState('composite');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'loose',
      fontFamily: 'Inter, system-ui, sans-serif',
      themeVariables: {
        loopBorder: '#64748b',
        loopTextColor: '#0f172a'
      }
    });

    const timer = setTimeout(async () => {
      try {
        const els = document.querySelectorAll('.mermaid');
        els.forEach(el => el.removeAttribute('data-processed'));
        await mermaid.run({ querySelector: '.mermaid' });
      } catch (e: any) {
        console.warn('[Mermaid] render skipped:', e.message);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const customStyles = `
        .loopLine { stroke: #64748b !important; stroke-width: 2px !important; stroke-dasharray: 4 !important; }
        .labelBox { stroke: #64748b !important; fill: #f1f5f9 !important; }
        .labelText { fill: #0f172a !important; font-weight: bold !important; }
        .activation0 { fill: #f1f5f9 !important; stroke: #94a3b8 !important; }
    `;

  const patterns: PatternItem[] = [
    {
      id: 'composite',
      icon: Workflow,
      label: 'Composite + Prototype',
      title: '結構與複製 (Composite + Prototype)',
      positiveCode: `// 正面：結構遞迴與自我複製 (多型注入，只認抽象介面 EntryComponent)
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
      negativeCode: `// 反面：硬編碼類型與外部手動遞迴複製
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
    },
    {
      id: 'visitor',
      icon: Zap,
      label: 'Visitor',
      title: '行為分離 (Visitor)',
      positiveCode: `// 正面：行為插件化，結構不需要改動
// 只要實施 accept，就能動態注入不同功能 (搜尋、匯出、統計)
root.accept(new XmlExporterTemplate());

// 不用修改結構，無痛就可以支援搜尋功能
root.accept(new FileSearchVisitor("API"));

// 關鍵實作：結構類別，定義 accept 介面
abstract class EntryComponent {
  // 將「被拜訪」的權力交給外部插件
  public abstract accept(visitor: IVisitor): void;
}`,
      negativeCode: `// 反面：將所有邏輯塞進資料結構 (O(N) Traversal Hell)
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
    },
    {
      id: 'template',
      icon: Play,
      label: 'Template',
      title: '行為骨架 (Template Method)',
      positiveCode: `// 正面：封裝不變流程 (走訪)，開放變化細節 (標籤格式)
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
      negativeCode: `// 反面：格式邏輯與走訪邏輯強烈耦合
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
    },
    {
      id: 'observer',
      icon: Activity,
      label: 'Observer',
      title: '解耦通訊 (Observer)',
      positiveCode: `// 正面：通知器廣播機制，UI 與核心完全解耦
class FileSearchVisitor implements IVisitor {
  private notifier: Subject = new Subject(); // 使用組合 (Has-a) Observer Pattern
  public visitFile(f: File): void {
    if (f.name.includes(this.keyword)) {
      // 任務物件不須認識 UI 組件，只需廣播「我找到了」
      this.notifier.notify({ msg: \`找到: \${f.name}\` });
    }
  }
}`,
      negativeCode: `// 反面：商業邏輯直接呼叫 UI 狀態 (Coupled)
function search(node: any, kw: string): void {
  if (node.name.includes(kw)) {
    // 痛點：核心算法中混雜 React State，無法由終端機或其他框架複用
    setReactState(\`搜尋中: \${node.name}\`);
    // 痛點：直接操作 DOM，無法由終端機或其他框架複用。綁定太深
    document.getElementById('status')!.innerText = '...';
  }
}`
    },
    {
      id: 'decorator',
      icon: Component,
      label: 'Decorator',
      title: '裝飾鏈條 (Decorator)',
      positiveCode: `// 正面：多維度裝飾，動態組合行為
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
      negativeCode: `// 反面：企圖用一堆參數來控制所有樣式，結果邏輯互相打架。
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
    },
    {
      id: 'adapter',
      icon: Share2,
      label: 'Adapter',
      title: '6. 介面轉換 (Adapter)',
      positiveCode: `// 正面：透過轉接器橋接原始資料與 UI 期待
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
      negativeCode: `// 反面：UI 依賴實作細節 (Coupled to Implementation)

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
    },
    {
      id: 'command',
      icon: RotateCcw,
      label: 'Command',
      title: '行為物件化 (Command)',
      positiveCode: `// 正面：將動作打包成可紀錄、可復原的物件
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



      negativeCode: `// 反面：分散的邏輯與昂貴的快照 (Scattered Logic & Expensive Snapshots)
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
    },
    {
      id: 'strategy',
      icon: ArrowRightLeft,
      label: 'Strategy',
      title: '策略注入 (Strategy)',
      positiveCode: `// 正面：動態注入演算策略，演算法與執行者解耦

// 抽換策略物件，但 Command 本身不需要修改
const s1: ISortStrategy = new LabelSortStrategy(tagManager);

const s2: ISortStrategy = new AttributeSortStrategy('name');

// 依需求，動態注入策略，可達到不同的排序結果
commandInvoker.execute(new SortCommand(root, s2));`,
      negativeCode: `// 反面：參數混亂與條件地獄
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
    },
    {
      id: 'flyweight',
      icon: Boxes,
      label: 'Flyweight + Factory',
      title: '資源共享 (Flyweight + Factory)',
      positiveCode: `// 正面：工廠控管實體，達成資源共享

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
      negativeCode: `// 反面：無限制的 new 記憶體浪費

// 痛點 1：重複實例化 (Memory Leak)
file1.tags.push(new Label('Urgent', 'bg-red-500'));
file1.tags.push(new Label('Work', 'bg-blue-500'));

// 痛點 2：每次使用者又選不同的檔案就會 new 一次 Label。
fileX.tags.push(new Label('Urgent', 'bg-red-500'));
fileX.tags.push(new Label('Personal', 'bg-green-500'));

// 痛點：若 1000 個檔案標註 Urgent，就 new 了 1000 次。
// 記憶體浪費嚴重，且無法統一管理標籤外觀。`
    },
    {
      id: 'mediator',
      icon: DatabaseZap,
      label: 'Mediator',
      title: '關係管理 (Mediator)',
      positiveCode: `// 正面：中介者管理多對多關聯，避免網狀依賴

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
      negativeCode: `// 反面：屬性入侵與暴力掃描 (O(N))

// 1. 直接修改檔案類別結構 (汚染 - 檔案應該只負責檔案的事情，無 tags 屬性)
file.tags = [];

// 2. 直接貼到該檔案的 tags 陣列中 (汚染)
file.tags.push(new Label('Work', 'bg-blue-500'));
file.tags.push(new Label('Urgent', 'bg-red-500'));

// 痛點：如果要查詢「哪些檔案貼了 Work」？
const results = files.filter(f => f.tags.includes('Work'));

// 災難：這是一個 O(N) 暴力掃描。又要再遞迴遍歷所有檔案。`
    },
    {
      id: 'singleton',
      icon: Box,
      label: 'Singleton',
      title: '全域狀態 (Singleton)',
      positiveCode: `// 正面：唯一入口，保證狀態全域一致

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
      negativeCode: `// 反面：多個實例導致狀態不同步
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
    },
    {
      id: 'facade',
      icon: AppWindow,
      label: 'Facade',
      title: '統一介面 (Facade)',
      positiveCode: `// 正面：外觀模式 (Facade) - 封裝複雜性與統一入口
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
      negativeCode: `// 反面：上帝函式 (麵條式代碼)
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
  ];

  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200 min-h-[605px] text-left">
      <style>{customStyles}</style>
      <div className="w-full space-y-24 pb-24 text-base md:text-lg text-left">

        {/* 1. 封裝與可見性分析 */}
        <section>
          <h2 className="text-xl font-black text-slate-800 mb-6 border-l-4 border-blue-600 pl-4 text-left">1. 封裝與可見性分析 (Encapsulation)</h2>
          <div className="space-y-6 text-left">
            <p className="text-slate-600 leading-relaxed font-medium text-left">
              核心資料 <b>#children</b> 被定義為私有屬性。這<b>確保物件能完整控制其內部狀態</b>（即不變量 Invariant）。
            </p>
            <div className="bg-slate-900 rounded-xl p-6 text-slate-300 font-mono text-xs lg:text-sm shadow-lg border border-slate-700 text-left">
              <span className="text-blue-400">class</span> DirectoryComposite <span className="text-blue-400">extends</span> EntryComponent &#123;<br />
              &nbsp;&nbsp;<span className="text-pink-400">private #children</span>: EntryComponent[] = [];<br />
              &nbsp;&nbsp;<span className="text-pink-400">private #activeStrategy</span>: ISortStrategy | null = null;<br />
              <br />
              &nbsp;&nbsp;<span className="text-blue-400">constructor</span>(id: string, name: string, created: number) &#123; super(id, name, 'Directory', 0, created); &#125;<br />
              <br />
              &nbsp;&nbsp;<span className="text-gray-500">/** 新增子節點，並立即套用目前的排序策略。 */</span><br />
              &nbsp;&nbsp;<span className="text-blue-400">public add</span>(child: EntryComponent): <span className="text-blue-400">void</span> &#123;<br />
              &nbsp;&nbsp;&nbsp;&nbsp;this.<span className="text-pink-400">#children</span>.push(child);<br />
              &nbsp;&nbsp;&nbsp;&nbsp;this.<span className="text-yellow-400">#applySort</span>();<br />
              &nbsp;&nbsp;&#125;<br />
              <br />
              &nbsp;&nbsp;<span className="text-blue-400">public remove</span>(childId: string): <span className="text-blue-400">void</span> &#123; this.<span className="text-pink-400">#children</span> = this.<span className="text-pink-400">#children</span>.filter(c =&gt; c.id !== childId); &#125;<br />
              <br />
              &nbsp;&nbsp;<span className="text-gray-500">/** 取得子節點的"副本"。 [防禦性編程] */</span><br />
              &nbsp;&nbsp;<span className="text-blue-400">public getChildren</span>(): EntryComponent[] &#123; <span className="text-blue-400">return</span> [...this.<span className="text-pink-400">#children</span>]; &#125;<br />
              <br />
              &nbsp;&nbsp;<span className="text-gray-500">/** 設定並執行排序策略 (Strategy Pattern) */</span><br />
              &nbsp;&nbsp;<span className="text-blue-400">public sort</span>(strategy: ISortStrategy): <span className="text-blue-400">void</span> &#123;<br />
              &nbsp;&nbsp;&nbsp;&nbsp;this.<span className="text-pink-400">#activeStrategy</span> = strategy;<br />
              &nbsp;&nbsp;&nbsp;&nbsp;this.<span className="text-yellow-400">#applySort</span>();<br />
              &nbsp;&nbsp;&#125;<br />
              <br />
              &nbsp;&nbsp;<span className="text-yellow-400">private #applySort</span>(): <span className="text-blue-400">void</span> &#123;<br />
              &nbsp;&nbsp;&nbsp;&nbsp;if (this.<span className="text-pink-400">#activeStrategy</span>) &#123;<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;this.<span className="text-pink-400">#activeStrategy</span>.sort(this.<span className="text-pink-400">#children</span>);<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
              &nbsp;&nbsp;&#125;<br />
              <br />
              &nbsp;&nbsp;<span className="text-gray-500">/** 接受訪問者 (Double Dispatch) */</span><br />
              &nbsp;&nbsp;<span className="text-blue-400">public accept</span>(visitor: IVisitor): <span className="text-blue-400">void</span> &#123; visitor.visitDirectory(this); &#125;<br />
              &#125;
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="p-5 bg-green-50 rounded-2xl border border-green-100 text-left">
                <h4 className="font-black text-green-700 mb-2 text-left">為什麼回傳副本？</h4>
                <p className="text-base text-slate-600 leading-relaxed text-left">
                  如果直接回傳 <b>children</b>，外部可直接新增項目加到最後，就打亂了排序邏輯。因此透過 <code>getChildren()</code> 返回副本，隔離了副作用（直接竄改內部狀態）。
                  這也是常見回傳 Enumerable 或 Iterator 的原因。
                </p>
              </div>
              <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 text-left">
                <h4 className="font-black text-amber-700 mb-2 text-left">可見性的教學意圖</h4>
                <p className="text-base text-slate-600 leading-relaxed text-left">
                  私有化宣告了「擁有權」。所有變更都必須經過受控的公開入口，如 <code>add()</code>、<code>sort()</code>，防止數據因開發疏忽而毀損，確保了數據的完整性和一致性。要時時站在外部的角度思考，他人如何使用你的設計。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 抽象與介面概念 */}
        <section>
          <h2 className="text-xl font-black text-slate-800 mb-6 border-l-4 border-blue-600 pl-4 text-left">2. 抽象與共同屬性 (Abstraction)</h2>
          <div className="space-y-6 text-left">
            <p className="text-slate-600 leading-relaxed font-medium text-left">
              抽象並非只是為了寫更少的程式碼，而是為了<b>定義系統的通訊契約</b>。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch text-left">
              <div className="space-y-4 text-left">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-left">
                  <h4 className="font-bold text-blue-700 mb-2 text-left">提取共同屬性 (Abstract)</h4>
                  <p className="text-base text-slate-600 leading-relaxed text-left">
                    <b>EntryComponent</b> 提取了 File 與 Directory 的<b>共有屬性</b>。這讓 UI 層可以統一處理資料，而不需要判斷具體實體。
                  </p>
                </div>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-left">
                  <h4 className="font-bold text-blue-700 mb-2 text-left">定義行為契約 (Interface)</h4>
                  <p className="text-base text-slate-600 leading-relaxed text-left">
                    <b>Visitor</b>、<b>Observer</b> 與 <b>Command</b> 設定了<b>行為標準</b>。具體實作者承諾提供特定介面，確保系統具備無限擴充性。
                  </p>
                </div>
              </div>
              <div className="bg-indigo-600 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-center text-left">
                <h4 className="font-black text-xl mb-4 flex items-center gap-2 text-left"><Layers2 size={24} /> 抽象的教學價值</h4>
                <p className="italic leading-loose text-left">
                  「掌握了 EntryComponent 的 accept 介面，你就掌握了整棵樹。遞迴邏輯會自動處理對象，不需再寫判斷類型。往後的功能擴充，都只需要新增 Visitor，不需要修改既有的樹結構。」
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 擁有 vs 繼承 */}
        <section>
          <h2 className="text-xl font-black text-slate-800 mb-6 border-l-4 border-blue-600 pl-4 text-left">3. 擁有 vs 繼承 (Composition over Inheritance)</h2>
          <div className="space-y-6 text-left">
            <p className="text-slate-600 leading-relaxed font-medium text-left">
              在處理觀察者模式時，我們面臨語意與彈性的權衡：<b>Visitor 是否應該繼承 Subject</b>？
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="p-6 bg-green-50 rounded-2xl border border-green-100 ring-2 ring-green-200 text-left">
                <h4 className="font-black text-green-700 mb-3 flex items-center gap-2 text-left"><b>方案 A：擁有 (Has-a) - 推薦設計</b></h4>
                <p className="text-base text-slate-600 mb-3 text-left">this.notifier = new Subject()</p>
                <ul className="text-sm text-slate-500 space-y-3 list-disc pl-4 text-left">
                  <li><strong>職責分離</strong>：Visitor 專注業務處理，<b>notifier</b> 專注訊息廣播。符合 SRP。</li>
                  <li><strong>語意清晰</strong>：Visitor「持有一個」通知器，而不是它「就是」通知器。</li>
                  <li><strong>高彈性</strong>：物件可同時擁有多個不同頻道的通知器。</li>
                </ul>
              </div>
              <div className="p-6 bg-red-50 rounded-2xl border border-red-100 opacity-80 text-left">
                <h4 className="font-black text-red-700 mb-3 flex items-center gap-2 text-left"><b>方案 B：繼承 (Is-a)</b></h4>
                <p className="text-base text-slate-600 mb-3 text-left">class Visitor extends Subject</p>
                <ul className="text-sm text-slate-500 space-y-3 list-disc pl-4 text-left">
                  <li><strong>語意偏誤</strong>：訪問者本質上並不是一個「主題」。</li>
                  <li><strong>職責混亂</strong>：強制將通訊職職與業務計算綁定。</li>
                  <li><strong>污染介面</strong>：Subject 的方法變更會直接污染子類別。</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4. 如何串連與使用 */}
        <section>
          <h2 className="text-xl font-black text-slate-800 mb-6 border-l-4 border-blue-600 pl-4 text-left">4. 模式的串連與使用 (Clean Architecture)</h2>
          <div className="space-y-8 text-left">
            <p className="text-slate-600 leading-relaxed font-medium text-left">
              理解模式如何定義後，最重要的就是看它們如何「組合在一起」完成功能。清楚的架構層次：<b>分層、相依性、跨層</b>，是設計的三個原則。
            </p>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 overflow-hidden">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 text-center">模式互動全生命週期 (Pattern Interaction Sequence)</h4>
              <div className="mermaid opacity-90">
                {`sequenceDiagram
                                        autonumber
                                        
                                        box rgb(219, 234, 254) Presentation Layer
                                            participant UI as Observer: ExplorerUI
                                        end

                                        box rgb(243, 232, 255) Use Cases - Application Action Layer
                                            participant CM as CommandInvoker
                                            participant CMD as Command
                                            participant VIS as Visitor
                                        end

                                        box rgb(255, 237, 213) Entities - Enterprise Data Layer
                                            participant COMP as Composite: Tree
                                            participant MED as Mediator: TagMediator
                                            participant FACT as Flyweight: LabelFactory
                                        end

                                        box rgb(220, 252, 231) Reactive Layer
                                            participant OBS as Subject
                                        end

                                        Note over UI, OBS: 【場景 A】尋找或輸出：唯讀分析 (Visitor Pattern)
                                        UI->>VIS: 建立並掛載觀察者 Observer
                                        activate VIS
                                        UI->>COMP: 啟動遞迴走訪 accept(visitor)
                                        activate COMP
                                        loop 🔄 拜訪者遞迴
                                            COMP->>VIS: 執行型態回呼 visit()
                                            activate VIS
                                            VIS-->> VIS: 執行業務邏輯 (Template Method)
                                            VIS-->>OBS: 即時發布進度 notify()
                                            OBS-->>UI: 更新畫面 update()
                                            deactivate VIS
                                        end
                                        deactivate COMP
                                        deactivate VIS

                                        autonumber 1
                                        Note over UI, OBS: 【場景 B】發送指令：狀態變更 (Command Pattern)
                                        UI->>CM: 請求執行 execute()
                                        activate CM
                                        CM->>CMD: 堆疊(for Undo)並執行
                                        activate CMD
                                        alt ⛔ 結構操作 - Paste or DeleteCommand
                                            CMD->>COMP: 直接操控節點 clone() 或 remove()
                                            activate COMP
                                            deactivate COMP                                        
                                        else 💡 策略應用 - SortCommand
                                            CMD->>VIS: 委派走訪 visit()
                                            activate VIS
                                            VIS->>COMP: 執行 sort(Strategy)
                                            activate COMP
                                            deactivate COMP
                                            deactivate VIS
                                        else 🏷️ 關聯管理 - TagCommand
                                            CMD->>MED: 貼標 attach()
                                            activate MED
                                            MED->>FACT: 取得共享實體 getLabel()
                                            activate FACT
                                            deactivate FACT
                                            MED-->>OBS: 發布關聯變動通知 notify()
                                            OBS-->>UI: 更新畫面 update()
                                            deactivate MED
                                        end
                                        deactivate CMD
                                        deactivate CM
                                    `}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left items-stretch">
              <div className="space-y-4 text-left flex flex-col h-full">
                <h5 className="font-bold text-blue-700 flex items-center gap-2 text-left"><Layers2 size={18} /> 1. 模式組合 (Composition)</h5>
                <p className="text-base text-slate-500 text-left flex-grow">
                  各個模式像積木一樣組合，內部都「持有」了其他模式來完成任務：
                </p>
                <div className="bg-slate-900 p-5 rounded-xl text-xs lg:text-sm font-mono text-slate-300 border border-slate-700 text-left h-full overflow-hidden">
                  <span className="text-blue-400">class</span> FileSearchVisitor <span className="text-blue-400">implements</span> IVisitor &#123;<br />
                  &nbsp;&nbsp;private notifier: Subject;<br />
                  &nbsp;&nbsp;constructor() &#123;<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;this.notifier = <span className="text-pink-400">new Subject()</span>;<br />
                  &nbsp;&nbsp;&#125;<br />
                  &#125;<br />
                  <br />
                  <span className="text-blue-400">class</span> SortCommand <span className="text-blue-400">implements</span> ICommand &#123;<br />
                  &nbsp;&nbsp;public execute(): <span className="text-blue-400">void</span> &#123;<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;this.root.<span className="text-pink-400">accept</span>(visitor);<br />
                  &nbsp;&nbsp;&#125;<br />
                  &#125;
                </div>
              </div>

              <div className="space-y-4 text-left flex flex-col h-full">
                <h5 className="font-bold text-blue-700 flex items-center gap-2 text-left"><Share2 size={18} /> 2. 注入與掛載 (Injection)</h5>
                <p className="text-base text-slate-500 text-left flex-grow">
                  透過掛載或注入 (Inject) 不同的策略物件，提供更靈活的行為：
                </p>
                <div className="bg-slate-900 p-5 rounded-xl text-xs lg:text-sm font-mono text-slate-300 border border-slate-700 text-left h-full overflow-hidden">
                  <span className="text-gray-500">// 掛載觀察者 (Observer)</span><br />
                  v.<span className="text-pink-400">notifier.subscribe</span>(o1);<br />
                  v.<span className="text-pink-400">notifier.subscribe</span>(o2);<br />
                  <br />
                  <span className="text-gray-500">// 注入策略 (Strategy)</span><br />
                  <span className="text-blue-400">const</span> s: ISortStrategy = <span className="text-pink-400">new LabelSortStrategy</span>(mediator);<br />
                  <span className="text-blue-400">const</span> c: ICommand = new SortCommand(r, s);<br />
                </div>
              </div>

              <div className="space-y-4 text-left flex flex-col h-full">
                <h5 className="font-bold text-blue-700 flex items-center gap-2 text-left"><Play size={18} /> 3. 觸發執行 (Execution)</h5>
                <p className="text-base text-slate-500 text-left flex-grow">執行操作的入口點因不同的行為角色，而有所不同：</p>
                <div className="bg-slate-900 p-5 rounded-xl text-xs lg:text-sm font-mono text-slate-300 border border-slate-700 text-left h-full overflow-hidden">
                  <span className="text-gray-500">// Visitor (唯讀分析)</span><br />
                  root.<span className="text-pink-400">accept</span>(visitor);<br />
                  <br />
                  <span className="text-gray-500">// Command (狀態寫入)</span><br />
                  invoker.<span className="text-pink-400">execute</span>(cmd);<br />
                  <br />
                  <span className="text-gray-500">// Mediator (關聯更新)</span><br />
                  tagMediator.<span className="text-pink-400">attach</span>(id, "Urgent");
                </div>
              </div>
            </div>

            <div className="bg-indigo-600 text-white p-8 rounded-3xl shadow-xl mt-8 text-left">
              <h4 className="font-black text-xl mb-6 flex items-center gap-2 text-left">
                <span className="text-2xl">🛡️</span> 設計原則檢核 (SOLID Checklist)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 text-base text-indigo-50 text-left items-start">
                <div className="space-y-8">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-4">
                      <span className="font-black text-indigo-200 text-2xl w-12 flex-shrink-0">SRP</span>
                      <span className="text-lg leading-relaxed"><b>職責分離</b>：Mediator (管理關聯)、Visitor (分析業務)、Subject (通訊廣播)。</span>
                    </div>
                    <span className="text-xs uppercase text-indigo-300 font-bold tracking-wider pl-16">Single Responsibility Principle</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-4">
                      <span className="font-black text-indigo-200 text-2xl w-12 flex-shrink-0">OCP</span>
                      <span className="text-lg leading-relaxed"><b>擴展開放</b>：新增 Visitor (業務功能) 或 Strategy (演算策略) 不需修改原類別。</span>
                    </div>
                    <span className="text-xs uppercase text-indigo-300 font-bold tracking-wider pl-16">Open Closed Principle</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-4">
                      <span className="font-black text-indigo-200 text-2xl w-12 flex-shrink-0">LSP</span>
                      <span className="text-lg leading-relaxed"><b>替換原則</b>：Command (如 Copy/Paste) 與 Observer (如 Console/Dash) 皆可替換。</span>
                    </div>
                    <span className="text-xs uppercase text-indigo-300 font-bold tracking-wider pl-16">Liskov Substitution Principle</span>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-4">
                      <span className="font-black text-indigo-200 text-2xl w-12 flex-shrink-0">ISP</span>
                      <span className="text-lg leading-relaxed"><b>介面隔離</b>：Entry 僅定義共通行為，不強迫 File 實作 Directory 專有 add/remove 。</span>
                    </div>
                    <span className="text-xs uppercase text-indigo-300 font-bold tracking-wider pl-16">Interface Segregation Principle</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-4">
                      <span className="font-black text-indigo-200 text-2xl w-12 flex-shrink-0">DIP</span>
                      <span className="text-lg leading-relaxed"><b>依賴反轉</b>：Decorator 依賴抽象 Observer，Invoker 依賴抽象 Command。</span>
                    </div>
                    <span className="text-xs uppercase text-indigo-300 font-bold tracking-wider pl-16">Dependency Inversion Principle</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. 功能對照表 */}
        <section>
          <h2 className="text-xl font-black text-slate-800 mb-4 border-l-4 border-blue-600 pl-4 text-left">5. 類別設計 vs 傳統直覺</h2>

          {/* Tab Navigation: MacOS Dock Effect */}
          <div className="relative mb-8">
            <div
              className="flex justify-center items-end gap-3 h-40 px-6 relative z-10"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {patterns.map((tab, index) => {
                const isActive = activeTab === tab.id;

                // Calculate Fisheye Scale
                let scale = 1;
                let translateY = 0;
                let zIndex = 0;

                if (hoveredIndex !== null) {
                  const dist = Math.abs(hoveredIndex - index);
                  if (dist === 0) {
                    scale = 1.4; translateY = -30; zIndex = 20;
                  } else if (dist === 1) {
                    scale = 1.2; translateY = -15; zIndex = 10;
                  } else if (dist === 2) {
                    scale = 1.05; translateY = -8; zIndex = 5;
                  }
                } else if (isActive) {
                  scale = 1.15; translateY = -12; zIndex = 10;
                }

                // Color Map for inactive state (Subtle tint)
                const colorMap: Record<string, string> = {
                  composite: 'text-amber-300', visitor: 'text-emerald-300', template: 'text-indigo-300',
                  observer: 'text-pink-300', decorator: 'text-cyan-300', adapter: 'text-orange-300',
                  command: 'text-red-300', strategy: 'text-purple-300', flyweight: 'text-lime-300',
                  mediator: 'text-teal-300', singleton: 'text-stone-300', facade: 'text-sky-300'
                };
                const subtleColor = colorMap[tab.id] || 'text-slate-300';

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    className="group relative flex flex-col items-center justify-end transition-all duration-200 ease-out p-2 mx-1"
                    style={{
                      transform: `scale(${scale}) translateY(${translateY}px)`,
                      zIndex
                    }}
                    title={tab.label}
                  >
                    <div className={`p-4 rounded-3xl shadow-xl border flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-400 shadow-blue-500/50 w-20 h-20' : 'bg-white border-slate-200 w-20 h-20 hover:border-blue-200'}`}>
                      <tab.icon size={36} className={`transition-all duration-300 ${isActive ? 'text-white' : subtleColor}`} />
                    </div>

                    {/* Tooltip Label */}
                    <span className={`absolute -bottom-12 whitespace-nowrap px-3 py-1 text-slate-500 text-xs font-bold transition-all duration-200 pointer-events-none ${hoveredIndex === index || isActive ? 'opacity-100 text-slate-800 scale-110 -translate-y-1' : 'opacity-60 scale-90'}`}>
                      {tab.label}
                    </span>

                    {/* Active Indicator */}
                    {isActive && <div className="absolute -bottom-4 w-10 h-1.5 bg-blue-500/50 rounded-full blur-md"></div>}
                  </button>
                );
              })}
            </div>
            {/* Dock Shelf Separator */}
            <div className="absolute bottom-6 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-slate-300 to-transparent z-0"></div>
          </div>

          <div className="min-h-[500px]">
            {patterns.map(pattern => (
              activeTab === pattern.id && (
                <div key={pattern.id} className="space-y-6 text-left animate-in fade-in duration-300">
                  <div className="flex items-center gap-3 mb-2 text-left">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-700 text-left">
                      <pattern.icon size={24} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 text-left">
                      {pattern.title}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                    <div className="bg-slate-900 p-8 rounded-3xl text-slate-300 border-l-8 border-green-500 shadow-xl text-left overflow-hidden">
                      <CodeBlock code={pattern.positiveCode} />
                    </div>
                    <div className="bg-slate-900 p-8 rounded-3xl text-slate-300 border-l-8 border-red-500 text-left overflow-hidden">
                      <CodeBlock code={pattern.negativeCode} />
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </section>

        {/* 6. 結語 */}
        <section>
          <div className="bg-gradient-to-br from-indigo-50 to-white p-10 rounded-3xl border border-indigo-100 shadow-lg text-center relative overflow-hidden">
            <h2 className="text-3xl font-black mb-8 text-slate-800 tracking-tight">
              結語：為什麼軟體需要架構與學設計模式？
            </h2>

            <div className="max-w-4xl mx-auto space-y-8 text-lg text-slate-600 leading-relaxed">
              <p className="font-medium text-xl text-slate-700">
                你可能會覺得，為什麼要搞左邊那一堆 Class 與 Interface？右邊的代碼 (God Function) 明明寫比較快
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-green-600 mb-2 flex items-center gap-2">
                    <span className="text-2xl">🏗️</span> Design Patterns
                  </h4>
                  <p className="text-slate-500 text-base">
                    建置成本高 (慢)，但新增功能只需新增一個檔案，不用改核心。這是<b className="text-green-600">「可擴充性」與「可讀性」</b>。
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-red-500 mb-2 flex items-center gap-2">
                    <span className="text-2xl">⚡</span> God Function
                  </h4>
                  <p className="text-slate-500 text-base">
                    寫起來直覺 (快)，但每改一個小功能，都要擔心弄壞其他 5 個功能。這是<b className="text-red-500">「技術債」</b>。
                  </p>
                </div>
              </div>

              <div className="font-bold text-indigo-800 mt-8 text-lg bg-indigo-50 w-full px-8 py-6 rounded-2xl border-2 border-indigo-100 shadow-sm text-left relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <span className="text-3xl shrink-0">💡</span>
                  <div>
                    <span>其實，沒有人一開始就能寫出完美的架構。</span>
                    <span className="font-medium text-slate-600 text-base block mt-2">設計模式通常是在<b>「重構」</b>階段引入的——當你發現代碼開始變得難以維護時，這些模式就是你的解藥。</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 relative">
                <span className="text-8xl text-indigo-100 absolute -top-4 -left-4 select-none opacity-50">"</span>
                <p className="font-serif italic text-2xl md:text-3xl text-indigo-800 font-bold relative z-10 px-8">
                  即便在 AI 時代，好的架構依然是核心競爭力<br />
                  <span className="text-base md:text-xl text-indigo-500 font-medium block mt-3 not-italic font-sans leading-relaxed">
                    當 AI 成為團隊超級成員，你能擔任團隊方向與設計的角色嗎？<br />
                    讓 AI 讀懂你，你也能讀懂 AI 程式碼，而不是一起舉手<b>「我完成了，但我看不懂」</b>。
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CodeTab;
