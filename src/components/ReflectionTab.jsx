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
                        我們在專案中透過 <strong>SRP (單一職責)</strong> 將「檔案結構」與「操作行為」分開（Visitor 模式）。
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
                        再放大到系統與系統之間。
                        <strong>Mediator 模式</strong> 就像是 API Gateway 或 Service Mesh，負責協調各個微服務的通訊，避免服務間形成網狀依賴。
                        <strong>Adapter 模式</strong> 則是用來串接第三方老舊系統，將外部混亂的資料轉接成內部乾淨的格式。
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
                    <strong>判斷準則：「存在主義測試 (Existential Test)」</strong>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>移除 <code>add/remove</code> &rarr; 「目錄」這個概念就崩塌了 &rarr; 這就是<strong>本質 (Keep in Class)</strong>。</li>
                        <li>移除 <code>exportXml</code> &rarr; 「目錄」還是「目錄」，只不過不能匯出而已 &rarr; 這是<strong>插件 (Use Visitor)</strong>。</li>
                    </ul>
                </ReflectionItem>

                <ReflectionItem
                    title="2. 關於 Facade (外觀模式)"
                    question="現在要執行一種操作，有的用 Visitor 走訪、有的用 Command 執行、有的用 Composite 建構，還得搞清楚，是不是門檻太高？"
                >
                    能不能設計一個 <strong>FileSystemFacade</strong>？讓開發者只要使用 <code>fs.search('keyword')</code> 就好，底層自動幫你組裝 Visitor 與 Strategy？這就是 API 設計的友善度。
                    <div className="mt-4 bg-slate-800 text-slate-300 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        <pre>{`class FileSystemFacade {
  constructor(root) {
    this.root = root;
    this.invoker = new CommandInvoker(); // 內部管理歷史操作
  }

  // 對外：簡單一行
  search(keyword) {
    // 對內：複雜組裝 (Visitor + Observer)
    const visitor = new FileSearchVisitor(keyword);
    this.root.accept(visitor);
    return visitor.getResults();
  }

  // 對外：簡單一行
  delete(id) {
    // 對內：複雜操作 (Command + Undo History)
    const cmd = new DeleteCommand(id);
    this.invoker.execute(cmd);
  }
}`}</pre>
                    </div>
                </ReflectionItem>

                <ReflectionItem
                    title="3. 關於 Flyweight (享元模式)"
                    question="我們說 LabelFactory 是為了享元 (Flyweight) 控制記憶體，但如果新來的同事直接 new Label('Urgent')，是不是你的 Flyweight 就失效了？"
                >
                    你有想過，要把 Label 的 Constructor 變成私有的嗎 (private or internal)？禁止直接 new？架構不能只靠口頭約束，要有機制強制執行。
                </ReflectionItem>

                <ReflectionItem
                    title="4. 關於 Life (生活中的抽象)"
                    question="你每天用的「USB 插孔」跟「插座」。如果你買了一個國外的電器，插頭形狀不合怎麼辦？"
                >
                    <p className="mb-2">1. <strong>Interface 介面</strong>：你不在乎插座後面是風力還是核能發電（實作），只在乎它提供 110V 交流電（合約）。而你的電器插頭是扁的兩腳（合約），</p>
                    <p>2. <strong>Adapter 轉接器</strong>：國外的電器，你會買個轉接頭 (Adapter)。這就是為什麼我們需要 Adapter 模式來介接不相容的舊系統，而不是去改寫整個電網。</p>
                </ReflectionItem>
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
