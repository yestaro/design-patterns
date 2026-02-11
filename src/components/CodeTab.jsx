import React, { useEffect } from 'react';
import { Code, Layers2, Zap, Activity, DatabaseZap, RotateCcw, ArrowRightLeft, Share2, Play, Workflow, Boxes, Component, Box } from 'lucide-react';
import mermaid from 'mermaid';

const CodeTab = () => {
    const [activeTab, setActiveTab] = React.useState('composite');
    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'neutral',
            securityLevel: 'loose',
            fontFamily: 'Inter, system-ui, sans-serif',
            themeVariables: {
                loopBorder: '#64748b', // 加深 loop/alt 區塊邊框顏色
                loopTextColor: '#0f172a'
            }
        });

        const renderDiagrams = async () => {
            const mermaidElements = document.querySelectorAll('.mermaid');
            mermaidElements.forEach(el => el.removeAttribute('data-processed'));
            await mermaid.run({ querySelector: '.mermaid' });
        };
        renderDiagrams();
    }, []);

    const customStyles = `
        .loopLine { stroke: #64748b !important; stroke-width: 2px !important; stroke-dasharray: 4 !important; }
        .labelBox { stroke: #64748b !important; fill: #f1f5f9 !important; }
        .labelText { fill: #0f172a !important; font-weight: bold !important; }
        .activation0 { fill: #f1f5f9 !important; stroke: #94a3b8 !important; }
    `;

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
                            &nbsp;&nbsp;<span className="text-gray-500">/** @type &#123;EntryComponent[]&#125; - 子節點列表 */</span><br />
                            &nbsp;&nbsp;<span className="text-pink-400">#children</span> = [];<br />
                            &nbsp;&nbsp;<span className="text-gray-500">/** @type &#123;BaseStrategy&#125; - 當前的排序策略 */</span><br />
                            &nbsp;&nbsp;<span className="text-pink-400">#activeStrategy</span> = null;<br />
                            <br />
                            &nbsp;&nbsp;<span className="text-blue-400">constructor</span>(id, name, created) &#123; super(id, name, 'Directory', 0, created); &#125;<br />
                            <br />
                            &nbsp;&nbsp;<span className="text-gray-500">/** 新增子節點，並立即套用目前的排序策略。 */</span><br />
                            &nbsp;&nbsp;<span className="text-blue-400">add</span>(child) &#123;<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;this.<span className="text-pink-400">#children</span>.push(child);<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;this.<span className="text-yellow-400">#applySort</span>();<br />
                            &nbsp;&nbsp;&#125;<br />
                            <br />
                            &nbsp;&nbsp;<span className="text-blue-400">remove</span>(childId) &#123; this.<span className="text-pink-400">#children</span> = this.<span className="text-pink-400">#children</span>.filter(c =&gt; c.id !== childId); &#125;<br />
                            <br />
                            &nbsp;&nbsp;<span className="text-gray-500">/** 取得子節點的"副本"。 [防禦性編程] */</span><br />
                            &nbsp;&nbsp;<span className="text-blue-400">getChildren</span>() &#123; <span className="text-blue-400">return</span> [...this.<span className="text-pink-400">#children</span>]; &#125;<br />
                            <br />
                            &nbsp;&nbsp;<span className="text-gray-500">/** 設定並執行排序策略 (Strategy Pattern) */</span><br />
                            &nbsp;&nbsp;<span className="text-blue-400">sort</span>(strategy) &#123;<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;this.<span className="text-pink-400">#activeStrategy</span> = strategy;<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;this.<span className="text-yellow-400">#applySort</span>();<br />
                            &nbsp;&nbsp;&#125;<br />
                            <br />
                            &nbsp;&nbsp;<span className="text-yellow-400">#applySort</span>() &#123;<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;if (this.<span className="text-pink-400">#activeStrategy</span>) &#123;<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;this.<span className="text-pink-400">#activeStrategy</span>.sort(this.<span className="text-pink-400">#children</span>);<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
                            &nbsp;&nbsp;&#125;<br />
                            <br />
                            &nbsp;&nbsp;<span className="text-gray-500">/** 接受訪問者 (Double Dispatch) */</span><br />
                            &nbsp;&nbsp;<span className="text-blue-400">accept</span>(visitor) &#123; visitor.visitDirectory(this); &#125;<br />
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

                        {/* 模式串連全生命週期 Sequence Diagram */}
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
                                        VIS-->> VIS: 執行業務邏輯
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
                                    alt ⛔ 結構操作 - Paste or Delete Command
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

                            {/* 1. Composition over Inheritance */}
                            <div className="space-y-4 text-left flex flex-col h-full">
                                <h5 className="font-bold text-blue-700 flex items-center gap-2 text-left"><Layers2 size={18} /> 1. 模式組合 (Composition)</h5>
                                <p className="text-base text-slate-500 text-left flex-grow">
                                    各個模式像積木一樣組合，內部都「持有」了其他模式來完成任務：
                                </p>
                                <div className="bg-slate-900 p-5 rounded-xl text-xs lg:text-sm font-mono text-slate-300 border border-slate-700 text-left h-full overflow-hidden">
                                    <span className="text-blue-400">class</span> FileSearchVisitor &#123;<br />
                                    &nbsp;&nbsp;constructor() &#123;<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;this.notifier = <span className="text-pink-400">new Subject()</span>;<br />
                                    &nbsp;&nbsp;&#125;<br />
                                    &#125;<br />
                                    <br />
                                    <span className="text-blue-400">class</span> SortCommand &#123;<br />
                                    &nbsp;&nbsp;execute() &#123;<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;this.root.<span className="text-pink-400">accept</span>(visitor);<br />
                                    &nbsp;&nbsp;&#125;<br />
                                    &#125;
                                </div>
                            </div>

                            {/* 2. Injection & Subscription */}
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
                                    <br />
                                    <span className="text-gray-500">// 注入策略 (Strategy)</span><br />
                                    <span className="text-blue-400">const</span> s = <span className="text-pink-400">new LabelSortStrategy</span>();<br />
                                    <span className="text-blue-400">const</span> c = new SortCommand(r, s);<br />
                                </div>
                            </div>

                            {/* 3. Execution */}
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
                        {/* SOLID 原則檢核表 */}
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mt-8 text-left">
                            <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-2 text-left">
                                <span className="text-xl">🛡️</span> 設計原則檢核 (SOLID Checklist)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm text-slate-700 text-left items-start">
                                {/* Left Column: S, O, L */}
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-blue-600 text-lg w-8">SRP</span>
                                            <span><b>職責分離</b>：Visitor 專注業務，Subject 專注通訊 (Visitor vs Subject)。</span>
                                        </div>
                                        <span className="text-[11px] uppercase text-slate-400 font-bold tracking-wider pl-11">Single Responsibility Principle</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-blue-600 text-lg w-8">OCP</span>
                                            <span><b>擴展開放</b>：新增功能不需修改舊有核心代碼 (Command / Visitor)。</span>
                                        </div>
                                        <span className="text-[11px] uppercase text-slate-400 font-bold tracking-wider pl-11">Open Closed Principle</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-blue-600 text-lg w-8">LSP</span>
                                            <span><b>替換原則</b>：不同類型 File/Folder (Composite) 與排序方式 Sort (Strategy) 皆可替換。</span>
                                        </div>
                                        <span className="text-[11px] uppercase text-slate-400 font-bold tracking-wider pl-11">Liskov Substitution Principle</span>
                                    </div>
                                </div>

                                {/* Right Column: I, D */}
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-blue-600 text-lg w-8">ISP</span>
                                            <span><b>介面隔離</b>：不強迫實作無用的介面方法 (Command vs Visitor)。</span>
                                        </div>
                                        <span className="text-[11px] uppercase text-slate-400 font-bold tracking-wider pl-11">Interface Segregation Principle</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-blue-600 text-lg w-8">DIP</span>
                                            <span><b>依賴反轉</b>：依賴抽象介面而非具體實作 (Invoker 依賴 Command)。</span>
                                        </div>
                                        <span className="text-[11px] uppercase text-slate-400 font-bold tracking-wider pl-11">Dependency Inversion Principle</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. 功能對照表 */}
                <section>
                    <h2 className="text-xl font-black text-slate-800 mb-10 border-l-4 border-blue-600 pl-4 text-left">5. 類別設計 vs 傳統直覺</h2>

                    {/* Tab Navigation */}
                    <div className="flex flex-wrap gap-2 mb-8 p-1 bg-slate-100 rounded-xl">
                        {[
                            { id: 'composite', icon: Workflow, label: 'Composite' },
                            { id: 'visitor', icon: Zap, label: 'Visitor' },
                            { id: 'observer', icon: Activity, label: 'Observer' },
                            { id: 'flyweight', icon: Boxes, label: 'Flyweight' },
                            { id: 'singleton', icon: Box, label: 'Singleton' },
                            { id: 'mediator', icon: DatabaseZap, label: 'Mediator' },
                            { id: 'command', icon: RotateCcw, label: 'Command' },
                            { id: 'strategy', icon: ArrowRightLeft, label: 'Strategy' },
                            { id: 'synergy', icon: Layers2, label: 'Architecture Synergy' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                                    : 'bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:ring-blue-300'
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="min-h-[500px]">

                        {/* 1. Composite */}
                        {activeTab === 'composite' && (
                            <div className="space-y-6 text-left animate-in fade-in duration-300">
                                <div className="flex items-center gap-3 mb-2 text-left">
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-700 text-left"><Workflow size={24} /></div>
                                    <h3 className="text-xl font-black text-slate-800 text-left">1. 抽象能力與結構 (Composite)</h3>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                                    <div className="bg-slate-900 p-8 rounded-3xl text-xs md:text-sm font-mono text-slate-300 border-l-8 border-green-500 shadow-xl text-left">
                                        <p className="text-green-400 mb-4 font-black text-left">// 正面：多型注入 (只認抽象介面 EntryComponent)</p>
                                        <span className="text-blue-400">class</span> DirectoryComposite <span className="text-blue-400">extends</span> EntryComponent &#123;<br />
                                        &nbsp;&nbsp;<span className="text-gray-500">// 重點：不論未來新增 Image、Word、PDF 格式，</span><br />
                                        &nbsp;&nbsp;<span className="text-gray-500">// Directory 程式碼不需要修改支援。</span><br />
                                        &nbsp;&nbsp;<span className="text-pink-400">add(EntryComponent component)</span> &#123;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;this.#children.push(component);<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;this.#applySort();<br />
                                        &nbsp;&nbsp;&#125;<br />
                                        &#125;
                                    </div>
                                    <div className="bg-slate-900 p-8 rounded-3xl text-xs md:text-sm font-mono text-slate-300 border-l-8 border-red-500 text-left">
                                        <p className="text-red-400 mb-4 font-black text-left">// 反面：硬編碼具體類型 (Hardcoded Adders)</p>
                                        <span className="text-blue-400">class</span> Directory &#123;<br />
                                        &nbsp;&nbsp;addFile(File f) &#123; ... &#125;<br />
                                        &nbsp;&nbsp;addDir(Directory d) &#123; ... &#125;<br />
                                        &nbsp;&nbsp;addImage(Image i) &#123; ... &#125; <span className="text-red-400">// 痛點：每加一型就要改核心</span><br />
                                        &nbsp;&nbsp;addWord(Word doc) &#123; ... &#125; <span className="text-red-400">// 痛點：不斷膨脹</span><br />
                                        &nbsp;&nbsp;<span className="text-gray-500">// Directory 淪為類型檢查的垃圾場。</span><br />
                                        &#125;
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Visitor */}
                        {activeTab === 'visitor' && (
                            <div className="space-y-6 text-left animate-in fade-in duration-300">
                                <div className="flex items-center gap-3 mb-2 text-left">
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-700 text-left"><Zap size={24} /></div>
                                    <h3 className="text-xl font-black text-slate-800 text-left">2. 行為插件化與多功能支援 (Visitor)</h3>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                                    <div className="bg-slate-900 p-8 rounded-3xl text-xs md:text-sm font-mono text-slate-300 border-l-8 border-green-500 shadow-xl text-left">
                                        <p className="text-green-400 mb-4 font-black text-left">// 正面：只需 accept，切換 Visitor 實例即可</p>
                                        <span className="text-gray-500">// 1. 匯出功能 (對應反面 exportXML 邏輯)</span><br />
                                        root.<span className="text-pink-400">accept</span>(new XmlExportVisitor());<br />
                                        <br />
                                        <span className="text-gray-500">// 2. 搜尋功能 (對應反面 handleSearch 邏輯)</span><br />
                                        root.<span className="text-pink-400">accept</span>(new FileSearchVisitor("API"));<br />
                                        <br />
                                        <span className="text-gray-500">// 價值：遞迴引擎固化，增加功能不需重寫遍歷邏輯。</span>
                                    </div>
                                    <div className="bg-slate-900 p-8 rounded-3xl text-xs md:text-sm font-mono text-slate-300 border-l-8 border-red-500 text-left">
                                        <p className="text-red-400 mb-4 font-black text-left">// 反面：手動撰寫重複的遞迴遍歷</p>
                                        <span className="text-blue-400">function</span> exportXML(node) &#123;<br />
                                        &nbsp;&nbsp;if(node.isDir) node.children.forEach(c =&gt; exportXML(c));<br />
                                        &nbsp;&nbsp;else handleXML(node); <span className="text-red-400">// 痛點：重複遞迴遍歷</span><br />
                                        &#125;<br />
                                        <br />
                                        <span className="text-blue-400">function</span> search(node, k) &#123;<br />
                                        &nbsp;&nbsp;if(node.isDir) node.children.forEach(c =&gt; search(c, k));<br />
                                        &nbsp;&nbsp;else handleSearch(node, k); <span className="text-red-400">// 若不想重複遍歷，就得多傳參數判斷</span><br />
                                        &#125;
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. Observer */}
                        {activeTab === 'observer' && (
                            <div className="space-y-6 text-left animate-in fade-in duration-300">
                                <div className="flex items-center gap-3 mb-2 text-left">
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-700 text-left"><Activity size={24} /></div>
                                    <h3 className="text-xl font-black text-slate-800 text-left">3. 視圖同步：框架無關通訊 (Observer)</h3>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                                    <div className="bg-slate-900 p-8 rounded-3xl text-xs md:text-sm font-mono text-slate-300 border-l-8 border-green-500 shadow-xl text-left">
                                        <p className="text-green-400 mb-4 font-black text-left">// 正面：通知器廣播機制 (this.notifier.notify)</p>
                                        <span className="text-blue-400">class</span> FileSearchVisitor &#123;<br />
                                        &nbsp;&nbsp;<span className="text-gray-500">// 使用組合 (Has-a) Observer Pattern</span><br />
                                        &nbsp;&nbsp;this.notifier = new Subject(); <br />
                                        &nbsp;&nbsp;visitFile(f) &#123;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;if (f.name.toLowerCase().includes(this.keyword)) &#123;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;this.foundIds.push(f.id); <br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">this.notifier.notify</span>(&#123; msg: `搜尋中: $&#123;f.name&#125;` &#125;);<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
                                        &#125;<br />
                                        <span className="text-gray-500">// 任務物件不認識 UI，換前端框架 React 到 Vue 一行不改。</span>
                                    </div>
                                    <div className="bg-slate-900 p-8 rounded-3xl text-xs md:text-sm font-mono text-slate-300 border-l-8 border-red-500 text-left">
                                        <p className="text-red-400 mb-4 font-black text-left">// 反面：強耦合的框架狀態呼叫</p>
                                        <span className="text-blue-400">function</span> handleSearch(node, keyword) &#123;<br />
                                        &nbsp;&nbsp;if (node.name.includes(keyword)) found.push(node.id);<br />
                                        &nbsp;&nbsp;<span className="text-red-400">// 痛點 1：商業邏輯中混雜著 UI 更新，綁死特定框架</span><br />
                                        &nbsp;&nbsp;setReactState(`搜尋中: $&#123;node.name&#125;`);<br />
                                        &nbsp;&nbsp;document.getElementById('progressBar').value = 50;<br />
                                        &nbsp;&nbsp;<span className="text-red-400">// 痛點 2：手動處理遞迴 (Recursion Hell)</span><br />
                                        &nbsp;&nbsp;if (node.children) node.children.forEach(c =&gt; handleSearch(c, keyword));<br />
                                        &#125;
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. Flyweight + Factory */}
                        {activeTab === 'flyweight' && (
                            <div className="space-y-6 text-left animate-in fade-in duration-300">
                                <div className="flex items-center gap-3 mb-2 text-left">
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-700 text-left"><Boxes size={24} /></div>
                                    <h3 className="text-xl font-black text-slate-800 text-left">4. 資源共享與實體工廠 (Flyweight + Factory)</h3>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                                    <div className="bg-slate-900 p-8 rounded-3xl text-xs md:text-sm font-mono text-slate-300 border-l-8 border-green-500 shadow-xl text-left">
                                        <p className="text-green-400 mb-4 font-black text-left">// 正面：工廠類別實作 (Factory.getLabel)</p>
                                        <span className="text-blue-400">class</span> LabelFactory &#123;<br />
                                        &nbsp;&nbsp;const labels = &#123;&#123; 'Urgent': 'bg-red-500' &#125;, ...&#125;;<br />
                                        &nbsp;&nbsp;<span className="text-pink-400">getLabel(name) &#123;</span><br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;if(!this.labels[name]) &#123;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;this.labels[name] = new Label(name, color);<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;return this.labels[name]; <span className="text-gray-500">// 共享實體</span><br />
                                        &nbsp;&nbsp;&#125;<br />
                                        &#125;<br />
                                        <br />
                                        <span className="text-gray-500">// 1. 取得唯一實體 (Flyweight)，標籤實體全域共享</span><br />
                                        <span className="text-blue-400">const</span> label = <span className="text-pink-400">LabelFactory.getLabel('Urgent');</span><br />
                                    </div>
                                    <div className="bg-slate-900 p-8 rounded-3xl text-xs md:text-sm font-mono text-slate-300 border-l-8 border-red-500 text-left">
                                        <p className="text-red-400 mb-4 font-black text-left">// 反面：類別污染與記憶體浪費</p>
                                        <span className="text-gray-500">// 1. 重複實例化 (Memory Leak)</span><br />
                                        file1.tags.push(<span className="text-blue-400">new Label('Urgent', 'bg-red-500')</span>);<br />
                                        file1.tags.push(new Label('Work', 'bg-blue-500'));<br />
                                        <br />
                                        <span className="text-gray-500">// 2. 每次使用者又選不同的檔案就會 new 一次 Label。</span><br />
                                        fileX.tags.push(<span className="text-blue-400">new Label('Urgent', 'bg-red-500')</span>);<br />
                                        fileX.tags.push(new Label('Personal', 'bg-green-500'));<br />
                                        <br />
                                        <span className="text-red-400">// 痛點：若 1000 個檔案標註 Urgent，就 new 了 1000 次。</span><br />
                                        <span className="text-red-400">// 記憶體浪費嚴重，且無法統一管理標籤外觀。</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 5. Singleton */}
                        {activeTab === 'singleton' && (
                            <div className="space-y-6 text-left animate-in fade-in duration-300">
                                <div className="flex items-center gap-3 mb-2 text-left">
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-700 text-left"><Box size={24} /></div>
                                    <h3 className="text-xl font-black text-slate-800 text-left">5. 全域單例與狀態管理 (Singleton)</h3>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                                    <div className="bg-slate-900 p-8 rounded-3xl text-xs md:text-sm font-mono text-slate-300 border-l-8 border-green-500 shadow-xl text-left">
                                        <p className="text-green-400 mb-4 font-black text-left">// 正面：確保唯一實例</p>
                                        <span className="text-blue-400">class</span> Clipboard &#123;<br />
                                        &nbsp;&nbsp;<span className="text-blue-400">static</span> instance = null;<br />
                                        &nbsp;&nbsp;<span className="text-blue-400">constructor</span>() &#123;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-500">// 強制禁止直接 new，保護單例完整性</span><br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">if (Clipboard.instance) throw new Error("Use getInstance()");</span><br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;this._content = null;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;Clipboard.instance = this;<br />
                                        &nbsp;&nbsp;&#125;<br />
                                        &nbsp;&nbsp;<span className="text-blue-400">static getInstance</span>() &#123;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">if (!Clipboard.instance) new Clipboard();</span><br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;return Clipboard.instance;<br />
                                        &nbsp;&nbsp;&#125;<br />
                                        &#125;<br />
                                        <br />
                                        <span className="text-gray-500">// 1. 禁止直接 new，會拋出錯誤</span><br />
                                        <span className="text-blue-400">const</span> c1 = new Clipboard(); <span className="text-red-400">// Error!</span><br />
                                        <br />
                                        <span className="text-gray-500">// 2. 只能透過靜態方法取得唯一實體</span><br />
                                        <span className="text-blue-400">const</span> c2 = Clipboard.getInstance();<br />
                                    </div>
                                    <div className="bg-slate-900 p-8 rounded-3xl text-xs md:text-sm font-mono text-slate-300 border-l-8 border-red-500 text-left">
                                        <p className="text-red-400 mb-4 font-black text-left">// 反面：多頭馬車與狀態斷裂</p>
                                        <span className="text-gray-500">// 1. Toolbar 元件自己 new 一個</span><br />
                                        <span className="text-blue-400">class</span> Toolbar &#123;<br />
                                        &nbsp;&nbsp;onCopy(file) &#123;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> cb = new Clipboard(); <span className="text-red-400">// 實體 A</span><br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;cb.set(file);<br />
                                        &nbsp;&nbsp;&#125;<br />
                                        &#125;<br />
                                        <br />
                                        <span className="text-gray-500">// 2. ContextMenu 元件也自己 new 一個</span><br />
                                        <span className="text-blue-400">class</span> ContextMenu &#123;<br />
                                        &nbsp;&nbsp;onPaste() &#123;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> cb = new Clipboard(); <span className="text-red-400">// 實體 B</span><br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> item = cb.get(); <span className="text-red-400">// null! 兩個剪貼簿不互通</span><br />
                                        &nbsp;&nbsp;&#125;<br />
                                        &#125;<br />
                                        <br />
                                        <span className="text-gray-500">// 3. 解決方案？Props Drilling 地獄，只能被迫把 instance 從最上層一路傳下來...</span><br />
                                        &lt;App clipboard=&#123;cb&#125;&gt;<br />
                                        &nbsp;&nbsp;&lt;Toolbar clipboard=&#123;cb&#125; /&gt;<br />
                                        &nbsp;&nbsp;&lt;Content clipboard=&#123;cb&#125; /&gt;<br />
                                        &lt;/App&gt;
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 6. Mediator */}
                        {activeTab === 'mediator' && (
                            <div className="space-y-6 text-left animate-in fade-in duration-300">
                                <div className="flex items-center gap-3 mb-2 text-left">
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-700 text-left"><DatabaseZap size={24} /></div>
                                    <h3 className="text-xl font-black text-slate-800 text-left">6. 標籤管理：高速反向索引 (Mediator)</h3>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                                    <div className="bg-slate-900 p-8 rounded-3xl text-xs md:text-sm font-mono text-slate-300 border-l-8 border-green-500 shadow-xl text-left">
                                        <p className="text-green-400 mb-4 font-black text-left">// 正面：中介雙向映射表 (TagMediator)</p>
                                        <span className="text-blue-400">class</span> TagMediator &#123;<br />
                                        &nbsp;&nbsp;constructor() &#123;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">this.labelToFiles = new Map();</span> <span className="text-gray-500">// 反向索引技術</span><br />
                                        &nbsp;&nbsp;&#125;<br />
                                        &nbsp;&nbsp;<span className="text-blue-400">attach(id, name)</span> &#123; this.labelToFiles.get(name).add(id); &#125;<br />
                                        &nbsp;&nbsp;<span className="text-blue-400">getFiles(name)</span> &#123; return this.labelToFiles.get(name); &#125;<br />
                                        &#125;<br />
                                        <span className="text-gray-500">// 1. 透過中介者貼標籤，不污染 File 物件。</span><br />
                                        tagMediator.attach(file.id, label.name);<br />
                                        <span className="text-gray-500">// 2. 反向查詢：不用遞迴，O(1) 取得所有 "Work" 檔案</span><br />
                                        <span className="text-blue-400">const</span> files = <span className="text-pink-400">tagMediator.getFiles('Work');</span><br />
                                    </div>
                                    <div className="bg-slate-900 p-8 rounded-3xl text-xs md:text-sm font-mono text-slate-300 border-l-8 border-red-500 text-left">
                                        <p className="text-red-400 mb-4 font-black text-left">// 反面：屬性入侵與暴力掃描 (O(N))</p>
                                        <span className="text-gray-500">// 1. 直接修改檔案類別結構 (汚染 - 檔案應該只負責檔案的事情，無 tags 屬性)</span><br />
                                        <span className="text-blue-400">file.tags = [];</span><br />
                                        <br />
                                        <span className="text-gray-500">// 2. 直接貼到該檔案的 tags 陣列中 (汚染)</span><br />
                                        file.tags.push(new Label('Work', 'bg-blue-500'));<br />
                                        file.tags.push(new Label('Urgent', 'bg-red-500'));<br />
                                        <br />
                                        <span className="text-red-400">// 痛點：如果要查詢「哪些檔案貼了 Work」？</span><br />
                                        <span className="text-blue-400">const</span> results = files.filter(f =&gt; f.tags.includes('Work'));<br />
                                        <br />
                                        <span className="text-red-400">// 災難：這是一個 O(N) 暴力掃描。又要再遞迴遍歷所有檔案。</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 7. Command */}
                        {activeTab === 'command' && (
                            <div className="space-y-6 text-left animate-in fade-in duration-300">
                                <div className="flex items-center gap-3 mb-2 text-left">
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-700 text-left"><RotateCcw size={24} /></div>
                                    <h3 className="text-xl font-black text-slate-800 text-left">7. 行為物件化與復原 (Command)</h3>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                                    <div className="bg-slate-900 p-8 rounded-3xl text-xs md::text-sm font-mono text-slate-300 border-l-8 border-green-500 shadow-xl text-left">
                                        <p className="text-green-400 mb-4 font-black text-left">// 正面：操作封裝與統一介面</p>
                                        <span className="text-blue-400">class</span> DeleteCommand &#123;<br />
                                        &nbsp;&nbsp;execute() &#123;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;this.backup = this.dir.getChildren().find(c =&gt; c.id === this.id);<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;this.dir.<span className="text-pink-400">remove</span>(this.id);<br />
                                        &nbsp;&nbsp;&#125;<br />
                                        &nbsp;&nbsp;undo() &#123;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;this.dir.<span className="text-pink-400">add</span>(this.backup);<br />
                                        &nbsp;&nbsp;&#125;<br />
                                        &#125;<br />
                                        <br />
                                        <span className="text-gray-500">// 1. 統一介面管理</span><br />
                                        commandInvoker.execute(<span className="text-pink-400">new DeleteCommand(...)</span>);<br />
                                        commandInvoker.execute(<span className="text-pink-400">new SortCommand(...)</span>);<br />
                                        <span className="text-gray-500">// 2. 撤銷</span><br />
                                        commandInvoker.undo();
                                    </div>
                                    <div className="bg-slate-900 p-8 rounded-3xl text-xs md:text-sm font-mono text-slate-300 border-l-8 border-red-500 text-left">
                                        <p className="text-red-400 mb-4 font-black text-left">// 反面：直接呼叫與全域快照</p>
                                        <span className="text-gray-500">// 1. 直接呼叫不同方法 (無統一介面)</span><br />
                                        directory.remove(id); <span className="text-gray-500">// 刪除</span><br />
                                        directory.sort();     <span className="text-gray-500">// 排序</span><br />
                                        <br />
                                        <span className="text-gray-500">// 2. 上一步怎麼辦？只能備份整棵樹</span><br />
                                        <span className="text-blue-400">history.push(JSON.stringify(tree));</span><br />
                                        <br />
                                        <span className="text-red-400">// 災難：無法只"復原排序"而不影響"刪除"。</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 8. Strategy */}
                        {activeTab === 'strategy' && (
                            <div className="space-y-6 text-left animate-in fade-in duration-300">
                                <div className="flex items-center gap-3 mb-2 text-left">
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-700 text-left"><ArrowRightLeft size={24} /></div>
                                    <h3 className="text-xl font-black text-slate-800 text-left">8. 策略切換與注入 (Strategy)</h3>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                                    <div className="bg-slate-900 p-8 rounded-3xl text-xs md:text-sm font-mono text-slate-300 border-l-8 border-green-500 shadow-xl text-left">
                                        <p className="text-green-400 mb-4 font-black text-left">// 正面：策略注入 (隨插隨用)</p>
                                        <span className="text-gray-500">// A. 依標籤排序</span><br />
                                        <span className="text-blue-400">const</span> s1 = <span className="text-pink-400">new LabelSortStrategy(tagManager, 'asc')</span>;<br />
                                        commandInvoker.execute(new SortCommand(root, s1));<br />
                                        <span className="text-gray-500">// B. 依名稱排序 (抽換策略，但執行邏輯一致)</span><br />
                                        <span className="text-blue-400">const</span> s2 = <span className="text-pink-400">new AttributeSortStrategy('name', 'asc')</span>;<br />
                                        <span className="text-gray-500">// 呼叫 SortCommand 的程式碼不變，可被管理</span><br />
                                        commandInvoker.execute(new SortCommand(root, s2));<br />

                                    </div>
                                    <div className="bg-slate-900 p-8 rounded-3xl text-xs md:text-sm font-mono text-slate-300 border-l-8 border-red-500 text-left">
                                        <p className="text-red-400 mb-4 font-black text-left">// 反面：巢狀判斷語法 (Condition Hell)</p>
                                        <span className="text-blue-400">function</span> handleSort(type) &#123;<br />
                                        &nbsp;&nbsp;if(type === 'name') ...<br />
                                        &nbsp;&nbsp;else if(type === 'size') ...<br />
                                        &nbsp;&nbsp;else if(type === 'tag') ...<br />
                                        &nbsp;&nbsp;<span className="text-red-400">// 痛點：每加一條規則，就要大改核心遍歷邏輯。</span><br />
                                        &#125;
                                    </div>
                                </div>
                            </div>
                        )}



                        {activeTab === 'synergy' && (
                            <div className="space-y-6 text-left animate-in fade-in duration-300">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-indigo-100 rounded-xl">
                                        <Layers2 size={24} className="text-indigo-600" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 text-left">8. 整體使用情境 (Architecture Synergy)</h3>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                                    <div className="bg-slate-900 p-8 rounded-3xl text-xs md:text-sm font-mono text-slate-300 border-l-8 border-green-500 shadow-xl text-left">
                                        <p className="text-green-400 mb-4 font-black text-left">// 正面：模式協同 (Explorer Tools)</p>
                                        <span className="text-gray-500">// 1. 基礎設施與配置 (Global Configuration)</span><br />
                                        <span className="text-gray-500">// Factory: 統一管理行為物件的創建 (Abstract Factory 雛形)</span><br />
                                        <span className="text-blue-400">class</span> BehaviorFactory &#123;<br />
                                        &nbsp;&nbsp;<span className="text-blue-400">static</span> visitorRegistry = &#123;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">'xml'</span>: () =&gt; <span className="text-pink-400">new XmlExportVisitor()</span>,<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">'size'</span>: () =&gt; <span className="text-pink-400">new SizeCalculatorVisitor()</span>,<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">'search'</span>: (args) =&gt; <span className="text-pink-400">new FileSearchVisitor(args.keyword)</span><br />
                                        &nbsp;&nbsp;&#125;;<br />
                                        <br />
                                        &nbsp;&nbsp;<span className="text-blue-400">static</span> commandRegistry = &#123;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">'tag'</span>: (args) =&gt; <span className="text-pink-400">new TagCommand</span>(tagMediator, args.id, args.label),<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">'delete'</span>: (args) =&gt; <span className="text-pink-400">new DeleteCommand</span>(args.id, args.parent),<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">'copy'</span>: (args) =&gt; <span className="text-pink-400">new CopyCommand</span>(args.id),<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">'paste'</span>: (args) =&gt; <span className="text-pink-400">new PasteCommand</span>(args.parentId),<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">'sort'</span>: (args) =&gt; &#123;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> strategy = <span className="text-pink-400">new LabelSortStrategy(tagMediator, 'asc')</span>;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">return</span> <span className="text-pink-400">new SortCommand(root, strategy)</span>;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
                                        &nbsp;&nbsp;&#125;;<br />
                                        <br />
                                        &nbsp;&nbsp;<span className="text-blue-400">static</span> createVisitor(type, args) &#123;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> factory = this.visitorRegistry[type];<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">return</span> factory ? factory(args) : null;<br />
                                        &nbsp;&nbsp;&#125;<br />
                                        <br />
                                        &nbsp;&nbsp;<span className="text-blue-400">static</span> createCommand(type, args) &#123;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> factory = this.commandRegistry[type];<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">return</span> factory ? factory(args) : null;<br />
                                        &nbsp;&nbsp;&#125;<br />
                                        &#125;<br />
                                        <br />
                                        <span className="text-gray-500">// 2. 系統單例初始化</span><br />
                                        <span className="text-blue-400">const</span> root = new DirectoryComposite('Root');     <span className="text-gray-500">// Composite</span><br />
                                        <span className="text-blue-400">const</span> tagMediator = new TagMediator();             <span className="text-gray-500">// Mediator (Global)</span><br />
                                        <span className="text-blue-400">const</span> commandInvoker = new CommandInvoker();     <span className="text-gray-500">// Command (Global)</span><br />
                                        <span className="text-gray-500">// [Observer] 訂閱 Command 執行通知 (解耦，包含 Tag/Delete 等所有操作)</span><br />
                                        commandInvoker.<span className="text-pink-400">notifier.subscribe</span>(new ConsoleObserver());<br />
                                        <br />
                                        <span className="text-gray-500">// 3. 功能執行邏輯 (Business Logic)</span><br />
                                        <span className="text-blue-400">function</span> runAnalysis(type, args) &#123;<br />
                                        &nbsp;&nbsp;<span className="text-gray-500">// A. 透過工廠建立 Visitor</span><br />
                                        &nbsp;&nbsp;<span className="text-blue-400">const</span> visitor = BehaviorFactory.createVisitor(type, args);<br />
                                        &nbsp;&nbsp;<span className="text-blue-400">if</span> (!visitor) <span className="text-blue-400">return</span>;<br />
                                        <br />
                                        &nbsp;&nbsp;<span className="text-gray-500">// B. 訂閱 Observer (解耦 UI 更新)</span><br />
                                        &nbsp;&nbsp;<span className="text-blue-400">const</span> consoleObs = new ConsoleObserver();<br />
                                        &nbsp;&nbsp;<span className="text-blue-400">const</span> dashboardObs = new DashboardObserver();<br />
                                        &nbsp;&nbsp;visitor.<span className="text-pink-400">notifier.subscribe</span>(consoleObs);<br />
                                        &nbsp;&nbsp;visitor.<span className="text-pink-400">notifier.subscribe</span>(dashboardObs);<br />
                                        <br />
                                        &nbsp;&nbsp;<span className="text-gray-500">// C. 執行 (Double Dispatch)</span><br />
                                        &nbsp;&nbsp;root.<span className="text-pink-400">accept</span>(visitor);<br />
                                        &#125;<br />
                                        <br />
                                        <span className="text-blue-400">function</span> executeCommand(type, args) &#123;<br />
                                        &nbsp;&nbsp;<span className="text-gray-500">// 透過工廠方法建立 Command</span><br />
                                        &nbsp;&nbsp;<span className="text-blue-400">const</span> cmd = BehaviorFactory.createCommand(type, args);<br />
                                        &nbsp;&nbsp;<span className="text-blue-400">if</span> (cmd) commandInvoker.execute(cmd);<br />
                                        &#125;<br />
                                        <br />
                                        <span className="text-gray-500">// 4. 歷史回溯 (Undo/Redo)</span><br />
                                        <span className="text-blue-400">function</span> handleUndo() &#123; commandInvoker.undo(); &#125;<br />
                                        <span className="text-blue-400">function</span> handleRedo() &#123; commandInvoker.redo(); &#125;
                                    </div>
                                    <div className="bg-slate-900 p-8 rounded-3xl text-xs md:text-sm font-mono text-slate-300 border-l-8 border-red-500 text-left">
                                        <p className="text-red-400 mb-4 font-black text-left">// 反面：上帝函式 (麵條式代碼)</p>
                                        <span className="text-blue-400">let</span> files = []; <span className="text-gray-500">// 全域變數，以陣列記錄樹狀結構</span><br />
                                        <br />
                                        <span className="text-gray-500">// 反面教材：上帝函式 (God Function) - 所有邏輯混雜在一個迴圈</span><br />
                                        <span className="text-blue-400">function</span> godProcessing(type, args) &#123;<br />
                                        &nbsp;&nbsp;<span className="text-gray-500">// [Observer] 耦合 UI，每多一個 UI 要更新，這裏就得再改</span><br />
                                        &nbsp;&nbsp;<span className="text-blue-400">const</span> updateUI = (msg) =&gt; document.getElementById('status').innerText = msg;<br />
                                        &nbsp;&nbsp;<span className="text-blue-400">let</span> result = (type === 'size') ? 0 : (type === 'xml') ? '&lt;root&gt;' : [];<br />
                                        <br />
                                        &nbsp;&nbsp;<span className="text-gray-500">// 試圖用一個通用迴圈處理所有邏輯 (The "One Loop" Fallacy)</span><br />
                                        &nbsp;&nbsp;<span className="text-blue-400">function</span> traverse(nodes, depth) &#123;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">for</span> (<span className="text-blue-400">let</span> i = 0; i &lt; nodes.length; i++) &#123;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">const</span> node = nodes[i];<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-500">// 0. [Observer] 耦合 UI，其實還要判斷那些 type, args 才需要更新</span><br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-red-400">updateUI(`Processing $&#123;node.name&#125;...`);</span><br />
                                        <br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-500">// 1. [Visitor] 搜尋 (依賴 type 變數判斷)</span><br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">if</span> (type === 'search' && node.name.includes(args.kw)) result.push(node);<br />
                                        <br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-500">// 2. [Visitor] XML 匯出</span><br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">else if</span> (type === 'xml') result += `&lt;node name="$&#123;node.name&#125;"&gt;`;<br />
                                        <br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-500">// 3. [Visitor] 計算大小</span><br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">else if</span> (type === 'size' && node.type === 'file') result += node.size;<br />
                                        <br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-500">// 4. [Command] 刪除 (直接修改陣列，非常危險)</span><br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">else if</span> (type === 'delete' && node.id === args.id) &#123;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;nodes.splice(i, 1); i--; <span className="text-gray-500">// 恐怖的索引操作</span><br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
                                        <br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-500">// 5. [Mediator] 貼標籤 (直接修改物件屬性)</span><br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">else if</span> (type === 'tag' && node.id === args.id) &#123;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-red-400">if (!node.tags) node.tags = []; node.tags.push(args.label);</span><br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
                                        <br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-500">// 6. [Strategy] 排序 (僵化)</span><br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">else if</span> (type === 'sort' && node.children) &#123;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-red-400">if (args.attr === 'name') node.children.sort((a,b) =&gt; a.name.localeCompare(b.name));</span><br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-red-400">else if (args.attr === 'size') node.children.sort((a,b) =&gt; a.size - b.size);</span><br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-red-400">else if (args.attr === 'tag') node.children.sort((a,b) =&gt; (a.tags?.[0] || '').localeCompare(b.tags?.[0] || ''));</span><span className="text-gray-500">// 每次新增一種排序都要改核心代碼 (違反 OCP)</span><br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
                                        <br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-500">// 7. [Singleton] 複製 (全域變數污染)</span><br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">else if</span> (type === 'copy' && node.id === args.id) &#123;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-red-400">window.tempClipboard = JSON.parse(JSON.stringify(node));</span> <span className="text-gray-500">// 隨便掛在 window</span><br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">else if</span> (type === 'paste' && node.id === args.parentId) &#123;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-red-400">if (window.tempClipboard) node.children.push(window.tempClipboard);</span><br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
                                        <br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-500">// [Recursion] 遞迴邏輯也混在一起，順便處理 XML 結尾標籤</span><br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">if</span> (node.children) &#123;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;traverse(node.children, depth + 1);<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">if</span> (type === 'xml') result += `&lt;/node&gt;`;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
                                        &nbsp;&nbsp;&#125;<br />
                                        <br />
                                        &nbsp;&nbsp;traverse(files, 0);<br />
                                        &nbsp;&nbsp;<span className="text-blue-400">return</span> type === 'xml' ? result + '&lt;/root&gt;' : result;<br />
                                        &#125;<br />
                                    </div>
                                </div>
                            </div>
                        )}

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
        </div >
    );
};

export default CodeTab;
