import React, { useEffect, useRef } from 'react';
import { Map, Zap, X } from 'lucide-react';
import mermaid from 'mermaid';

const MINDMAP_DEFINITION = `
mindmap
  root((AI 時代的<br/>開發抉擇))
    (**技術債的權衡**)
      (✅ 優點)
        **短期快速**
          [搶得市場先機]
          [縮短上線時間]
        **低成本**
          [拋棄式 MVP]
          [低風險試錯]
        **直觀**
          [一般人即刻上手]
          [流程線性單純]
      (❌ 缺點)
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
    (**產品靈魂鑄造**)
      (✅ 優點)
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
      (❌ 缺點)
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
                mindmap: {
                    useMaxWidth: true,
                }
            });

            const renderMermaid = async () => {
                // Wait for animation frame
                await new Promise(resolve => setTimeout(resolve, 100));

                if (mermaidRef.current) {
                    try {
                        mermaidRef.current.innerHTML = MINDMAP_DEFINITION;
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
                /* Default (Mobile): Scrollable with min-width to ensure readability */
                .mermaid svg { 
                    min-width: 800px;
                    height: auto;
                }
                
                /* Desktop: Scale to fit without scrollbars */
                @media (min-width: 768px) {
                    .mermaid svg { 
                        min-width: auto;
                        max-width: 100%; 
                        max-height: 100%; 
                        height: 100%;
                    }
                }

                /* Root Node Styling Override - Make it POP */
                .mermaid .root circle {
                    fill: #fdf4ff !important;
                    stroke: #d946ef !important;
                    stroke-width: 4px !important;
                }
                .mermaid .root text {
                    font-size: 24px !important;
                    font-weight: 900 !important;
                    fill: #86198f !important;
                }
            `}</style>

            {/* Content */}
            <div className="relative bg-white w-full h-full md:w-11/12 md:max-w-7xl md:h-[92vh] md:max-h-[1080px] rounded-none md:rounded-2xl shadow-2xl z-10 flex flex-col overflow-auto md:overflow-hidden animate-premium-in border border-slate-200">

                {/* Header */}
                <div className="relative flex items-center justify-center px-6 py-2 border-b border-slate-100 bg-white shrink-0">
                    <div className="flex items-center gap-6">
                        {/* Iron Triangle Visualization */}
                        <svg width="80" height="70" viewBox="0 0 100 90" className="flex-shrink-0 drop-shadow-sm">
                            {/* Triangle */}
                            <path d="M50 35 L65 60 L35 60 Z" fill="none" stroke="#64748b" strokeWidth="3" strokeLinejoin="round" />

                            {/* Vertices Dots */}
                            <circle cx="50" cy="35" r="8" fill="#8b5cf6" /> {/* Top: Quality */}
                            <circle cx="65" cy="60" r="8" fill="#3b82f6" /> {/* Right: Time */}
                            <circle cx="35" cy="60" r="8" fill="#22c55e" /> {/* Left: Cost */}

                            {/* Labels */}
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
                <div className="flex-1 overflow-auto md:overflow-hidden bg-slate-50 relative p-8 flex items-center justify-center">
                    <div className="mermaid w-full h-full flex items-center justify-center" ref={mermaidRef}>
                        {MINDMAP_DEFINITION}
                    </div>
                </div>
            </div>
        </div>
    );
};
