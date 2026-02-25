import React, { useState } from 'react';
import { LoaderPinwheel, UserRound, Route, Sparkles, ArrowRight } from 'lucide-react';
import RoadmapDialog from './shared/RoadmapDialog';

/** Landing Page 的四張價值卡片資料 */
const valueCards = [
    {
        label: 'WHY',
        labelColor: 'text-emerald-400',
        iconBg: 'bg-emerald-500/20',
        iconColor: 'text-emerald-400',
        glowColor: 'bg-emerald-500/40',
        Icon: LoaderPinwheel,
        title: '為什麼要懂設計',
        body: '麵條式的代碼混亂…AI 的 Code 像天書？批評別人的代碼很容易，但你有能力規劃的更好嗎？',
    },
    {
        label: 'WHO',
        labelColor: 'text-blue-400',
        iconBg: 'bg-blue-500/20',
        iconColor: 'text-blue-400',
        glowColor: 'bg-blue-500/40',
        Icon: UserRound,
        title: '你不只是碼農',
        body: '忙於 CRUD，複製貼上，數年如一日。什麼才是有價值的開發經驗？AI 時代，想想你的定位在哪。',
    },
    {
        label: 'HOW',
        labelColor: 'text-amber-400',
        iconBg: 'bg-amber-500/20',
        iconColor: 'text-amber-400',
        glowColor: 'bg-amber-500/40',
        Icon: Route,
        id: 'how',
        title: '貫穿思維原則',
        body: '',
    },
    {
        label: 'WHAT',
        labelColor: 'text-purple-400',
        iconBg: 'bg-purple-500/20',
        iconColor: 'text-purple-400',
        glowColor: 'bg-purple-500/40',
        Icon: Sparkles,
        title: '讓品味跟隨你',
        body: '理解模式的「設計」，留下符合現代的心法而不是守舊套路。從物件到微服務架構都能受用。',
    },
];

interface LandingPageProps {
    /** 點擊 CTA 後的回呼 */
    onEnter: () => void;
}

