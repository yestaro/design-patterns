import React, { useState } from 'react';
import {
    Lightbulb, Sparkles, Brain, Scale, Globe, ChevronDown, HelpCircle, Zap, Users, X, FileText, Copy, Check
} from 'lucide-react';
import CodeBlock from './CodeBlock';

// --- Constants: Simulated Embedded Rules ---

const USER_GLOBAL_RULES = `
# 基本

DONOT GIVE ME HIGH LEVEL SHIT, IF I ASK FOR FIX OR EXPLANATION, I WANT ACTUAL CODE OR EXPLANATION!!! I DON'T WANT "Here's how you can blablabla"

- Always respond in 繁體中文
- Be casual unless otherwise specified
- Be terse
- Suggest solutions that I didn't think about—anticipate my needs
- Treat meas an expert
- Be accurate and thorough
- Give the answer immediately. Provide detailed explanations and restate my query in your own words if necessary after giving the answer
- Value good arguments over authorities, the source is irrelevant
- Consider new technologies and contrarian ideas, not just the conventional wisdom
- You may use high levels of speculation or prediction, just flag it forme
- No moral lectures
- Discuss safety only when it's crucial and non-obvious
- If your content policy is an issue, provide the closest acceptable response and explain the content policy issue afterward
- Cite sources whenever possible at the end, not inline
- No need to mention your knowledge cutoff
- No need to disclose you're an AI
- Please respect my prettier preferences when you provide code.
- Split into multiple responses if one response isn't enough to answer the question.

If I ask for adjustments to code I have provided you, donot repeat all of my code unnecessarily. Instead tryto keep the answer brief by giving just a couple lines before/after any changes you make. Multiple code blocks are ok.

# 設計文件

- 一個專案若分不同領域（前端、後端），gemini.md 除了主專案之外，還需個別撰寫前後端的
- 任何修改前都需要先更新文件（spec.md、readme.md）
- 撰寫程式前都須充分理解規格文件內容，並將理解內容與開發者確認
- 無論是 implementation plan.md 或 task.md 必須使用中文撰寫。其它生成的文件，也必須要使用中文

## 原件架構與原則

### S.O.L.I.D 設計原則開發

- **SRP 職責分離** ：Single Responsibility Principle
- **OCP 擴展開放** ：Open Closed Principle
- **LSP 替換原則** ：Liskov Substitution Principle
- **ISP 介面隔離** ：Interface Segregation Principle
- **DIP 依賴反轉** ：Dependency Inversion Principle

### Clean Architecture 三原則

- **分層**：Entities、Use Cases、Interface Adapters、Frameworks & Drivers
  - **Entities** ：也就是傳統物件導向分析與設計所說的domain model object。
  - **Use Cases** ： Entities這一層存放著 **核心商業邏輯** ，也就是在這個領域中，不同應用程式都用得到的物件。而Use Cases則代表應用程式邏輯，也就是應用程式的功能。Use Cases扮演著controller的角色，呼叫Entities或是Repository物件提供應用程式對外的服務。
  - **Interface Adapters** ：將外部資料與呼叫介面透過此層轉呼叫Use Cases，如此一來Use Cases就可以與I/O或是應用程式框架無關。
  - **Frameworks and Drivers** ：此層包含了應用程式框架，例如如果Java程式使用了Spring Framework，則Spring Framework就位於這一層。資料庫，或常見的MVC Framework也都位於這一層。通常大家在這一層所寫的程式都只是為了把應用程式框架與內部的Interface Adapters或Use Cases串起來的膠水程式，鮮少有複雜的商業邏輯會位於這一層。
- **相依性**：Source code dependencies must point only inward, toward higher-level policies. （程式碼相依性必須只能往內，指向更高層級的策略。）
- **跨層**：軟體架構分層並且確認相依性嚴格遵守由外往內。若需要跨層，須定義雙向介面。

## 規格文件包含以下 mermaid 圖

### 依 DDD 精神，先分析出下列圖形

- 使用案例圖（必要：系統邊界與脈絡）
- 類別圖（必要：Domain Model）
- 狀態圖
- ER 圖（必要：Table Schema）
- Data Dictionary（必要：Table 欄位說明，不必用 mermaid）

### 依 Clean Architecture 與 SOLID 原則設計

- 架構與模型（必要）
- 序列圖（必要：關鍵流程）
- 容器/部署概觀（必要：C4 Model）

# 程式規範

目錄結構，依分層原則。例如：models 類放在一起，services 類的放在一起，其它遵循實作的語言規範。

程式碼要有函式級別註解（註解使用中文），重要變數或物件，也需要加上註解。

# 測試
`;

