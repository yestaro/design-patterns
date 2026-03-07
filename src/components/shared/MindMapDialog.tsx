import { X, Network, AlignLeft } from 'lucide-react';
import mermaid from 'mermaid';
import React, { useEffect, useRef, useState } from 'react';

const MINDMAP_DEFINITION = `
mindmap
  root((AI 時代的<br/>開發抉擇))
    debt(**技術債的權衡**)
    :::debt
      (<span class="text-blue-500 font-bold">◯</span> **優點**)
      :::pro
        **短期快速**
          [快速驗證結果]
          [縮短上線時間]
        **低成本**
          [減少人力投入]
          [省去規劃與定義]
        **直觀**
          [一般人即刻上手]
          [流程線性單純]
      (<span class="text-red-500 font-bold">✕</span> **缺點**)
      :::con
        **僵化**
          [高耦合 Coupling]
          [難以擴充新功能]
          [不敢重構]
        **脆弱**
          [牽一髮動全身]
          [Bug 越修越多]
        **晦澀**
          [邏輯散落各處]
          [重複造輪子]
          [只有上帝與我懂]
    soul(**產品靈魂鑄造**)
    :::soul
      (<span class="text-blue-500 font-bold">◯</span> **優點**)
      :::pro
        **彈性**
          [應對未來變化]
          [擴充功能不改舊碼]
          [抽換演算法容易]
        **強健**
          [模組獨立運作]
          [錯誤被隔離]
          [行為可預測]
        **清晰**
          [業務邏輯模組化]
          [職責定義明確]
          [容易審核 AI]
      (<span class="text-red-500 font-bold">✕</span> **缺點**)
      :::con
        **開發成本高**
          [代碼量增加]
          [檔案碎片化]
        **前期設計久**
          [定義介面與邊界]
          [需畫圖與討論]
        **學習曲線陡**
          [需理解物件導向]
          [需懂抽象思維]
`;

const DIAGRAM_DEFINITION = `
sequenceDiagram
    actor Human as 🧑‍💻 Team Lead
    
    box rgb(238, 242, 255) 🤖 AI Teams 生產線
        participant Analyst as 分析<br/>Analyst
        participant Designer as 設計<br/>Designer
        participant Dev as 實作<br/>Implementer
        participant Reviewer as 審查<br/>Reviewer
        participant QA as 測試<br/>QA
    end
    
    participant KB as 🗂️ Git 知識庫(md)

    Note over Human,KB: 1. 需求分析 (Analyst)
    Human->>Analyst: 需求問答-Why&Who
    Analyst-->>Human: 產出 Spec 草案與 Test Cases
    Human->>Analyst: 糾正與對齊商業方向
    Analyst->>KB: 寫入【專案 Spec】【專案 Test Cases】與【🔄 通用：業務知識】

    Note over Human,KB: 2. 架構設計 (Designer)
    Analyst->>Designer: 開始設計
    Designer->>KB: 讀取【專案 Spec】與【🔄 通用：設計原則】DDD | SOLID | Clean Architecture
    Designer-->>Human: 產出架構與介面設計草案
    Human->>Designer: 修正技術選型與邊界
    Designer->>KB: 寫入【專案 Design】與【🔄 通用：設計原則】修正

    Note over Designer,KB: 3. 程式實作 (Implementer)
    Designer->>Dev: 開始實作
    Dev->>KB: 讀取【專案 Spec】、【專案 Design】與【🔄 通用：撰寫指南】Coding Standard | Tech Stack | Framework
    Dev->>Dev: 撰寫功能、單元測試

    Note over Dev,KB: 4. 代碼審查 (Reviewer - AI 互相監察)
    Dev->>Reviewer: 執行單元測試OK，提交 Source Code 進入審查
    Reviewer->>KB: 讀取【專案 Spec】、【專案 Design】與【🔄 通用：撰寫指南】
    alt 發現壞味道 (不符規範)
        Reviewer->>Dev: 退件重工 (附帶修改建議)
        Dev->>Reviewer: 【重新提交】修正後的 Code        
    end

    Note over Human,KB: 5. 品質測試 (QA)
    Reviewer->>QA: 放行 Code 進入測試階段
    QA->>KB: 讀取【專案 Test Cases】
    QA->>QA: 執行【整合測試】
    alt 發現 Bug (測試失敗)
        QA->>Dev: 退件重工 (附帶 Bug Report)
    else 測試通過
        QA-->>Human: 產出 Test Report 與最終版本
        Human->>QA: 確認報告，給予最終審查或放行
    end
`;

interface MindMapDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MindMapDialog: React.FC<MindMapDialogProps> = ({ isOpen, onClose }) => {
    const mermaidRef = useRef<HTMLDivElement>(null);
    const [viewMode, setViewMode] = useState<'sequence' | 'mindmap'>('sequence');

