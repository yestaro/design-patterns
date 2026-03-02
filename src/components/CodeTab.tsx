import { ArrowRight, Layers2, Play, Share2 } from 'lucide-react';
import mermaid from 'mermaid';
import React, { useEffect, useState } from 'react';
import { patterns } from '../data/patterns';
import CodeBlock from './shared/CodeBlock';
import { MacOSDock } from './shared/MacOSDock';

import { MindMapDialog } from './shared/MindMapDialog';

const CodeTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState('composite');
  const [isMobile, setIsMobile] = useState(false);
  const [isMindMapOpen, setIsMindMapOpen] = useState(false);

  // 根據 patterns 的 themeColor 自動映射出 Dock 的顏色
  const DOCK_COLOR_MAP = React.useMemo(() => {
    const dockThemeMap: Record<string, string> = {
      amber: "text-amber-300", emerald: "text-emerald-300", indigo: "text-indigo-300",
      pink: "text-pink-300", cyan: "text-cyan-300", orange: "text-orange-300",
      red: "text-red-300", purple: "text-purple-300", lime: "text-lime-300",
      fuchsia: "text-fuchsia-300", sky: "text-sky-300", blue: "text-blue-300",
      teal: "text-teal-300", stone: "text-stone-300",
    };
    return patterns.reduce((acc, p) => {
      acc[p.id] = dockThemeMap[p.themeColor] || "text-slate-300";
      return acc;
    }, {} as Record<string, string>);
  }, []);

  // 展示區塊列表的圖標主題背景
  const iconThemeMap: Record<string, string> = {
    amber: "bg-amber-100 text-amber-700", emerald: "bg-emerald-100 text-emerald-700",
    indigo: "bg-indigo-100 text-indigo-700", pink: "bg-pink-100 text-pink-700",
    cyan: "bg-cyan-100 text-cyan-700", orange: "bg-orange-100 text-orange-700",
    red: "bg-red-100 text-red-700", purple: "bg-purple-100 text-purple-700",
    lime: "bg-lime-100 text-lime-700", fuchsia: "bg-fuchsia-100 text-fuchsia-700",
    sky: "bg-sky-100 text-sky-700", blue: "bg-blue-100 text-blue-700",
    teal: "bg-teal-100 text-teal-700", stone: "bg-stone-100 text-stone-700"
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  return (
    <div className="min-h-[605px] text-left animate-in fade-in duration-500">
      <style>{customStyles}</style>
      <div className="w-full space-y-8 pb-24 text-base md:text-lg text-left">

        {/* 1. 封裝與可見性分析 */}
        <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <h2 className="text-xl font-black text-slate-800 mb-6 border-l-4 border-blue-600 pl-4 text-left">1. 封裝與可見性分析 (Encapsulation)</h2>
          <div className="space-y-6 text-left">
            <p className="text-slate-600 leading-relaxed font-medium text-left">
              核心資料 <b>#children</b> 被定義為私有屬性。這<b>確保物件能完整控制其內部狀態</b>（即不變量 Invariant）。
            </p>
            <div className="bg-slate-900 rounded-xl p-6 text-slate-300 font-mono text-xs lg:text-sm shadow-lg border border-slate-700 text-left whitespace-pre-wrap break-words">
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
        <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <h2 className="text-xl font-black text-slate-800 mb-6 border-l-4 border-blue-600 pl-4 text-left">2. 抽象與共同屬性 (Abstraction)</h2>
          <div className="space-y-6 text-left">
            <p className="text-slate-600 leading-relaxed font-medium text-left">
              抽象並非只是為了寫更少的程式碼，而是為了<b>定義系統的通訊契約</b>。「Interface/Protocol/Trait」
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
              <div className="bg-indigo-600 text-white p-8 rounded-2xl shadow-xl flex flex-col justify-center text-left">
                <h4 className="font-black text-xl mb-4 flex items-center gap-2 text-left"><Layers2 size={24} /> 抽象的教學價值</h4>
                <p className="italic leading-loose text-left">
                  「掌握了 EntryComponent 的 accept 介面，你就掌握了整棵樹。遞迴邏輯會自動處理對象，不需再寫判斷類型。往後的功能擴充，都只需要新增 Visitor，不需要修改既有的樹結構。」
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 擁有 vs 繼承 */}
        <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <h2 className="text-xl font-black text-slate-800 mb-6 border-l-4 border-blue-600 pl-4 text-left">3. 擁有 vs 繼承 (Composition over Inheritance)</h2>
          <div className="space-y-6 text-left">
            <p className="text-slate-600 leading-relaxed font-medium text-left">
              在處理觀察者模式時，我們面臨語意與彈性的權衡：<b>Visitor 是否應該繼承 Subject</b>？「繼承是代碼重用最爛的方式」。
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

            {/* VR 快打 2 風格：組合優於繼承 */}
            {/* <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200 relative overflow-hidden group shadow-sm">
              <div className="absolute top-2 right-4 text-7xl font-black text-indigo-200/40 select-none italic tracking-tighter">VF 2</div>

              <div className="relative z-10 flex gap-5 items-start">
                <div className="flex flex-col gap-2 shrink-0">
                  <div className="w-12 h-12 bg-white rounded-full border-4 border-slate-300 shadow-inner flex items-center justify-center font-black text-slate-400 text-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">P</div>
                  <div className="w-12 h-12 bg-white rounded-full border-4 border-slate-300 shadow-inner flex items-center justify-center font-black text-slate-400 text-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">K</div>
                  <div className="w-12 h-12 bg-white rounded-full border-4 border-slate-300 shadow-inner flex items-center justify-center font-black text-slate-400 text-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">G</div>
                </div>

                <div className="flex-1">
                  <h4 className="font-black text-xl mb-4 text-indigo-900 italic tracking-tight flex items-center gap-3">
                    <Landmark className="text-indigo-600" size={20} /> 組合的奧義 - Punch, Kick, Guard
                  </h4>
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white shadow-sm space-y-3">
                    <p className="text-slate-800 leading-relaxed font-bold">
                      為什麼說「組合（Composition）」勝過繼承？
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      這就像結城晶的<b className="text-indigo-700">「崩擊雲身雙虎掌」</b>。
                      它不是一個單一招式類別，而是透過<b>崩拳、鷂子穿林、雙掌</b>三個獨立動作（Has-a）組合成的強大技。
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm font-black text-indigo-600">
                      <div className="flex flex-col items-center gap-1">
                        <span className="bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200">崩拳</span>
                        <span className="text-xs font-mono text-slate-400">P + K + G</span>
                      </div>
                      <span className="text-slate-300 pb-4">+</span>
                      <div className="flex flex-col items-center gap-1">
                        <span className="bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200">鷂子穿林</span>
                        <span className="text-xs font-mono text-slate-400">← ↘ P + K</span>
                      </div>
                      <span className="text-slate-300 pb-4">+</span>
                      <div className="flex flex-col items-center gap-1">
                        <span className="bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200">雙掌</span>
                        <span className="text-xs font-mono text-slate-400">← P</span>
                      </div>
                      <span className="text-slate-300 pb-4">=</span>
                      <div className="flex flex-col items-center gap-1">
                        <span className="bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200">崩擊雲身雙虎掌</span>
                        <span className="text-xs font-mono text-slate-400">高手</span>
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm mt-4 italic border-t border-indigo-100 pt-3">
                      繼承強迫你「是」什麼，讓你定型；而組合讓你「有」什麼，能隨戰況靈活連段，這才是簡單卻強大。
                    </p>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </section>

        {/* 4. 如何串連與使用 */}
        <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <h2 className="text-xl font-black text-slate-800 mb-6 border-l-4 border-blue-600 pl-4 text-left">4. 整潔的架構 (Clean Architecture)</h2>
          <div className="space-y-8 text-left">
            <p className="text-slate-600 leading-relaxed font-medium text-left">
              架構層次的原則：<b>分層、相依性、跨層</b>。深入瞭解「依賴反轉 (Dependency Inversion)」與「解耦 (Decoupling)」的意涵。
            </p>


            <h4 className="text-lg font-black text-slate-600 uppercase tracking-widest mb-8 text-center">架構分層與責任歸屬 (Clean Architecture)</h4>
            <div className="mermaid">
              {`sequenceDiagram
                                        autonumber
                                        
                                        box rgb(219, 234, 254) Presentation Layer
                                            participant UI as Observer: ExplorerUI
                                        end

                                        box rgb(243, 232, 255) Use Cases - Business Layer
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left items-stretch">
              <div className="space-y-4 text-left flex flex-col h-full">
                <h5 className="font-bold text-blue-700 flex items-center gap-2 text-left"><Layers2 size={18} /> 1. 模式組合 (Composition)</h5>
                <p className="text-base text-slate-500 text-left flex-grow">
                  各個模式像積木一樣組合，內部都「持有」其他的模式
                </p>
                <div className="bg-slate-900 rounded-3xl text-sm text-slate-300 border border-slate-700 text-left h-full overflow-hidden w-full flex flex-col">
                  <div className="p-0 flex-1 w-full">
                    <CodeBlock code={`// 模式組合 (Composition)
class FileSearchVisitor implements IVisitor {
  // Visitor 持有 Observer                    
  private notifier: Subject;
  constructor() {
    this.notifier = new Subject();
  }
}`} language="typescript" showLineNumbers={false} />
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-left flex flex-col h-full">
                <h5 className="font-bold text-blue-700 flex items-center gap-2 text-left"><Share2 size={18} /> 2. 注入與掛載 (Injection)</h5>
                <p className="text-base text-slate-500 text-left flex-grow">
                  透過掛載或注入不同的策略物件，提供更靈活的行為
                </p>
                <div className="bg-slate-900 rounded-3xl text-sm text-slate-300 border border-slate-700 text-left h-full overflow-hidden w-full flex flex-col">
                  <div className="p-0 flex-1 w-full">
                    <CodeBlock code={`// 掛載觀察者 (Observer)
v.notifier.subscribe(o1);
// 掛載另一個觀察者
v.notifier.subscribe(o2);

// 注入策略 (Strategy)
const s: ISortStrategy = new LabelSortStrategy();
const c: ICommand = new SortCommand(r, s);`} language="typescript" showLineNumbers={false} />
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-left flex flex-col h-full">
                <h5 className="font-bold text-blue-700 flex items-center gap-2 text-left"><Play size={18} /> 3. 觸發執行 (Execution)</h5>
                <p className="text-base text-slate-500 text-left flex-grow">執行操作的入口點因不同的行為角色，而有所不同</p>
                <div className="bg-slate-900 rounded-3xl text-sm text-slate-300 border border-slate-700 text-left h-full overflow-hidden w-full flex flex-col">
                  <div className="p-0 flex-1 w-full">
                    <CodeBlock code={`// Visitor (唯讀分析)
root.accept(visitor);

// Command (狀態寫入)
invoker.execute(cmd);

// Mediator (關聯更新)
tagMediator.attach(id, "Urgent");`} language="typescript" showLineNumbers={false} />
                  </div>
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
        <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <h2 className="text-xl font-black text-slate-800 mb-2 border-l-4 border-blue-600 pl-4 text-left">5. 類別設計 vs 傳統直覺</h2>

          {/* Tab Navigation: MacOS Dock Effect */}
          <div className="relative mb-16 flex justify-center w-full">
            <MacOSDock
              items={patterns}
              activeId={activeTab}
              onSelect={setActiveTab}
              isMobile={isMobile}
              colorMap={DOCK_COLOR_MAP}
              gap={36}
              baseSize={68}
            />
          </div>

          <div className="min-h-[500px]">
            {patterns.map(pattern => (
              activeTab === pattern.id && (
                <div key={pattern.id} className="space-y-6 text-left animate-in fade-in duration-300">
                  <div className="flex items-center gap-3 mb-2 text-left">
                    <div className={`p-2 rounded-lg text-left ${iconThemeMap[pattern.themeColor] || "bg-slate-100 text-slate-700"}`}>
                      <pattern.icon size={24} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 text-left">
                      {pattern.chapter} ({pattern.name}) : {pattern.description}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                    <div className="bg-slate-900 p-0 rounded-3xl text-slate-300 border-l-8 border-green-500 shadow-xl text-left overflow-hidden">
                      <CodeBlock code={pattern.comparison.positive} language="typescript" />
                    </div>
                    <div className="bg-slate-900 p-0 rounded-3xl text-slate-300 border-l-8 border-red-500 text-left overflow-hidden">
                      <CodeBlock code={pattern.comparison.negative} language="typescript" />
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </section>

        {/* 6. 結語 */}
        <section>
          <div className="bg-gradient-to-br from-indigo-50 to-white p-10 rounded-2xl border border-indigo-100 shadow-lg text-center relative overflow-hidden">
            <h2 className="text-3xl font-black mb-8 text-slate-800 tracking-tight">
              為什麼軟體需要架構與學設計模式？
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

              <div className="font-bold text-indigo-800 mt-8 text-xl w-full px-8 py-6 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <span className="text-4xl shrink-0">💡</span>
                  <div>
                    <span>其實，沒有人一開始就能寫出完美的架構。</span>
                    <span className="font-medium text-slate-600 text-base block mt-2">設計模式通常是在<b>「重構」</b>階段引入的——當你發現代碼開始變得難以維護時，這些模式就是你的解藥。</span>
                    <span className="font-medium text-slate-600 text-base block mt-2">那什麼時候該重構呢？<b className="text-indigo-700">「事不過三」</b>——當同一個讓你煩躁的現象出現第三次，就是重構的信號。</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 7. 行動呼籲 (Call to Action) */}
        <section className="relative w-full pb-12 mt-8">
          <div className="relative z-10 w-full bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-10 md:p-14 rounded-[2rem] shadow-2xl border border-indigo-700/50 overflow-hidden group">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>

            <div className="relative z-20 flex flex-col items-center text-center">
              <span className="text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-blue-200 font-bold block mb-4 leading-relaxed tracking-wide">
                當 AI 成為團隊超級成員，你能擔任什麼角色？
              </span>
              <span className="text-xl md:text-[24px] text-slate-400 font-medium block mb-12 leading-relaxed">
                難道是一起舉手 <span className="text-white font-bold bg-indigo-500/20 px-4 py-2 rounded-xl border border-indigo-500/30 whitespace-nowrap shadow-sm">「我做完了，但我看不懂」</span> 嗎？
              </span>

              <button
                onClick={() => setIsMindMapOpen(true)}
                className="group/btn relative px-10 py-5 bg-indigo-500 text-white font-bold rounded-2xl hover:bg-indigo-400 transition-all shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:shadow-[0_0_60px_rgba(99,102,241,0.6)] flex items-center justify-center gap-5 hover:-translate-y-1 overflow-hidden w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out"></div>
                <span className="relative z-10 text-xl md:text-2xl tracking-wide">你需要用「規則」來引導 AI，而不是「規格」</span>
                <div className="relative z-10 bg-indigo-600/50 p-2.5 rounded-full ml-3 border border-indigo-400/30 group-hover/btn:bg-indigo-600 transition-colors">
                  <ArrowRight size={22} className="text-indigo-200" />
                </div>
              </button>
            </div>
          </div>
        </section>
      </div>
      <MindMapDialog isOpen={isMindMapOpen} onClose={() => setIsMindMapOpen(false)} />
    </div>
  );
};

export default CodeTab;

