import React, { useState, useEffect, useRef } from 'react';
import {
  Network, Code, Layout, Database, Sparkles, ChessKnight,
} from 'lucide-react';

import ExplorerTab from './components/ExplorerTab';
import DomainTab from './components/DomainTab';
import ERTab from './components/ERTab';
import CodeTab from './components/CodeTab';
import ReflectionTab from './components/ReflectionTab';
import LandingPage from './components/LandingPage';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('explorer');
  const [showLanding, setShowLanding] = useState(true);
  const navAnchorRef = useRef<HTMLDivElement>(null);
  const scrollIntentRef = useRef<'sticky' | 'top' | null>(null);

  const handleTabClick = (tabId: string) => {
    if (navAnchorRef.current) {
      const rect = navAnchorRef.current.getBoundingClientRect();
      const anchorY = rect.top + window.scrollY;
      const yThreshold = anchorY - 16; // 16px is sticky offset

      // Determine user's scroll position BEFORE activeTab state updates
      // Add a small (-2px) tolerance because if it's already sticky, 
      // window.scrollY will often exactly equal yThreshold or be off by a fraction of a pixel.
      if (window.scrollY >= yThreshold - 2) {
        scrollIntentRef.current = 'sticky';
      } else {
        scrollIntentRef.current = 'top';
      }
    }
    setActiveTab(tabId);
  };

  // Scroll logic when active tab changes
  useEffect(() => {
    if (!navAnchorRef.current || !scrollIntentRef.current) return;

    // Calculate dynamic threshold
    const rect = navAnchorRef.current.getBoundingClientRect();
    const anchorY = rect.top + window.scrollY;
    const yThreshold = anchorY - 16;

    const targetScroll = scrollIntentRef.current === 'sticky' ? yThreshold : 0;

    // Immediately try to scroll
    window.scrollTo({ top: targetScroll, behavior: 'instant' });

    // Also apply it slightly after render to counter any height computations or mermaid renders
    const timer = setTimeout(() => {
      window.scrollTo({ top: targetScroll, behavior: 'instant' });
    }, 10);

    // Reset intent
    scrollIntentRef.current = null;

    return () => clearTimeout(timer);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1d1d1f] font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors duration-500">

      {/* Landing Page */}
      {showLanding && (
        <LandingPage onEnter={() => setShowLanding(false)} />
      )}

      {/* App 主體 */}
      {!showLanding && (
        <>

          {/* Background decoration - optional subtle gradient */}
          <div className="fixed inset-0 bg-gradient-to-tr from-blue-50/30 via-transparent to-purple-50/30 pointer-events-none" />

          {/* Technology Grid Background */}
          <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
            <header className="mb-6 text-center md:text-left space-y-4">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                {/* Left: Title */}
                <h1
                  onClick={() => setShowLanding(true)}
                  className="text-4xl md:text-6xl font-black tracking-tight drop-shadow-sm cursor-pointer hover:opacity-80 transition-opacity duration-200"
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Beyond</span>
                  <span className="whitespace-nowrap ml-1 text-slate-500/30" style={{ WebkitTextStroke: '1px #64748b' }}> Design Patterns</span>
                </h1>

                {/* Divider removed */}

                {/* Right: Version + Subtitle group */}
                <div className="flex flex-col items-center md:items-start gap-3">
                  <span className="text-sm uppercase tracking-widest font-bold text-blue-600 inline-flex items-center gap-1">@2026 <ChessKnight size={16} /> 丙午．春．v3000</span>
                  <p className="text-sm md:text-base text-[#86868b] font-medium leading-relaxed text-center md:text-left whitespace-nowrap">
                    走出 if - else 的混亂，你需要的是設計思維
                  </p>
                </div>
              </div>
            </header>

            {/* Anchor for dynamic scroll threshold calculation */}
            <div ref={navAnchorRef} aria-hidden="true" />

            {/* Floating Dock Navigation - Updated Style */}
            <div className="flex justify-center mb-8 sticky top-4 z-50">
              <div className="flex w-full justify-between p-2 bg-white/70 backdrop-blur-2xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 ring-1 ring-black/5">
                {[
                  { id: 'explorer', l: '互動探索', i: Network },
                  { id: 'domain', l: '領域模型', i: Layout },
                  { id: 'er', l: '資料關聯', i: Database },
                  { id: 'code', l: '實作解析', i: Code },
                  { id: 'reflection', l: 'AI 時代', i: Sparkles }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`
                  flex-1 justify-center relative px-4 py-3 rounded-full text-base font-bold transition-all duration-300 ease-out flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                  ${activeTab === tab.id
                        ? 'bg-slate-900 text-white shadow-lg scale-100 cursor-default'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 active:scale-95 cursor-pointer'}
                `}
                  >
                    <tab.i size={20} className={`transition-transform duration-300 ${activeTab === tab.id ? 'scale-110 text-blue-300' : 'group-hover:scale-110'}`} />
                    <span className={`hidden md:inline ${activeTab === tab.id ? 'opacity-100' : 'opacity-70'}`}>{tab.l}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area - Bento Layout Container */}
            <main className="transition-all duration-500 ease-in-out">
              <div className="min-h-[83vh] animate-in fade-in duration-700 fill-mode-backwards">
                {activeTab === 'explorer' && <ExplorerTab />}
                {activeTab === 'domain' && <DomainTab />}
                {activeTab === 'er' && <ERTab />}
                {activeTab === 'code' && <CodeTab />}
                {activeTab === 'reflection' && <ReflectionTab />}
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  );
};

export default App;