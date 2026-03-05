import { ArrowLeft, ArrowLeftRight, ChevronLeft, ChevronRight, Code, Loader2, MousePointerClick, Network } from "lucide-react";
import mermaid from "mermaid";
import React, { useEffect, useRef, useState } from "react";
import { patterns } from "../data/patterns";
import { useSourceCode } from "../hooks/useSourceCode";
import { extractClassOrInterface } from "../utils/codeParser";
import CodeBlock from "./shared/CodeBlock";
import { CodeWindow } from "./shared/CodeWindow";

const DomainTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState("composite");
  const [diagramType, setDiagramType] = useState<"class" | "sequence">("class");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const { codes, isLoading: isLoadingCode, fetchCode } = useSourceCode();

  useEffect(() => {
    setSelectedNodeId(null);
  }, [activeTab]);

  useEffect(() => {
    const currentPattern = patterns.find((p) => p.id === activeTab);
    if (!currentPattern) return;

    if (diagramType === "class" && currentPattern.sourceFile) {
      fetchCode(activeTab, currentPattern.sourceFile);
    }
  }, [activeTab, diagramType, fetchCode]);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
    });
  }, []);

  const listScrollPos = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [isCompact, setIsCompact] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  useEffect(() => {
    const checkWidth = () => setIsCompact(window.innerWidth < 1024);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const isFirstRender = useRef(true);

  const scrollToTop = () => {
    if (isCompact && contentRef.current) {
      const yOffset = -100; // Offset for sticky header
      const rect = contentRef.current.getBoundingClientRect();
      const targetY = Math.max(0, rect.top + window.scrollY + yOffset);
      window.scrollTo({ top: targetY, behavior: "smooth" });
    } else if (!isCompact && containerRef.current) {
      const yOffset = -100;
      const rect = containerRef.current.getBoundingClientRect();
      const targetY = Math.max(0, rect.top + window.scrollY + yOffset);
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      if (isCompact && showMobileDetail && contentRef.current) {
        // Mobile: Only scroll if we are showing the detail view (slide-in)
        const yOffset = -100; // Offset for sticky header
        const rect = contentRef.current.getBoundingClientRect();
        const targetY = Math.max(0, rect.top + window.scrollY + yOffset);
        window.scrollTo({ top: targetY, behavior: "smooth" });
      }
    }

    // 避免在手機版折疊 (display: none) 狀態下呼叫 mermaid.run()，否則會算出寬高為 0 而無法顯示
    if (isCompact && !showMobileDetail) return;

    requestAnimationFrame(async () => {
      try {
        const mermaidElements = document.querySelectorAll(".mermaid");
        mermaidElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.removeAttribute("data-processed");
          htmlEl.style.visibility = "hidden";
        });

        await mermaid.run({ querySelector: ".mermaid" });

        mermaidElements.forEach((el) => {
          (el as HTMLElement).style.visibility = "visible";
        });
      } catch (e: any) {
        console.warn("[Mermaid] render skipped:", e.message);
      }
    });

    // Reset selection when changing type
    setSelectedNodeId(null);
  }, [activeTab, diagramType, isCompact, showMobileDetail]);

  const currentPattern = patterns.find((p) => p.id === activeTab);
  const currentCode = codes[activeTab] as string;

  // Parse diagram clicked nodes (to highlight classes)
  const handleMermaidClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // 捕捉類別圖 (classGroup/node) 或 序列圖 (actor)
    const clickableContainer = target.closest(".classGroup, .node, .actor, g[id^='classId-'], g[id^='actor-']");

    if (clickableContainer) {
      console.log("[DomainTab] Clicked Mermaid node:", clickableContainer);
      let rawId = clickableContainer.id || "";
      let nodeName = "";

      // 1. 先嘗試從 ID 解析 (Mermaid class diagrams: "classId-EntryComponent-4")
      if (rawId.startsWith("classId-")) {
        nodeName = rawId.split("-")[1] || "";
      }

      // 2. 處理序列圖或其他 ID 抓不到的情況
      const isActor = rawId.includes("actor") || clickableContainer.classList.contains('actor');

      if (!nodeName || nodeName === rawId || isActor) {
        // [關鍵修復] 如果點擊的是 rect 之類的 leaf node，我們需要找它所屬群組內的文字
        // 序列圖的文字通常在 text.actor、tspan 或 label 內
        let titleEl = clickableContainer.querySelector(".classTitle, .label text, .nodeLabel, text.actor, tspan");

        // 如果容器本身沒找到文字，且 container 是 rect，嘗試找它的兄弟姊妹或是父層的文字
        if (!titleEl && clickableContainer.tagName.toLowerCase() === 'rect') {
          const parent = clickableContainer.parentElement;
          if (parent) {
            titleEl = parent.querySelector("text.actor, tspan, text");
          }
        }

        // 如果容器本身就是 text 類
        if (!titleEl && (clickableContainer.tagName.toLowerCase() === 'text' || clickableContainer.tagName.toLowerCase() === 'tspan')) {
          titleEl = clickableContainer as HTMLElement;
        }

        if (titleEl && titleEl.textContent) {
          nodeName = titleEl.textContent;
          // 過濾掉註解、括號等雜質
          nodeName = nodeName.replace(/<<.*>>/g, "").replace(/«.*»/g, "").trim();
        } else if (clickableContainer.textContent && isActor) {
          nodeName = clickableContainer.textContent.split('\n')[0].trim();
        }
      }

      // 清理最後的名稱
      // 規則：如果是 "instance: ClassName (desc)" 格式，提取 ":" 之後的類別名稱
      // 我們使用正則表達式來精確抓取冒號後第一段連續的合法識別碼 (字母、數字、_、$)
      let finalName = nodeName.replace(/["']/g, "").split('\n')[0].trim();

      const colonMatch = finalName.match(/:\s*([a-zA-Z0-9_$]+)/);
      if (colonMatch) {
        finalName = colonMatch[1];
      } else if (finalName.includes(':')) {
        // 如果正則沒抓到，嘗試傳統分割法 (處理包含特殊字元的情況)
        const parts = finalName.split(':');
        const afterColon = parts[parts.length - 1].trim();
        finalName = afterColon.split(/\s/)[0].trim();
      }

      // 移除多餘字元並過濾
      finalName = finalName.replace(/\s/g, '');
      console.log("[DomainTab] Resolved node name:", finalName);

      if (finalName && finalName.length > 0) {
        setSelectedNodeId(finalName);
      }
    }
  };

  const displayCode = selectedNodeId && currentCode
    ? extractClassOrInterface(currentCode, selectedNodeId)
    : currentCode;

  return (
    <div
      ref={containerRef}
      className="text-left text-base animate-in fade-in duration-500"
    >
      {/* Main Grid Layout: Mobile (1 col) -> Desktop (12 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Navigation: Mobile (Full Width) -> Desktop (4 cols) */}
        <div
          className={`col-span-1 lg:col-span-4 ${isCompact && showMobileDetail ? "hidden" : "block"}`}
        >
          <div className="lg:sticky lg:top-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
            {patterns.map((pattern, index) => (
              <div
                key={pattern.id}
                onClick={() => {
                  if (isCompact) {
                    listScrollPos.current = window.scrollY;
                    setShowMobileDetail(true);
                  } else {
                    scrollToTop();
                  }
                  setActiveTab(pattern.id);
                }}
                className={`p-4 cursor-pointer transition-all ${activeTab === pattern.id
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-blue-50"
                  } ${index !== patterns.length - 1 ? "border-b border-slate-200" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold opacity-90">
                    {index + 1}. {pattern.chapter}
                  </span>
                  <span
                    className={`text-sm font-black italic ${activeTab === pattern.id ? "text-white" : "text-blue-600"}`}
                  >
                    {pattern.name}
                  </span>
                </div>
                <p
                  className={`text-xs leading-relaxed ${activeTab === pattern.id ? "text-blue-50" : "text-slate-600"}`}
                  dangerouslySetInnerHTML={{ __html: pattern.description }}
                ></p>
              </div>
            ))}
          </div>
        </div>

        {/* Content Area: Mobile (Slide-in) -> Desktop (8 cols) */}
        <div
          ref={contentRef}
          className={`col-span-1 lg:col-span-8 ${isCompact && !showMobileDetail ? "hidden" : "block"} ${isCompact ? "animate-in slide-in-from-right duration-300" : ""}`}
        >
          {/* Floating Controls - Bottom Right */}
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
            {/* Unified Navigation Panel (Back + Left/Right) */}
            <div className="flex gap-1 p-1 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full shadow-lg shadow-slate-200/50 items-center">
              {isCompact && showMobileDetail && (
                <>
                  <button
                    onClick={() => setShowMobileDetail(false)}
                    className="p-2.5 rounded-full transition-all bg-slate-800 text-white hover:bg-slate-900 active:scale-95 shadow-sm"
                    title="返回列表"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>
                </>
              )}
              <button
                onClick={() => {
                  const currentIndex = patterns.findIndex((p) => p.id === activeTab);
                  const prevIndex = (currentIndex - 1 + patterns.length) % patterns.length;
                  setActiveTab(patterns[prevIndex].id);
                  scrollToTop();
                }}
                className="p-2.5 rounded-full transition-all text-slate-500 hover:text-slate-700 hover:bg-slate-100 active:scale-95"
                title="上一個 Pattern"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => {
                  const currentIndex = patterns.findIndex((p) => p.id === activeTab);
                  const nextIndex = (currentIndex + 1) % patterns.length;
                  setActiveTab(patterns[nextIndex].id);
                  scrollToTop();
                }}
                className="p-2.5 rounded-full transition-all text-slate-500 hover:text-slate-700 hover:bg-slate-100 active:scale-95"
                title="下一個 Pattern"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Class / Sequence Diagram Switcher (Unified) */}
            <div className="flex gap-1 p-1 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/50">
              <button
                onClick={() => setDiagramType("class")}
                className={`p-2 rounded-xl transition-all ${diagramType === "class"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  }`}
                title="類別圖 (Class Diagram)"
              >
                <Network size={20} />
              </button>
              <button
                onClick={() => setDiagramType("sequence")}
                className={`p-2 rounded-xl transition-all ${diagramType === "sequence"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  }`}
                title="序列圖 (Flow/Sequence)"
              >
                <ArrowLeftRight size={20} />
              </button>
            </div>


          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full transition-all hover:shadow-md">
            {currentPattern && (
              <div className="relative">
                <h3 className="text-lg font-black text-slate-800 mb-4">
                  {currentPattern.name} Pattern
                </h3>
                <p className="text-slate-600 mb-4">
                  {currentPattern.description}
                </p>


                <div className="absolute top-0 right-0 flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 select-none z-10 animate-in fade-in slide-in-from-top-1 duration-500">
                  <MousePointerClick size={12} className="text-blue-500" />
                  <span>點擊元件可查看程式碼</span>
                </div>


                <div
                  className="mermaid min-w-[300px] [&_.classGroup]:cursor-pointer [&_.classGroup_*]:cursor-pointer [&_.node]:cursor-pointer [&_.node_*]:cursor-pointer [&_.actor]:cursor-pointer [&_.actor_*]:cursor-pointer"
                  key={`${activeTab}-${diagramType}-${isCompact ? 'mobile' : 'desktop'}-${showMobileDetail ? 'show' : 'hide'}`}
                  onClick={handleMermaidClick}
                >
                  {diagramType === "class" ? currentPattern.mermaid : (currentPattern.sequence || "graph TD\\n    A[尚未提供序列圖]")}
                </div>


                {currentPattern.usage && (
                  <div className="mt-6 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-md transition-all duration-300">
                    <div className="px-5 py-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                      <div className="font-bold text-slate-200 flex items-center gap-2">
                        <Code size={20} className="text-blue-400" />{" "}
                        {diagramType === "class" ? (
                          <span>{currentPattern.name}</span>
                        ) : currentPattern.usage.title}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
                          TypeScript
                        </span>
                      </div>
                    </div>
                    <div className="p-0 overflow-hidden relative min-h-[100px] transition-all">
                      {currentPattern.usage.description && diagramType === "sequence" && (
                        <div className="p-5 border-b border-slate-800">
                          <p className="text-slate-400 text-sm leading-relaxed">
                            {currentPattern.usage.description}
                          </p>
                        </div>
                      )}

                      {diagramType === "class" && isLoadingCode && (
                        <div className="absolute inset-0 flex justify-center items-center bg-slate-900/50 backdrop-blur-sm z-10">
                          <Loader2 size={24} className="text-blue-500 animate-spin" />
                        </div>
                      )}

                      {diagramType === "class" && (
                        <div className="animate-in fade-in duration-500">
                          <CodeBlock
                            code={currentCode || '// 載入中...'}
                            language="typescript"
                          />
                        </div>
                      )}

                      {diagramType === "sequence" && (
                        <CodeBlock
                          code={currentPattern.usage.code}
                          language="typescript"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedNodeId && (
        <CodeWindow
          onClose={() => setSelectedNodeId(null)}
          title={selectedNodeId}
          initialSourceCode={currentCode}
        />
      )}
    </div>
  );
};

export default DomainTab;
