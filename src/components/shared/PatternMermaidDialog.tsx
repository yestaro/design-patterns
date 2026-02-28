import React, { useEffect, useRef, useState } from "react";
import { X, Layout, ArrowLeftRight } from "lucide-react";
import mermaid from "mermaid";
import { patterns } from "../../data/patterns";
import CodeBlock from "./CodeBlock";

interface PatternMermaidDialogProps {
    isOpen: boolean;
    patternId: string | null;
    onClose: () => void;
}

type DiagramType = "class" | "sequence";

const PatternMermaidDialog: React.FC<PatternMermaidDialogProps> = ({
    isOpen,
    patternId,
    onClose,
}) => {
    const mermaidRef = useRef<HTMLDivElement>(null);
    const [diagramType, setDiagramType] = useState<DiagramType>("class");
    const pattern = patterns.find((p) => p.id === patternId);

    // 當切換 Pattern 時，預設回到類別圖
    useEffect(() => {
        if (isOpen) {
            setDiagramType("class");
        }
    }, [isOpen, patternId]);

    useEffect(() => {
        if (isOpen && pattern) {
            mermaid.initialize({
                startOnLoad: false,
                theme: "default",
                securityLevel: "loose",
                themeVariables: {
                    fontFamily: "Inter, system-ui, sans-serif",
                    fontSize: "14px",
                },
            });

            const renderMermaid = async () => {
                // Wait for animation frame
                await new Promise((resolve) => setTimeout(resolve, 50));

                if (mermaidRef.current) {
                    try {
                        const content =
                            diagramType === "class"
                                ? pattern.mermaid
                                : pattern.sequence || "graph TD\n    A[尚未提供序列圖]";

                        mermaidRef.current.style.visibility = "hidden";
                        mermaidRef.current.textContent = content;
                        mermaidRef.current.removeAttribute("data-processed");
                        await mermaid.run({ nodes: [mermaidRef.current] });
                        mermaidRef.current.style.visibility = "visible";

                        // 動畫處理
                        mermaidRef.current.classList.remove("animate-in", "fade-in");
                        void mermaidRef.current.offsetWidth; // 觸發 reflow
                        mermaidRef.current.classList.add("animate-in", "fade-in", "duration-500");
                    } catch (error) {
                        console.error("Mermaid render error:", error);
                        if (mermaidRef.current)
                            mermaidRef.current.innerHTML = `<div class="text-red-400 p-4 border border-red-100 rounded-lg bg-red-50 text-xs font-bold">UML 渲染失敗，請檢查資料格式</div>`;
                    }
                }
            };
            renderMermaid();
        }
    }, [isOpen, pattern, diagramType]);

    if (!isOpen || !pattern) return null;

    const Icon = pattern.icon;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 animate-backdrop-in"
                onClick={onClose}
            ></div>

            <style>{`
                .mermaid {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .mermaid svg {
                    width: 100% !important;
                    height: auto !important;
                    max-height: 100% !important;
                }
            `}</style>

            {/* Content */}
            <div className="relative bg-white w-full h-full md:w-11/12 md:max-w-[1400px] md:h-[85vh] md:max-h-[900px] rounded-2xl shadow-2xl z-10 flex flex-col md:flex-row overflow-hidden animate-premium-in border border-slate-200">
                {/* Left Panel: Header & Description */}
                <div className="w-full md:w-[360px] lg:w-[400px] bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-6 flex flex-col shrink-0 z-20 shadow-[2px_0_10px_rgba(0,0,0,0.02)] relative">

                    <div className="flex items-center gap-4 mb-6 mt-2 md:mt-0">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-blue-600 shrink-0">
                            <Icon size={24} />
                        </div>
                        <div>
                            <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded font-bold uppercase tracking-wider mb-1 inline-block">
                                {pattern.chapter}
                            </span>
                            <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-tight">
                                {pattern.name}
                            </h2>
                        </div>
                    </div>

                    <div className="flex-none mt-4 md:mt-2">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">
                            Pattern 核心意圖
                        </h4>
                        <p
                            className="text-sm text-slate-700 font-medium leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: pattern.description }}
                        />
                    </div>

                    {pattern.usage && (
                        <div className="mt-8 flex-1 flex flex-col min-h-0 overflow-hidden">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                應用實例：{pattern.usage.title}
                            </h4>
                            <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 relative group/code overflow-hidden">
                                <div className="absolute inset-0">
                                    <CodeBlock
                                        code={pattern.usage.code}
                                        language="typescript"
                                        className="h-full"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Diagram Viewer */}
                <div className="flex-1 bg-white relative overflow-hidden flex flex-col group/diagram">
                    {/* Floating Icon-only Switcher - Top Left */}
                    <div className="absolute left-6 top-6 z-30 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex gap-1 p-1 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50">
                            <button
                                onClick={() => setDiagramType("class")}
                                className={`p-2.5 rounded-lg transition-all ${diagramType === "class"
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                    }`}
                                title="類別圖 (Class Diagram)"
                            >
                                <Layout size={20} />
                            </button>
                            <button
                                onClick={() => setDiagramType("sequence")}
                                className={`p-2.5 rounded-lg transition-all ${diagramType === "sequence"
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                    }`}
                                title="序列圖 (Flow/Sequence)"
                            >
                                <ArrowLeftRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Floating Close Button - Top Right */}
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 p-2 bg-white/80 backdrop-blur-md border border-slate-200 shadow-xl shadow-slate-200/50 rounded-full transition-all text-slate-300 hover:text-red-500 hover:border-red-100 z-30 group/close"
                        title="關閉 (Esc)"
                    >
                        <X size={20} className="group-hover/close:rotate-90 transition-transform" />
                    </button>

                    {/* Diagram Container - Full Height */}
                    <div className="flex-1 overflow-auto p-8 flex justify-center items-center custom-scrollbar bg-[radial-gradient(#f1f5f9_1.5px,transparent_1.5px)] [background-size:32px_32px]">
                        <div
                            className="mermaid text-center w-full h-full flex justify-center items-center"
                            ref={mermaidRef}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatternMermaidDialog;
