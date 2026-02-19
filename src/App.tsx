import React, { useState } from 'react';
import {
  Network, Code, Layout, Database, Sparkles,
} from 'lucide-react';

import ExplorerTab from './components/ExplorerTab';
import DomainTab from './components/DomainTab';
import ERTab from './components/ERTab';
import CodeTab from './components/CodeTab';
import ReflectionTab from './components/ReflectionTab';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('explorer');

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1d1d1f] font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors duration-500">

      {/* Background decoration - optional subtle gradient */}
      <div className="fixed inset-0 bg-gradient-to-tr from-blue-50/30 via-transparent to-purple-50/30 pointer-events-none" />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <header className="mb-6 text-center md:text-left space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            {/* Left: Title */}
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#1d1d1f] drop-shadow-sm">
              Design Patterns <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Mastery</span>
            </h1>

            {/* Vertical Divider (visible on desktop) */}
            <div className="hidden md:block w-[1px] h-16 bg-slate-300/50"></div>

            {/* Right: Version + Subtitle group */}
            <div className="flex flex-col items-center md:items-start gap-3">
              <span className="text-sm uppercase tracking-widest font-bold text-blue-600">v3000</span>
              <p className="text-sm md:text-base text-[#86868b] font-medium leading-relaxed text-center md:text-left whitespace-nowrap">
                從 if - else 到抽象、封裝與介面，以架構思維實踐高品質程式碼
              </p>
            </div>
          </div>
        </header>

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
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 justify-center relative px-4 py-3 rounded-full text-base font-bold transition-all duration-300 ease-out flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                  ${activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-lg scale-100'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 active:scale-95'}
                `}
              >
                <tab.i size={20} className={`transition-transform duration-300 ${activeTab === tab.id ? 'scale-110 text-white' : 'group-hover:scale-110'}`} />
                <span className={`${activeTab === tab.id ? 'opacity-100' : 'hidden sm:inline opacity-70'}`}>{tab.l}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area - Bento Layout Container */}
        <main className="transition-all duration-500 ease-in-out transform">
          <div className="min-h-[600px] animate-in slide-in-from-bottom-4 duration-700 fade-in fill-mode-backwards">
            {activeTab === 'explorer' && <ExplorerTab />}
            {activeTab === 'domain' && <DomainTab />}
            {activeTab === 'er' && <ERTab />}
            {activeTab === 'code' && <CodeTab />}
            {activeTab === 'reflection' && <ReflectionTab />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;