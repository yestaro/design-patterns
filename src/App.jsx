import React, { useState } from 'react';
import {
  Network, Code, Layout, Database, Lightbulb,
} from 'lucide-react';

import ExplorerTab from './components/ExplorerTab';
import DomainTab from './components/DomainTab';
import ERTab from './components/ERTab';
import CodeTab from './components/CodeTab';
import ReflectionTab from './components/ReflectionTab';

const App = () => {
  const [activeTab, setActiveTab] = useState('explorer');

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900 text-left text-sm md:text-base lg:text-lg">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .dark-scrollbar::-webkit-scrollbar { width: 4px; }
        .dark-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        .dark-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
        .dark-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.2) transparent; }
      `}</style>

      <div className="max-w-full mx-auto">
        <header className="mb-6 text-center">
          <h1 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight text-center">檔案管理系統設計模式教學 v2.0</h1>
          <p className="text-slate-500 text-sm lg:text-base font-medium text-center italic mt-1 font-bold text-blue-600 text-center">從 if - else 到抽象、封裝與介面，以架構思維實踐高品質程式碼</p>
        </header>

        <div className="flex flex-wrap gap-1 mb-6 p-1 bg-white rounded-xl shadow-sm border border-slate-200">
          {[{ id: 'explorer', l: '互動探索', i: Network }, { id: 'domain', l: '領域模型', i: Layout }, { id: 'er', l: '資料關聯', i: Database }, { id: 'code', l: '實作解析', i: Code }, { id: 'reflection', l: '心得問答', i: Lightbulb }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}><tab.i size={20} /> {tab.l}</button>
          ))}
        </div>

        {activeTab === 'explorer' && <ExplorerTab />}
        {activeTab === 'domain' && <DomainTab />}
        {activeTab === 'er' && <ERTab />}
        {activeTab === 'code' && <CodeTab />}
        {activeTab === 'reflection' && <ReflectionTab />}
      </div>
    </div>
  );
};

export default App;