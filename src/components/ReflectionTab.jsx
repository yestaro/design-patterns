import React from 'react';
import {
    Lightbulb, Sparkles, Brain, Scale, Globe, ChevronDown, ChevronUp, HelpCircle
} from 'lucide-react';

const ReflectionItem = ({ title, question, children }) => {
    const [isOpen, setIsOpen] = React.useState(false);
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

const ReflectionTab = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
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
            <div className="space-y-4">
                <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
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
                    title="2. 關於 Facade (外觀模式)"
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
                    title="3. 關於 Decorator (裝飾者模式)"
                    question="範列的 Decorator 只是將 if 判斷關鍵字，然後輸出 style 包裝起來，值得為了這個多設計 class 嗎？"
                >
                    這取決於「複雜度」與「組合性」。
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li><strong>簡單場景：</strong>如果只有一種變化（例如：錯誤變紅色），if-else 絕對是首選 (KISS 原則)。寫 Class 是過度設計。</li>
                        <li><strong>組合爆炸 (Combinatorial Explosion)：</strong>當需求變成「N 種圖標」×「M 種顏色」×「K 種樣式」時，if-else 會變成恐怖的巢狀地獄。Decorator 讓你像積木一樣<span className="text-blue-600 font-bold">動態組合</span>這些維度，且完全符合 OCP (新增樣式不需修改舊程式碼)。</li>
                    </ul>
                </ReflectionItem>

                <ReflectionItem
                    title="4. 關於 Flyweight (享元模式)"
                    question="我們說 LabelFactory 是為了享元 (Flyweight) 控制記憶體，但如果新來的同事直接 new Label('Urgent')，是不是你的 Flyweight 就失效了？"
                >
                    你有想過，要把 Label 的 Constructor 變成私有的嗎 (private or internal)？禁止直接 new？架構不能只靠口頭約束，要有機制強制執行。
                </ReflectionItem>

                <ReflectionItem
                    title="5. 關於 Life (生活中的抽象)"
                    question="你每天用的「USB 插孔」跟「插座」。如果你買了一個國外的電器，插頭形狀不合怎麼辦？有對應的 Design Pattern 嗎？"
                >
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li><strong>Interface 介面</strong>：你不在乎插座後面是風力還是核能發電（實作），只在乎它提供 110V 交流電（合約）。而你的電器插頭是扁的兩腳（合約）。</li>
                        <li><strong>Adapter 轉接器</strong>：國外的電器，你會買個轉接頭 (Adapter)。這就是為什麼我們需要 Adapter 模式來介接不相容的舊系統，而不是去改寫整個電網。</li>
                    </ul>
                </ReflectionItem>
            </div>


            <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">M</span>
                現代架構思維：OOAD 在當代的定位
            </h3>

            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
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

                <h4 className="text-xl font-bold text-slate-800 mt-8 mb-4">3. 為何說它像 Relational DB 一樣「屹立不搖」？</h4>
                <p className="mb-4">
                    雖然 FP 在資料處理、平行運算上極其優雅，但在<strong>複雜業務邏輯的建模（Modeling）</strong>上，OOAD 依然是人類大腦最直觀的工具。
                </p>
                <ul className="list-disc pl-5 mb-6 space-y-2">
                    <li><strong>DDD (Domain-Driven Design) 的根基：</strong> 現代最火紅的架構思想 DDD，其核心仍然是物件導向的封裝與邊界意識。</li>
                    <li><strong>GUI 與遊戲開發：</strong> 只要涉及複雜的 UI 組件或物理實體，OOP 的模型依舊是最強大的表達方式。</li>
                    <li><strong>可維護性：</strong> 對於大型企業級軟體，OOP 提供的介面（Interface）與抽象層，依然是解耦合、實現依賴注入（DI）的標準手段。</li>
                </ul>

                <h4 className="text-xl font-bold text-slate-800 mt-8 mb-4">4. 大師的觀察：未來的趨勢是「務實」</h4>
                <p className="mb-4">
                    現在的頂尖高手，不再爭論 OOP 還是 FP 比較好，而是關注：「如何讓程式碼更容易預測且易於測試？」
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                        <strong className="block text-indigo-600 mb-2">結構上用 OOP</strong>
                        <span className="text-sm">用類別與介面來定義系統的層次、邊界與模組化。</span>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                        <strong className="block text-emerald-600 mb-2">邏輯上用 FP</strong>
                        <span className="text-sm">在函式內部盡量使用 Map/Reduce/Filter、純函數（Pure Functions）與不可變資料結構，減少 Side Effects。</span>
                    </div>
                </div>
                <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-500 my-6">
                    "物件導向給了我們空間的秩序（架構），而函數式程式設計給了我們時間的穩定（邏輯流）。"
                </blockquote>


                <div className="mt-16 mb-8 border-t border-slate-200 pt-8">
                    <h4 className="text-2xl font-black text-slate-800 mb-8 border-l-8 border-indigo-600 pl-4">總結：「新時代架構」 (The New Era)</h4>

                    <div className="space-y-8">
                        {/* 1. Microservices as Distributed Objects */}
                        <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                            <h5 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                微服務：本質上是「分散式的物件」
                            </h5>
                            <p className="text-slate-700 mb-6 text-sm leading-relaxed">
                                如果你讀過 OOAD 的經典定義，你會發現物件的要素是：<strong>封裝、訊息傳遞、邊界</strong>。 這不正是微服務的定義嗎？
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-50">
                                    <strong className="block text-indigo-700 mb-2 border-b border-indigo-100 pb-2">封裝 (Encapsulation)</strong>
                                    <span className="text-slate-600">每個微服務擁有自己的資料（State），外部無法直接存取，只能透過 API。</span>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-50">
                                    <strong className="block text-indigo-700 mb-2 border-b border-indigo-100 pb-2">訊息傳遞 (Messaging)</strong>
                                    <span className="text-slate-600">服務之間透過 HTTP 或 MQ 溝通，就像物件之間調用 Method。</span>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-50">
                                    <strong className="block text-indigo-700 mb-2 border-b border-indigo-100 pb-2">單一職責 (SRP)</strong>
                                    <span className="text-slate-600">一個服務只做一件事。</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Internal FP, External OOP */}
                        <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
                            <h5 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
                                <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                為什麼「內部 FP，外部 OOP」是王道？
                            </h5>
                            <p className="text-slate-700 mb-6 text-sm">在微服務架構中，大師級的設計通常遵循這個公式：</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-800 text-[10px] uppercase font-black px-2 py-1 rounded-bl-lg">Internal</div>
                                    <strong className="text-emerald-700 block mb-3 text-lg">傾向 Functional</strong>
                                    <ul className="list-disc pl-4 space-y-2 text-slate-600 text-sm marker:text-emerald-300">
                                        <li>處理業務邏輯、資料轉換、平行運算。</li>
                                        <li>追求 <strong>Stateless (無狀態)</strong>。</li>
                                        <li><strong>優點：</strong> 容易橫向擴展 (Auto-scaling)、重試 (Retry) 無副作用。</li>
                                        <li className="text-xs font-mono text-emerald-600 bg-emerald-50 inline-block px-1 rounded">Lambda, Streams, Immutable Data</li>
                                    </ul>
                                </div>
                                <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 text-[10px] uppercase font-black px-2 py-1 rounded-bl-lg">External</div>
                                    <strong className="text-blue-700 block mb-3 text-lg">傾向 Object-Oriented</strong>
                                    <ul className="list-disc pl-4 space-y-2 text-slate-600 text-sm marker:text-blue-300">
                                        <li>設計服務邊界與互動介面。</li>
                                        <li>使用 <strong>DDD (Aggregate Root)</strong>。</li>
                                        <li><strong>優點：</strong> 定義業務邊界，確保跨服務資料一致性。</li>
                                        <li className="text-xs font-mono text-blue-600 bg-blue-50 inline-block px-1 rounded">REST, gRPC, Event-Driven</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* 3. Cloud Native Trends */}
                        <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                            <h5 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                                <span className="bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                雲端原生的新趨勢
                            </h5>
                            <div className="space-y-4 text-sm">
                                <div className="flex flex-col md:flex-row gap-4 items-start bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                                    <div className="font-bold text-amber-700 whitespace-nowrap min-w-[120px]">Serverless / FaaS</div>
                                    <div className="text-slate-600">
                                        如果你只維護「轉換資料的函數」，那就是 FP 的終極體現。不需要管理物件狀態，運算極其便宜且彈性。
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 items-start bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                                    <div className="font-bold text-amber-700 whitespace-nowrap min-w-[120px]">Actor Model</div>
                                    <div className="text-slate-600">
                                        (如 Erlang, Akka) 這是一種更有趣的融合。每個 Actor 是一個物件（有狀態、有行為），但它們之間嚴格透過<strong>不可變訊息（FP）</strong>通訊。這支撐了 WhatsApp 這種等級的高併發系統。
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Bottom Quote: Martin Fowler */}
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