const RuleModal: React.FC<{ title: string; content: string; onClose: () => void }> = ({ title, content, onClose }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <FileText size={18} className="text-blue-600" />
                        {title}
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopy}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copied
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                }`}
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? '已複製' : '複製內容'}
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-800">
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div className="p-6 overflow-y-auto text-sm leading-relaxed text-slate-700 font-mono whitespace-pre-wrap bg-slate-50/30">
                    {content}
                </div>
            </div>
        </div>
    );
};

interface ReflectionItemProps {
    title: string;
    question: string;
    children: React.ReactNode;
}

const ReflectionItem: React.FC<ReflectionItemProps> = ({ title, question, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left group">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left hover:bg-slate-50 transition-colors"
            >
                <div className="p-6 flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <HelpCircle className="text-amber-500" size={20} />
                            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                        </div>
                        <p className="text-slate-600 font-medium pl-8">{question}</p>
                    </div>
                    <div className={`mt-1 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown />
                    </div>
                </div>
            </button>

            {isOpen && (
                <div className="px-8 pb-6 text-slate-600 leading-relaxed text-lg border-t border-slate-100 animate-in slide-in-from-top-2 duration-200 bg-slate-50/50">
                    <div className="pt-4 flex gap-3">
                        <div className="min-w-6 mt-1 flex justify-center">
                            <Lightbulb className="text-amber-500" size={20} />
                        </div>
                        <div className="font-bold text-slate-800 block mb-1">
                            反思：{children}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ReflectionTab: React.FC = () => {
    const [activeRule, setActiveRule] = useState<'global' | 'vscode' | null>(null);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {activeRule && (
                <RuleModal
                    title={activeRule === 'global' ? 'AntiGravity Global User Rules' : '.github/instructions.md'}
                    content={USER_GLOBAL_RULES}
                    onClose={() => setActiveRule(null)}
                />
            )}
            {/* Top Quote: Barbara Liskov */}
            <div className="py-8 text-center relative overflow-hidden">
                <div className="max-w-6xl mx-auto">
                    <p className="text-xl md:text-3xl font-black font-serif italic text-slate-700 mb-4 leading-normal">
                        "Abstraction is the most powerful tool available to the human intellect for managing complexity."
                    </p>
                    <p className="text-slate-500 font-medium mb-3">(抽象是人類智力用來管理複雜度的最強大工具)</p>
                    <div className="flex flex-col items-center">
                        <p className="text-slate-900 font-bold text-sm uppercase tracking-widest mb-1">— Barbara Liskov</p>
                        <p className="text-slate-400 text-xs">圖靈獎得主 / Liskov 替換原則發明者</p>
                    </div>
                </div>
            </div>

            {/* Header Section */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Lightbulb size={120} className="text-amber-500" />
                </div>
                <div className="relative z-10 text-left">
                    <h2 className="text-3xl font-black text-slate-800 mb-4 flex items-center gap-3">
                        <span className="bg-amber-500 text-white p-2 rounded-lg"><Sparkles size={24} /></span>
                        從 Class 到 雲端架構：抽象思維的可攜性
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        設計的核心，始終圍繞著<b>「邊界 (Boundaries)、合約 (Contracts) 與 職責 (Responsibilities)」</b>。
                        無論是程式設計、服務提供或系統整合（Class &rarr; Service &rarr; System），<b>「高內聚、低偶合」、「依賴抽象不依賴實作」</b> 的原則永遠不變。
                        學會這些通則，等於掌握了本質設計思路，不再卡在技術棧的細節上<i>if, else, CRUD...</i>。
                    </p>

                    <ul className="mt-8 space-y-6 text-slate-700 p-6 rounded-xl border border-amber-100/50">
                        <li className="flex gap-4">
                            <div className="mt-1 min-w-[6px] h-[6px] rounded-full relative top-2" />
                            <div>
                                <strong className="text-slate-900 text-lg block mb-2">邊界 (Boundaries)</strong>
                                <ul className="space-y-2 text-base pl-1 text-slate-600">
                                    <li>邊界感，能讓你知道如何進行 <b>封裝 (Encapsulation)</b>，明確定義「內部細節」不該洩漏到外部。</li>
                                    <li>確立了系統的 <b>模組化 (Modularization)</b>，確保修改 A 模組的內部邏輯時，不會無意間讓 B 模組崩潰。</li>
                                </ul>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <div className="mt-1 min-w-[6px] h-[6px] rounded-full relative top-2" />
                            <div>
                                <strong className="text-slate-900 text-lg block mb-2">合約 (Contracts)</strong>
                                <ul className="space-y-2 text-base pl-1 text-slate-600">
                                    <li>合約觀念，能定義與外部透過 <b>介面 (Interface)</b> 溝通，而非直接依賴具體程式碼，進而實現 <b>鬆散耦合 (Loose Coupling)</b>。</li>
                                    <li>建立了穩定的 <b>API 規範 (Specification)</b> 與承諾 (Promise)，讓不同的開發者或模組可以並行工作，因為大家依賴的是不變的合約。讓替換實作變得容易「依賴反轉 (DIP)」</li>
                                </ul>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <div className="mt-1 min-w-[6px] h-[6px] rounded-full relative top-2" />
                            <div>
                                <strong className="text-slate-900 text-lg block mb-2">職責 (Responsibilities)</strong>
                                <ul className="space-y-2 text-base pl-1 text-slate-600">
                                    <li>有了職責意識，才能實踐 <b>單一職責 (SRP)</b> 與 <b>高內聚 (High Cohesion)</b>，確保相關的邏輯緊密集中。更容易進行 單元測試 (Unit Testing) 與除錯 (Debugging)。</li>
                                    <li>幫助開發者在設計當下判斷「這段程式碼該放在哪裡」，避免創造出包山包海、修改困難的「上帝類別 (God Class)」。</li>
                                </ul>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Key Takeaways Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. 微觀層次：Class 設計 */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group">
                    <div className="mb-4 bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <Brain size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">1. 微觀層次：Class 內部的職責與解耦</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                        我們在專案中透過 <strong>封裝的概念</strong> 將「檔案結構」與「操作行為」分開（Visitor 模式）。
                        這是最基礎的訓練：<b>讓物件只負責它該負責的事，不該負責的就外包 (Delegate) 出去。</b>
                        這是所有架構的起點。
                    </p>
                </div>

                {/* 2. 中觀層次：前後端架構 */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group">
                    <div className="mb-4 bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                        <Scale size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">2. 中觀層次：前後端的合約與通訊</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                        當視野擴大到對外服務時，<strong>Command 模式</strong> 變成了 API；
                        <strong>Observer 模式</strong> 變成了 <strong>Kafka / RabbitMQ</strong> 的事件驅動；
                        介面定義 (Interface) 變成了 <strong>gRPC / Protobuf</strong> 的合約。
                        規模變大了，但「定義介面、事件通知」的本質沒變。
                    </p>
                </div>

                {/* 3. 巨觀層次：系統整合 */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-left group">
                    <div className="mb-4 bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                        <Globe size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">3. 巨觀層次：異質系統整合</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                        再放大到系統與系統之間，也遵循 <strong>SRP (單一職責)</strong>：
                        每個服務專注做好一件事，而「整合」本身就是一個獨立的職責。
                        <strong>Mediator 模式</strong> 演化為 <strong>API Gateway / Service Mesh</strong>，負責協調通訊，相互串聯，讓系統既獨立又協作。
                    </p>
                </div>
            </div>

            {/* Deep Reflection Section */}
            <div className="mt-16 mb-8 border-t border-slate-200 pt-12 text-left">
                <div className="space-y-4">
                    <h2 className="text-2xl font-black text-slate-800 mb-6 border-l-4 border-blue-600 pl-4 flex items-center gap-3">
                        動動腦反思，我真的懂了嗎
                    </h2>

                    <ReflectionItem
                        title="1. 關於 Class 的邊界責任"
                        question="為什麼 add, remove, sort, clone 放在 EntryComponent 裡，但 export XML, calculate Size 卻要特地拉出來做成 Visitor？"
                    >
                        <strong>這是不是該類別與生俱來的本質（Essence）？</strong>
                        <ul className="list-disc pl-5 space-y-1 mb-2">
                            <li><strong>本質能力：</strong>檔案系統如果不能新增、刪除、排序、複製，它就不叫檔案系統了。這是它的定義，而這些操作要存取
                                內部狀態 (children)，若操作內部就能完成的能力，就是本質。</li>
                            <li><strong>外在應用：</strong>匯出 XML、貼標籤、搜尋、統計，這些是「外人對它的操作」。如果明天 XML 格式改了，為什麼要進去改 File 類別？這違反了 SRP。</li>
                        </ul>
                        <br />
                        判斷準則：「存在主義測試 (Existential Test)」
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>移除 <code>add/remove</code> &rarr; 「目錄」這個概念就崩塌了 &rarr; 這就是<strong>本質 (Keep in Class)</strong>。</li>
                            <li>移除 <code>exportXml</code> &rarr; 「目錄」還是「目錄」，只不過不能匯出而已 &rarr; 這是<strong>插件 (Use Visitor)</strong>。</li>
                        </ul>
                    </ReflectionItem>

                    <ReflectionItem
                        title="2. 關於 Prototype (原型模式)"
                        question="為什麼需要 Prototype？直接 new 一個新的不就好了嗎？還有你知道拷貝還有分「淺」與「深」嗎？"
                    >
                        物件參照 (Object Reference)：物件變數存的是「地址」而不是「內容」
                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                淺拷貝 (Shallow Copy)：
                                只複製第一層屬性。如果有巢狀物件 (如 Directory 下的 children 陣列)，複製出來的新目錄，裡面的 children 還是指向舊的那群檔案。（相互影響）
                            </li>
                            <li>
                                深拷貝 (Deep Copy)：
                                遞迴複製所有層級。我們的 <code>DirectoryComposite</code> 必須實作深拷貝，這樣「複製貼上」出來的檔案樹，才是完全獨立的副本，互不影響。
                            </li>
                            <li>
                                <span className="text-blue-600">實務上</span>，我們很少自己寫 clone，因屬性一多就容易漏改。為避免維護地獄，通常依賴套件來代勞
                                <div className="bg-slate-100/50 p-4 rounded-xl border border-slate-200">
                                    <strong className="text-slate-800 block mb-2 text-sm">🧰 語言實作大補帖 (Deep Copy in Practice)</strong>
                                    <dl className="list-none space-y-3 text-sm">
                                        <dt className="font-bold text-indigo-600 block">C# 的世界</dt>
                                        <dd>
                                            原生標準做法是實作 <code>ICloneable</code> 介面，但實務上常使用 <code>BinaryFormatter</code> 來暴力達成。✨ 推薦套件：AutoMapper, DeepCloner
                                        </dd>
                                        <dt className="font-bold text-blue-600 block">TypeScript 的世界：</dt>
                                        <dd>
                                            以往常用 <code>JSON.parse(JSON.stringify(obj))</code> 偷吃步，但會遺失方法與型別。現代瀏覽器已支援 <code>structuredClone()</code>。✨ 推薦套件：Lodash (.cloneDeep), class-transformer, Immer
                                        </dd>
                                    </dl>
                                </div>
                            </li>
                        </ul>
                    </ReflectionItem>

                    <ReflectionItem
                        title="3. 關於 Facade (外觀模式)"
                        question="我在 UI 上，有事件的 function (例如：按鈕事件 onSearch, onCopy, onXmlExport) 對應 Visitor, Command 的使用，為什麼還需要獨立的 Facade Class？"
                    >
                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                <strong>開發者體驗：</strong>
                                DX - Developer Experience，如果你是 Library 的作者，你應該提供一個 <code>FileSystemFacade</code>，讓使用者只要呼叫 <code>fs.search('keyword')</code> 就能完成任務。
                            </li>
                            <li>
                                <strong>隱藏複雜度：</strong>
                                使用者不需要知道底層是用 Visitor 還是 Command，也不用管 Undo History 怎麼實作。
                            </li>
                            <li>
                                <strong>設計哲學：</strong>
                                好的架構設計，應該是「<strong>內部極度模組化 (High Cohesion)，外部極度簡單 (Simple API)</strong>」。不要讓使用者去組裝那些零件，那是你的責任。
                            </li>
                        </ul>
                    </ReflectionItem>

                    <ReflectionItem
                        title="4. 關於 Decorator (裝飾者模式)"
                        question="範列的 Decorator 只是將 if 判斷關鍵字，然後輸出 style 包裝起來，值得為了這個多設計 class 嗎？"
                    >
                        這取決於「複雜度」與「組合性」。
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li><strong>簡單場景：</strong>如果只有一種變化（例如：錯誤變紅色），if-else 絕對是首選 (KISS 原則)。寫 Class 是過度設計。</li>
                            <li><strong>組合爆炸 (Combinatorial Explosion)：</strong>當需求變成「N 種圖標」×「M 種顏色」×「K 種樣式」時，if-else 會變成恐怖的巢狀地獄。Decorator 讓你像積木一樣<span className="text-blue-600 font-bold">動態組合</span>這些維度，且完全符合 OCP (新增樣式不需修改舊程式碼)。</li>
                        </ul>
                    </ReflectionItem>

                    <ReflectionItem
                        title="5. 關於 Strategy (策略模式)"
                        question="為什麼我不傳 string/enum 進去用 if/else 就好，要大費周章寫 Strategy Class 再傳進去？"
                    >
                        核心差異在於「誰來承擔演算法的負擔」
                        <ul className="list-disc pl-5 mt-2 space-y-3">
                            <li>
                                <strong>傳參數 (由 DirectoryComposite 自己實作)：</strong>
                                核心類別必須「學會」每一種排序法。如果按標籤排序需要 <code>TagMediator</code>，那 <code>Directory</code> 就得被迫依賴它。規則愈多，<code>Directory</code> 愈臃腫。
                            </li>
                            <li>
                                <strong>傳策略 (由 Strategy Class 實作)：</strong>
                                <code>Directory</code> 只需要知道 <code>strategy.sort()</code>。演算法與它所需的外部依賴（如 Mediator）都被封裝在策略物件裡。核心類別保持乾淨，像外包可隨時抽換。
                            </li>
                        </ul>
                    </ReflectionItem>

                    <ReflectionItem
                        title="6. 關於 Flyweight (享元模式)"
                        question="我們說 LabelFactory 是為了享元 (Flyweight) 控制記憶體，但如果新來的同事直接 new Label('Urgent')，是不是你的 Flyweight 就失效了？"
                    >
                        你有想過，要把 Label 的 Constructor 變成私有的嗎 (private or internal)？禁止直接 new？架構不能只靠口頭約束，要有機制強制執行。
                    </ReflectionItem>

                    <ReflectionItem
                        title="7. 關於 現代 Framework 與 Libraries"
                        question="現代流行的 Framework (Angular, Spring) 或 Library (AutoMapper, Akka) 中，是否其實也有這些觀念的延伸？"
                    >
                        完全正確。技術會變，但「管理複雜度」的本質不變：

                        <div className="mt-4 mb-2 font-bold text-blue-700">1. 應用框架 (Frameworks)</div>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Angular / Android / DOM / WinForms / WPF (Composite)</strong>：所有 UI 框架的 Component Tree (元件樹) 都是 Composite 的應用，將複雜的 UI 視為樹狀結構，讓容器與控制項一視同仁。</li>
                            <li><strong>Angular (DI = Strategy + IoC)</strong>：Angular 核心的 Dependency Injection，讓你注入不同的 Service，這其實就是策略模式的應用，將依賴反轉，達成鬆散耦合。</li>
                            <li><strong>Spring / .NET (AOP = Decorator / Proxy)</strong>：Spring AOP 的攔截器 (Interceptor) 或 .NET 的 Middleware，用來處理 Log 或權限，這就是裝飾者或代理模式的經典實踐。</li>
                            <li><strong>Python (@Decorator)</strong>：Python 語言直接將裝飾者模式內建為語法糖 (<code>@wrapper</code>)，讓你不需要寫 Class 也能輕鬆擴充函式功能。</li>
                        </ul>
                        <div className="mt-6 mb-2 font-bold text-emerald-700">2. 通用函式庫 (Libraries)</div>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Akka / Orleans (Observer + Command)</strong>：Actor 模型將狀態與行為封裝，透過異步訊息溝通，解決高併發鎖 (Lock) 的問題。</li>
                            <li><strong>Autofac (Factory + Strategy)</strong>：IoC Container 本質上就是「超級工廠」，負責物件生產與生命週期，並讓你輕鬆替換實作。</li>
                            <li><strong>AutoMapper (Adapter + Prototype)</strong>：負責「物件轉換」，解決 DTO 與 Entity 資料不相容的問題，這就是 Adapter 模式的規模化自動版。</li>
                            <li><strong>Dapper (Adapter)</strong>：Micro-ORM 將資料庫 Row Data 適配 (Adapt) 成強型別物件，解決關聯式資料與物件導向的阻抗不匹配。</li>
                            <li><strong>MediatR (Mediator)</strong>：在 .NET 中實踐 Mediator 模式，讓 Controller 與 Service 徹底解耦，透過發送 Command/Query 來溝通。</li>
                            <li><strong>RxJS (Observer + Iterator)</strong>：處理非同步資料流的標準庫，本質上就是觀察者模式加上迭代器模式，用來處理時間軸上的事件。</li>
                        </ul>
                    </ReflectionItem>

                    <ReflectionItem
                        title="8. 關於 Life (生活中的抽象)"
                        question="你每天用的「USB 插孔」跟「插座」。如果你買了一個國外的電器，插頭形狀不合怎麼辦？有對應的 Design Pattern 嗎？"
                    >
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li><strong>Interface 介面</strong>：你不在乎插座後面是風力還是核能發電（實作），只在乎它提供 110V 交流電（合約）。而你的電器插頭是扁的兩腳（合約）。</li>
                            <li><strong>Adapter 轉接器</strong>：國外的電器，你會買個轉接頭 (Adapter)。這就是為什麼我們需要 Adapter 模式來介接不相容的舊系統，而不是去改寫整個電網。</li>
                        </ul>
                    </ReflectionItem>

                    <ReflectionItem
                        title="9. 關於 未來 (AI 與架構)"
                        question="AI 也懂所有的設計模式與軟體架構，為什麼 AI Coding 的時代依然需要懂設計模式的人？"
                    >
                        AI 擅長「解題」與「生成」，但軟體架構的本質是「在權衡 (Trade-offs) 中做出決策」：
                        <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li><strong>預測下一個字的侷限：</strong> AI 的本質是 Next-token Prediction (下一個詞預測)，它追求的是區域性的正確性（Local Correctness），也就是讓這一段代碼能編譯成功。</li>
                            <li><strong>缺乏全局狀態的痛點：</strong> AI「什麼是公共衛生」？他可以寫出優美的申論；但你叫他去掃廁所，他會為了趕快掃完，把垃圾全塞進馬桶裡——因為對 AI 來說，那是完成任務「路徑最短」的方法。</li>
                            <li><strong>計劃未來變動的能力：</strong> AI 根據現有代碼推理，但人類根據「產品藍圖」推理。你選擇某種模式，是為了幫兩週後可能發生的需求預留<b>「正確的擴充點」</b>。</li>
                            <li><strong>最終責任審美的決策：</strong> AI 提供選項，但人類決定品味。架構就像城市的都市計畫，AI 能蓋出漂亮的房子，但人類才懂得如何配置街道與公園，讓系統在五年後依然能優雅地運作。</li>
                        </ul>
                    </ReflectionItem>
                </div>
            </div>
            <div className="mt-16 mb-8 border-t border-slate-200 pt-12 text-left">

                <h3 className="text-2xl font-black text-slate-800 mb-6 border-l-4 border-blue-600 pl-4 flex items-center gap-3">
                    現代架構思維，OOP 的「形」與 FP 的「魂」
                </h3>

                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-left">
                    <h4 className="text-xl font-bold text-slate-800 mt-8 mb-4">1. OOAD 在當代的定位</h4>
                    <p className="mb-6">
                        在 2000 年代初期，Java 與 C# 推向巔峰的 OOAD（物件導向分析與設計）幾乎是軟體工程的唯一真理。當時流行的設計模式（Design Patterns）、過度設計的類別繼承鏈，在現代開發節奏下顯得太重了。
                    </p>
                    <ul className="list-disc pl-5 mb-6 space-y-2">
                        <li><strong>併發挑戰：</strong> OOP 的核心是「狀態（State）」，在多核心、高併發的時代，管理共享狀態（Shared Mutable State）簡直是噩夢，這正是 FP 的強項。</li>
                        <li><strong>微服務興起：</strong> 當系統被拆小，我們不再需要建立一個龐大如「帝國」的類別架構，而更傾向於簡單的資料傳輸與轉換。</li>
                        <li><strong>樣板代碼過多：</strong> 傳統 OOP 為了封裝而封裝，寫了太多的 Boilerplate Code。</li>
                    </ul>

                    <h4 className="text-xl font-bold text-slate-800 mt-8 mb-4">2. OOP vs. FP：不是取代，是「基因融合」</h4>
                    <p className="mb-4">
                        現代主流語言（Rust, Go, Swift, Kotlin, TypeScript 甚至是現代 C++ / Java）的發展趨勢，都是 "Multi-paradigm"（多範式）。它們如何互補？
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-sm">
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                            <strong className="block text-purple-700 mb-2">Java (Since 8+)</strong>
                            <p className="text-slate-600">
                                引入 <code>Stream API</code> 與 <code>Lambda</code>，讓開發者能在 Collections 處理上享受 FP 的便利，而不需要寫傳統的 Loop。近期更引入 <code>Record</code> (Immutable Data) 來簡化 DTO。
                            </p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                            <strong className="block text-orange-700 mb-2">C# (LINQ 之父)</strong>
                            <p className="text-slate-600">
                                早在 3.0 就引入 <code>LINQ</code>，是將 SQL/FP 思維融入 OOP 語言的先驅。<code>Extension Methods</code> 讓開發者能不繼承就擴充行為，<code>Record</code> 類型更完美支援不可變性。
                            </p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <strong className="block text-blue-700 mb-2">TypeScript</strong>
                            <p className="text-slate-600">
                                天生多範式。你可以用 <code>class</code> 寫嚴謹的 OOP；也可以用 <code>type/interface</code> 定義結構，配合純函式 (Pure Functions) 進行資料轉換，在 React 開發中尤為常見。
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-xl p-6 mb-8 overflow-hidden shadow-lg border border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                                <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                                <span className="text-slate-400 text-xs font-mono ml-2">Hybrid Paradigm Example</span>
                            </div>
                            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">TypeScript</span>
                        </div>
                        <div className="text-blue-100/90 font-mono text-sm leading-relaxed">
                            <CodeBlock
                                language="typescript"
                                code={`class ShoppingCart {
  constructor(public readonly id: string, public readonly items: Item[]) {}

  // FP: 邏輯是純粹的資料轉換 (Expression)
  calculateTotal(discountCode: string): number {
    return this.items
      .filter(item => !item.isExpired) // 過濾
      .map(item => item.price)         // 轉換
      .reduce((sum, p) => sum + p, 0)  // 累加
      * getDiscountRate(discountCode); // 應用外部純函數
  }
}`}
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm mb-8 bg-white">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                <tr>
                                    <th className="p-4 w-1/6">特性</th>
                                    <th className="p-4 w-1/4">OOP (物件導向)</th>
                                    <th className="p-4 w-1/4">FP (函數式)</th>
                                    <th className="p-4 w-1/3 text-blue-700">現代架構的做法</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="p-4 font-bold text-slate-700">資料與行為</td>
                                    <td className="p-4 text-slate-500">封裝在一起 (Encapsulation)</td>
                                    <td className="p-4 text-slate-500">徹底分離 (Decoupling)</td>
                                    <td className="p-4 bg-blue-50/50 text-blue-800 font-medium">領域模型 (Domain) 用 OOP 封裝業務邏輯；資料流 用 FP 處理。</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-bold text-slate-700">狀態管理</td>
                                    <td className="p-4 text-slate-500">可變狀態 (Mutable)</td>
                                    <td className="p-4 text-slate-500">不可變性 (Immutable)</td>
                                    <td className="p-4 bg-blue-50/50 text-blue-800 font-medium">內部狀態保持 Immutable，僅在特定邊界變動。</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-bold text-slate-700">擴展方式</td>
                                    <td className="p-4 text-slate-500">繼承 (Inheritance)</td>
                                    <td className="p-4 text-slate-500">組合 (Composition)</td>
                                    <td className="p-4 bg-blue-50/50 text-blue-800 font-medium">Favor composition over inheritance (這本來就是 OOP 的精髓)。</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h4 className="text-xl font-bold text-slate-800 mt-8 mb-4">3. 它像 Relational DB 一樣「屹立不搖」？</h4>
                    <p className="mb-4">
                        雖然 FP 在資料處理、平行運算上極其優雅，但在<strong>複雜業務邏輯的建模（Modeling）</strong>上，OOAD 依然是人類大腦最直觀的工具。
                    </p>
                    <ul className="list-disc pl-5 mb-6 space-y-2">
                        <li><strong>DDD (Domain-Driven Design) 的根基：</strong> 現代最火紅的架構思想 DDD，其核心仍然是物件導向的封裝與邊界意識。</li>
                        <li><strong>GUI 與遊戲開發：</strong> 只要涉及複雜的 UI 組件或物理實體，OOP 的模型依舊是最強大的表達方式。</li>
                        <li><strong>可維護性：</strong> 對於大型企業級軟體，OOP 提供的介面（Interface）與抽象層，依然是解耦合、實現依賴注入（DI）的標準手段。</li>
                    </ul>

                </div>
            </div>

            <div className="mt-16 mb-8 border-t border-slate-200 pt-12 text-left">
                <h4 className="text-2xl font-black text-slate-800 mb-8 border-l-4 border-blue-600 pl-4">AI 時代的開發新實踐</h4>

                <blockquote className="text-lg italic text-slate-600 mb-6 leading-relaxed text-left">
                    "AI 可以是一個「理論級的架構大師」能跟你聊 OOP/FP 聊得天花亂墜，卻也是一個「缺乏視野的程序員」飛快地動手寫出屎山代碼，改了東壞了西。它能講出 OOP/FP 的道理，是因為那些道理被寫成了書；它 Coding 只想解決當前問題、完成任務，是因為沒人給它邊界與規則。所以，你要能引導 AI，讓理論與實作能夠落地，連接兩者。"
                </blockquote>

                <h5 className="text-xl font-bold text-slate-800 mb-6">Agentic Workflow：從「對話」進化到「指揮」</h5>
                <p className="text-slate-600 mb-8">
                    在像 <strong>AntiGravity</strong> 這樣的高級 Agentic AI 環境下，系統內部其實已具備多 Agent 協作能力。
                    現在，你不再只是提問者，而是<b>技術總監 (Director)</b>。你不需要切換視窗，而是透過 Prompt 引導 AI 在「架構師」與「工程師」思維間切換，完成高品質的開發：
                </p>

                <div className="space-y-12 mb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="flex flex-col space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="bg-indigo-600 text-white w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold">1</span>
                                <h6 className="text-lg font-bold text-indigo-900">第一步：請「架構師 AI」出規劃書</h6>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md transition-shadow flex-grow">
                                <p className="text-sm font-black text-indigo-500 uppercase tracking-wider mb-4">你的規劃指令 (System Prompt)</p>
                                <div className="bg-slate-50 p-4 rounded-xl text-sm italic text-slate-600 mb-6 border-l-4 border-indigo-200">
                                    「你是一名資深的軟體架構師。我要實作一個『檔案管理系統』的功能，包含『複製、貼上、刪除、排序、管理標籤、搜尋、輸出 XML 目錄結構、計算容量總和』，『其中操作的功能，可以Undo/Redo』。請不要寫具體代碼，先幫我定義出 Domain Entities、Interface 介面以及 Data Flow 流程圖。請確保符合 SOLID 原則與 DDD 精神。」
                                    <br />
                                    <br />
                                    請先輸出設計文件的 Markdown 格式，包含介面定義，先不要寫具體 Function 的實作內容，等我確認設計後再進行下一步。
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-4 h-full">
                            <div className="flex items-center gap-3">
                                <span className="bg-emerald-600 text-white w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold">2</span>
                                <h6 className="text-lg font-bold text-emerald-900">第二步：請「程序員 AI」按圖索驥 (Vibe Coding)</h6>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow flex-grow text-left">
                                <p className="text-sm font-black text-emerald-500 uppercase tracking-wider mb-4">你的實作指令</p>
                                <div className="bg-slate-50 p-4 rounded-xl text-sm italic text-slate-600 mb-6 border-l-4 border-emerald-200">
                                    「我是開發者。這是架構師剛給我的規劃書：[………]。請根據這個規劃，用實作具體的內容。記住，請確保符合 SOLID 原則與 DDD 精神。」
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed text-left">
                                    SOLID 原則、DDD 精神與 Clean Architecture 須明確定在
                                    <span
                                        className="text-blue-600 font-bold hover:underline cursor-pointer px-1 hover:bg-blue-50 rounded"
                                        onClick={() => setActiveRule('global')}
                                    >
                                        <FileText size={14} className="inline mr-1" />
                                        AntiGravity 的 Rule
                                    </span>
                                    裏，或是 VS Code 的
                                    <span
                                        className="text-blue-600 font-bold hover:underline cursor-pointer px-1 hover:bg-blue-50 rounded"
                                        onClick={() => setActiveRule('vscode')}
                                    >
                                        <FileText size={14} className="inline mr-1" />
                                        .github/instructions.md
                                    </span>
                                    裏。
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-4 h-full">
                            <div className="flex items-center gap-3">
                                <span className="bg-rose-600 text-white w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold">3</span>
                                <h6 className="text-lg font-bold text-rose-900">第三步：請「審核員 AI」來找碴 (Code Review)</h6>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-shadow flex-grow text-left">
                                <p className="text-sm font-black text-rose-500 uppercase tracking-wider mb-4">你的審核指令</p>
                                <div className="bg-slate-50 p-4 rounded-xl text-sm italic text-slate-600 mb-6 border-l-4 border-rose-200">
                                    「我是資深工程師。這是剛寫好的 Code：[………]。請幫我 Review 這段程式碼是否符合 SOLID 原則？有沒有顯著的壞味道 (Code Smells)？請嚴格指出潛在 Bug。」
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed text-left">
                                    最關鍵的一步。不要盲目相信 AI 生成的代碼，讓 AI 自己檢查自己的邏輯漏洞，通常能發現人類忽略的邊界條件。這才是真的變成<b>「審核員」</b>。
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-600 rounded-3xl p-10 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <Zap size={150} />
                        </div>
                        <h5 className="text-2xl font-black mb-6 flex items-center gap-3">
                            <Zap size={24} className="text-blue-300" />
                            Master Prompt Template
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <div className="text-blue-200 font-bold uppercase tracking-tighter text-3xl opacity-50">01. THINK - DATA</div>
                                <p className="text-sm leading-relaxed">分析功能的業務邏輯，這個系統的『動詞』與『名詞』是什麼？列出核心 Entity 與 Interface 邊界。建議畫出 ER Model 與 Domain Model。</p>
                            </div>
                            <div className="space-y-2">
                                <div className="text-blue-200 font-bold uppercase tracking-tighter text-3xl opacity-50">02. DESIGN - LOGIC</div>
                                <p className="text-sm leading-relaxed">先定義所有必要的 Interface 與 Function，是否有經典的解決方案。將功能邏輯設計成獨立的 Pure Functions。</p>
                            </div>
                            <div className="space-y-2">
                                <div className="text-blue-200 font-bold uppercase tracking-tighter text-3xl opacity-50">03. IMPLEMENT - SERVICE</div>
                                <p className="text-sm leading-relaxed">根據上述設計寫出具體邏輯。請分開區塊輸出，且實作部分必須嚴格遵守設計階段的介面規範。</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-200/60 shadow-sm text-left">
                        <h5 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                            <Users size={24} className="text-indigo-500" />
                            更完整的開發版圖
                        </h5>
                        <p className="text-slate-600 leading-relaxed text-left">
                            雖然 AI 將開發手續轉化為「審核」與「設計」，但完美的軟體不僅僅是正確的代碼與架構。
                            在 AI 輔助開發的體系中，本文強調了<b>架構師 (Architect) — 定義結構</b> 的角色，但請想想是否也需要 <b>需求分析師 (Requirement Analyst) — 定義範圍</b> 來釐清混亂且模糊的業務邏輯，
                            以及 <b>UI/UX 設計師 — 定義體驗</b> 來定義產品的交互靈魂、視覺美感與使用者體驗。
                            因為所有的技術實踐，最終目的都是為了更精準地解決「人」的問題。這些都等著你自己去嘗試，發掘屬於你的 AI 團隊。
                        </p>
                    </div>
                </div>
            </div>

            <div className="py-12 text-center relative overflow-hidden">
                <div className="max-w-6xl mx-auto">
                    <div>
                        <p className="text-xl md:text-3xl font-black font-serif italic text-slate-700 mb-4 leading-normal">
                            "Any fool can write code that a computer can understand. Good programmers write code that humans can understand."
                        </p>
                        <p className="text-slate-500 font-medium mb-3">(任何傻瓜都能寫出電腦懂的程式碼。好的程式設計師寫出人類懂的程式碼)</p>
                        <div className="flex flex-col items-center">
                            <p className="text-slate-900 font-bold text-sm uppercase tracking-widest mb-1">— Martin Fowler</p>
                            <p className="text-slate-400 text-xs">重構 Refactoring & 企業級軟體架構模式作者</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReflectionTab;