/** 首頁 Landing Page — 暗色主題 + Glassmorphism */
const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
    const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#0A0E27] text-white relative overflow-hidden flex flex-col items-center justify-center selection:bg-blue-500/30">

            {/* 背景 Aurora Glow */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-blue-600/15 to-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] bg-gradient-to-tr from-purple-600/10 to-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

            {/* 星座圖 — Design Patterns Constellation（集中在 hero 區） */}
            <svg className="absolute top-0 left-0 w-full h-[65%] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    {/* 節點發光濾鏡 */}
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="glow-soft">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* 連線網狀 — 細線 */}
                <g stroke="#818cf8" strokeWidth="0.5" opacity="0.15">
                    {/* 左側星群 */}
                    <line x1="8%" y1="25%" x2="15%" y2="15%" />
                    <line x1="15%" y1="15%" x2="25%" y2="20%" />
                    <line x1="25%" y1="20%" x2="20%" y2="35%" />
                    <line x1="20%" y1="35%" x2="8%" y2="25%" />
                    <line x1="15%" y1="15%" x2="20%" y2="35%" />
                    <line x1="8%" y1="25%" x2="18%" y2="50%" />
                    <line x1="20%" y1="35%" x2="18%" y2="50%" />
                    <line x1="18%" y1="50%" x2="12%" y2="65%" />
                    <line x1="18%" y1="50%" x2="30%" y2="60%" />

                    {/* 中央星群 */}
                    <line x1="25%" y1="20%" x2="38%" y2="12%" />
                    <line x1="38%" y1="12%" x2="50%" y2="18%" />
                    <line x1="50%" y1="18%" x2="45%" y2="30%" />
                    <line x1="45%" y1="30%" x2="35%" y2="28%" />
                    <line x1="35%" y1="28%" x2="25%" y2="20%" />
                    <line x1="38%" y1="12%" x2="35%" y2="28%" />
                    <line x1="50%" y1="18%" x2="62%" y2="15%" />
                    <line x1="45%" y1="30%" x2="55%" y2="40%" />
                    <line x1="35%" y1="28%" x2="40%" y2="45%" />
                    <line x1="40%" y1="45%" x2="55%" y2="40%" />
                    <line x1="40%" y1="45%" x2="30%" y2="60%" />
                    <line x1="55%" y1="40%" x2="60%" y2="55%" />

                    {/* 右側星群 */}
                    <line x1="62%" y1="15%" x2="75%" y2="10%" />
                    <line x1="75%" y1="10%" x2="85%" y2="18%" />
                    <line x1="85%" y1="18%" x2="80%" y2="30%" />
                    <line x1="80%" y1="30%" x2="68%" y2="28%" />
                    <line x1="68%" y1="28%" x2="62%" y2="15%" />
                    <line x1="75%" y1="10%" x2="68%" y2="28%" />
                    <line x1="85%" y1="18%" x2="92%" y2="25%" />
                    <line x1="92%" y1="25%" x2="88%" y2="42%" />
                    <line x1="80%" y1="30%" x2="88%" y2="42%" />
                    <line x1="68%" y1="28%" x2="70%" y2="45%" />
                    <line x1="70%" y1="45%" x2="60%" y2="55%" />
                    <line x1="70%" y1="45%" x2="82%" y2="55%" />
                    <line x1="88%" y1="42%" x2="82%" y2="55%" />

                    {/* 跨群連線（虛線） */}
                    <line x1="50%" y1="18%" x2="62%" y2="15%" strokeDasharray="3 5" />
                    <line x1="30%" y1="60%" x2="60%" y2="55%" strokeDasharray="3 5" />
                </g>

                {/* 主要節點 — 帶發光 */}
                <g filter="url(#glow)">
                    <circle cx="38%" cy="12%" r="3" fill="#a78bfa" opacity="0.6" />
                    <circle cx="50%" cy="18%" r="3.5" fill="#60a5fa" opacity="0.7" />
                    <circle cx="75%" cy="10%" r="3" fill="#818cf8" opacity="0.5" />
                    <circle cx="45%" cy="30%" r="2.5" fill="#34d399" opacity="0.5" />
                    <circle cx="68%" cy="28%" r="2.5" fill="#60a5fa" opacity="0.5" />
                    <circle cx="55%" cy="40%" r="3" fill="#f59e0b" opacity="0.5" />
                    <circle cx="40%" cy="45%" r="2.5" fill="#a78bfa" opacity="0.4" />
                </g>

                {/* 次要節點 */}
                <g filter="url(#glow)" opacity="0.4">
                    <circle cx="8%" cy="25%" r="2" fill="#818cf8" />
                    <circle cx="15%" cy="15%" r="2" fill="#60a5fa" />
                    <circle cx="25%" cy="20%" r="2.5" fill="#a78bfa" />
                    <circle cx="20%" cy="35%" r="2" fill="#818cf8" />
                    <circle cx="35%" cy="28%" r="2" fill="#34d399" />
                    <circle cx="62%" cy="15%" r="2" fill="#818cf8" />
                    <circle cx="85%" cy="18%" r="2.5" fill="#a78bfa" />
                    <circle cx="80%" cy="30%" r="2" fill="#60a5fa" />
                    <circle cx="92%" cy="25%" r="1.5" fill="#818cf8" />
                </g>

                {/* 遠景小散點 */}
                <g opacity="0.2">
                    <circle cx="18%" cy="50%" r="1.5" fill="#64748b" />
                    <circle cx="12%" cy="65%" r="1" fill="#475569" />
                    <circle cx="30%" cy="60%" r="1.5" fill="#64748b" />
                    <circle cx="60%" cy="55%" r="1.5" fill="#64748b" />
                    <circle cx="70%" cy="45%" r="1.5" fill="#64748b" />
                    <circle cx="82%" cy="55%" r="1" fill="#475569" />
                    <circle cx="88%" cy="42%" r="1.5" fill="#64748b" />
                    <circle cx="3%" cy="10%" r="1" fill="#475569" />
                    <circle cx="95%" cy="8%" r="1" fill="#475569" />
                    <circle cx="48%" cy="5%" r="1" fill="#475569" />
                    <circle cx="5%" cy="45%" r="0.8" fill="#334155" />
                    <circle cx="95%" cy="50%" r="0.8" fill="#334155" />
                </g>

                {/* 發光霧氣 */}
                <g filter="url(#glow-soft)" opacity="0.08">
                    <circle cx="40%" cy="25%" r="80" fill="#818cf8" />
                    <circle cx="70%" cy="20%" r="60" fill="#60a5fa" />
                    <circle cx="20%" cy="30%" r="50" fill="#a78bfa" />
                </g>
            </svg>

            {/* 背景 dot grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

            {/* 主要內容 */}
            <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-16 md:py-24 w-full">


                {/* Hero 標題 */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-[-0.04em] leading-[1.1] mb-6">
                        <span className="block">寫程式的人很多</span>
                        <span className="block">
                            懂
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">設計</span>
                            的人很少
                        </span>
                    </h1>

                    {/* 漸層分隔線 */}
                    <div className="mx-auto w-36 h-[2px] bg-gradient-to-r from-blue-500 to-purple-500 mb-6" />

                    <p className="text-lg md:text-xl text-slate-400 font-medium mx-auto">
                        掌握邊界 (Boundaries)、契約 (Contracts) 與解耦 (Decoupling) 的本質
                    </p>
                </div>

                {/* 四張價值卡片 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-16 mb-16">
                    {valueCards.map((card) => (
                        <div
                            key={card.label}
                            className="group relative p-6 rounded-2xl border border-white/[0.12] bg-white/[0.06] backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:bg-white/[0.10] hover:border-white/[0.20] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300 cursor-default overflow-hidden"
                        >
                            {/* Icon 打光 */}
                            <div className={`absolute -top-8 -left-8 w-32 h-32 ${card.glowColor} rounded-full blur-2xl pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-300`} />

                            {/* Icon + Label */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-12 h-12 rounded-full ${card.iconBg} flex items-center justify-center`}>
                                    <card.Icon size={32} className={card.iconColor} />
                                </div>
                                <span className={`text-sm font-bold uppercase tracking-wider ${card.labelColor}`}>
                                    {card.label}
                                </span>
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-bold text-white mb-3 leading-snug">
                                {card.title}
                            </h3>

                            {/* Body */}
                            <p className="text-sm text-slate-400 leading-relaxed">
                                {card.id === 'how' ? (
                                    <>用一個「<button onClick={() => setIsRoadmapOpen(true)} className="text-amber-300 underline underline-offset-2 decoration-amber-500/40 hover:text-amber-200 hover:decoration-amber-400 transition-colors cursor-pointer">檔案管理系統</button>」實戰 12 個設計模式的應用場景，理解每個設計決策背後的為什麼。</>
                                ) : card.body}
                            </p>
                        </div>
                    ))}
                </div>

                {/* CTA 按鈕 */}
                <div className="flex flex-col items-center gap-4">
                    <button
                        onClick={onEnter}
                        className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(99,102,241,0.3)] active:scale-100"
                    >
                        <span className="flex items-center gap-2">
                            開始探索
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                        </span>
                    </button>
                </div>
            </div>
            <RoadmapDialog isOpen={isRoadmapOpen} onClose={() => setIsRoadmapOpen(false)} />
        </div>
    );
};

export default LandingPage;
