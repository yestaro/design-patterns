import { X } from 'lucide-react';
import mermaid from 'mermaid';
import React, { useEffect, useRef } from 'react';

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
    Analyst->>KB: 寫入【專案 Spec】【專案 Test Cases】與【通用：業務知識】

    Note over Human,KB: 2. 架構設計 (Designer)
    Designer->>KB: 讀取【專案 Spec】與【通用：設計原則】DDD | SOLID | Clean Architecture
    Designer-->>Human: 產出架構與介面設計草案
    Human->>Designer: 修正技術選型與邊界
    Designer->>KB: 寫入【專案 Design】與【通用：設計原則】修正

    Note over Human,KB: 3. 程式實作 (Implementer)
    Dev->>KB: 讀取【專案 Spec】、【專案 Design】與【通用：撰寫指南】Coding Standard | Tech Stack | Framework
    Dev->>Dev: 撰寫功能、單元測試
    Dev->>Reviewer: 執行單元測試OK，提交 Source Code 進入審查

    Note over Human,KB: 4. 代碼審查 (Reviewer - AI 互相監察)
    Reviewer->>KB: 讀取【專案 Spec】、【專案 Design】與【通用：撰寫指南】
    alt 發現壞味道 (不符規範)
        Reviewer->>Dev: 退件重工 (附帶修改建議)
        Dev->>Reviewer: 【重新提交】修正後的 Code
    else 符合規範
        Reviewer->>QA: 放行 Code 進入測試階段
    end

    Note over Human,KB: 5. 品質測試 (QA)
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
                        mermaidRef.current.innerHTML = DIAGRAM_DEFINITION;
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
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 animate-backdrop-in"
                onClick={onClose}
            ></div>

            <style>{`
                /* Size Management for Sequence Diagram */
                .mermaid-container {
                    width: 100%;
                    height: 100%;
                    overflow-y: auto;
                    overflow-x: hidden;
                }
                
                .mermaid svg {
                    min-width: 1400px;
                    width: 100%;
                    height: auto;
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
            `}</style>

            {/* Content */}
            <div className="relative bg-white w-full h-full md:w-[95vw] md:max-w-none md:h-[92vh] md:max-h-[1080px] rounded-none md:rounded-2xl shadow-2xl z-10 flex flex-col overflow-auto md:overflow-hidden animate-premium-in border border-slate-200">

                {/* Header */}
                <div className="relative flex items-center justify-center px-6 py-2 border-b border-slate-100 bg-white shrink-0">
                    <div className="flex items-center gap-6">
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
                    <button
                        onClick={onClose}
                        className="absolute right-6 p-2 bg-white hover:bg-red-50 border border-slate-100 hover:border-red-100 rounded-full transition-all text-slate-400 hover:text-red-500 group/close active:scale-90"
                        title="關閉"
                    >
                        <X size={24} className="group-hover/close:rotate-90 transition-transform" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden bg-slate-50 relative p-8">
                    <div className="mermaid-container flex justify-center">
                        <div className="mermaid" ref={mermaidRef}>
                            {DIAGRAM_DEFINITION}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