    useEffect(() => {
        if (isOpen) {
            mermaid.initialize({
                startOnLoad: false,
                theme: 'default',
                securityLevel: 'loose',
            });

            const renderMermaid = async () => {
                // Wait for animation frame
                await new Promise(resolve => setTimeout(resolve, 100));

                if (mermaidRef.current) {
                    try {
                        mermaidRef.current.innerHTML = viewMode === 'sequence' ? DIAGRAM_DEFINITION : MINDMAP_DEFINITION;
                        mermaidRef.current.removeAttribute('data-processed');
                        await mermaid.run({ nodes: [mermaidRef.current] });
                    } catch (error) {
                        console.error('Mermaid render error:', error);
                        if (mermaidRef.current) mermaidRef.current.innerHTML = 'Render Error';
                    }
                }
            };
            renderMermaid();
        }
    }, [isOpen, viewMode]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 animate-backdrop-in"
                onClick={onClose}
            ></div>

            <style>{`
                /* Universal Scaling: Force diagram to fit dialog exactly and scale proportionally */
                .mermaid-container {
                    width: 100%;
                    height: 100%;
                    overflow-y: auto;
                    overflow-x: hidden;
                }
                
                /* Sequence Mode: Full width, scroll vertically */
                .mermaid-container.is-sequence .mermaid {
                    width: 100%;
                }
                .mermaid-container.is-sequence .mermaid svg {
                    width: 100% !important;
                    max-width: 100% !important;
                    height: auto !important;
                }

                /* MindMap Mode: Fit entirely within dialog without scrolling */
                .mermaid-container.is-mindmap .mermaid {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .mermaid-container.is-mindmap .mermaid svg {
                    max-width: 100% !important;
                    max-height: 100% !important;
                    width: 100% !important;
                    height: 100% !important;
                }

                /* Sequence Diagram Enhancements */
                .mermaid text.actor > tspan {
                    font-weight: bold !important;
                    font-size: 16px !important;
                }
                .mermaid .messageText {
                    font-weight: bold !important;
                    fill: #334155 !important; /* slate-700 */
                }
                .mermaid .noteText {
                    font-weight: bold !important;
                }

                /* MindMap Enhancements */
                .mermaid .pro rect,
                .mermaid .pro path,
                .mermaid .pro polygon {
                    stroke: #3b82f6 !important;
                    stroke-width: 2px !important;
                    fill: #eff6ff !important;
                }
                
                .mermaid .con rect,
                .mermaid .con path,
                .mermaid .con polygon {
                    stroke: #ef4444 !important;
                    stroke-width: 2px !important;
                    fill: #fef2f2 !important;
                }
                
                .mermaid .debt text,
                .mermaid .debt span,
                .mermaid .debt div,
                .mermaid .debt p,
                .mermaid .debt strong {
                    font-size: 18px !important;
                    fill: #ef4444 !important;
                    color: #ef4444 !important;
                }
                
                .mermaid .soul text,
                .mermaid .soul span,
                .mermaid .soul div,
                .mermaid .soul p,
                .mermaid .soul strong {
                    font-size: 18px !important;
                    fill: #3b82f6 !important;
                    color: #3b82f6 !important;
                }
            `}</style>

            {/* Content */}
            <div className="relative bg-white w-full h-full md:w-[95vw] md:max-w-none md:h-[92vh] md:max-h-[1080px] rounded-none md:rounded-2xl shadow-2xl z-10 flex flex-col overflow-auto md:overflow-hidden animate-premium-in border border-slate-200">

                {/* Header */}
                <div className="relative flex items-center justify-between px-6 py-2 border-b border-slate-100 bg-white shrink-0">
                    
                    {/* Left: View Toggle */}
                    <div className="flex-1 flex justify-start">
                        <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200">
                            <button
                                onClick={() => setViewMode('sequence')}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                                    viewMode === 'sequence' 
                                        ? 'bg-white text-slate-800 shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                }`}
                            >
                                <AlignLeft size={18} className={viewMode === 'sequence' ? 'text-purple-600' : ''} />
                                <span>循序圖</span>
                            </button>
                            <button
                                onClick={() => setViewMode('mindmap')}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                                    viewMode === 'mindmap' 
                                        ? 'bg-white text-slate-800 shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                }`}
                            >
                                <Network size={18} className={viewMode === 'mindmap' ? 'text-blue-600' : ''} />
                                <span>心智圖</span>
                            </button>
                        </div>
                    </div>

                    {/* Center: Title */}
                    <div className="flex-none flex items-center gap-6 justify-center">
                        <svg width="80" height="70" viewBox="0 0 100 90" className="flex-shrink-0 drop-shadow-sm">
                            <path d="M50 35 L65 60 L35 60 Z" fill="none" stroke="#64748b" strokeWidth="3" strokeLinejoin="round" />
                            <circle cx="50" cy="35" r="8" fill="#8b5cf6" />
                            <circle cx="65" cy="60" r="8" fill="#3b82f6" />
                            <circle cx="35" cy="60" r="8" fill="#22c55e" />
                            <text x="50" y="20" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#64748b">Quality</text>
                            <text x="65" y="78" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#64748b">Time</text>
                            <text x="35" y="78" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#64748b">Cost</text>
                        </svg>

                        <div>
                            <h2 className="text-xl font-black text-slate-800">
                                專案鐵三角理論 (The Iron Triangle)
                            </h2>
                            <p className="text-sm text-slate-500 mt-1 font-medium">
                                魚與熊掌不可兼得：<span className="text-blue-600">時間</span>、<span className="text-green-600">成本</span> 與 <span className="text-purple-600">品質</span> 的永恆權衡
                            </p>
                        </div>
                    </div>

                    {/* Right: Close Button */}
                    <div className="flex-1 flex justify-end">
                        <button
                            onClick={onClose}
                            className="p-2 bg-white hover:bg-red-50 border border-slate-100 hover:border-red-100 rounded-full transition-all text-slate-400 hover:text-red-500 group/close active:scale-90"
                            title="關閉"
                        >
                            <X size={24} className="group-hover/close:rotate-90 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden bg-slate-50 relative p-4 md:p-8 flex items-center justify-center">
                    <div className={`mermaid-container w-full h-full flex justify-center ${viewMode === 'sequence' ? 'is-sequence items-start' : 'is-mindmap items-center overflow-hidden'}`}>
                        <div className="mermaid" ref={mermaidRef}>
                            {viewMode === 'sequence' ? DIAGRAM_DEFINITION : MINDMAP_DEFINITION}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
