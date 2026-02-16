import React, { useState, useEffect, useRef } from 'react';
import { Layout, Code } from 'lucide-react';
import CodeBlock from './CodeBlock';
import mermaid from 'mermaid';
import { patterns } from '../data/patterns';

const DomainTab: React.FC = () => {
    const [activeTab, setActiveTab] = useState('composite');

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose'
        });
    }, []);

    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // RWD Scroll Logic
        if (window.innerWidth < 768 && contentRef.current) {
            // Mobile: Scroll to content
            contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            // Desktop: Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        requestAnimationFrame(async () => {
            try {
                const mermaidElements = document.querySelectorAll('.mermaid');
                mermaidElements.forEach(el => {
                    const htmlEl = el as HTMLElement;
                    htmlEl.removeAttribute('data-processed');
                    htmlEl.style.visibility = 'hidden';
                });

                await mermaid.run({ querySelector: '.mermaid' });

                mermaidElements.forEach(el => {
                    (el as HTMLElement).style.visibility = 'visible';
                });
            } catch (e: any) {
                console.warn('[Mermaid] render skipped:', e.message);
            }
        });
    }, [activeTab]);

    const currentPattern = patterns.find(p => p.id === activeTab);

    return (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-left text-base">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2"><Layout className="text-blue-600" /> 設計模式：架構演進實戰地圖</h2>

            {/* Main Grid Layout: Mobile (1 col) -> Desktop (12 cols) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Sidebar Navigation: Mobile (Full Width) -> Desktop (4 cols) */}
                <div className="col-span-1 md:col-span-4">
                    <div className="md:sticky md:top-6 overflow-hidden rounded-2xl border-2 border-slate-200">
                        {patterns.map((pattern, index) => (
                            <div
                                key={pattern.id}
                                onClick={() => setActiveTab(pattern.id)}
                                className={`p-4 cursor-pointer transition-all ${activeTab === pattern.id
                                    ? 'bg-blue-600 text-white border-l-4 border-l-blue-800'
                                    : 'bg-white hover:bg-blue-50'
                                    } ${index !== patterns.length - 1 ? 'border-b border-slate-200' : ''}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-base font-bold opacity-90">{index + 1}. {pattern.chapter}</span>
                                    <span className={`text-sm font-black italic ${activeTab === pattern.id ? 'text-white' : 'text-blue-600'}`}>
                                        {pattern.name}
                                    </span>
                                </div>
                                <p
                                    className={`text-xs leading-relaxed ${activeTab === pattern.id ? 'text-blue-50' : 'text-slate-600'}`}
                                    dangerouslySetInnerHTML={{ __html: pattern.description }}
                                ></p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Area: Mobile (Full Width) -> Desktop (8 cols) */}
                <div ref={contentRef} className="col-span-1 md:col-span-8">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        {currentPattern && (
                            <div>
                                <h3 className="text-lg font-black text-slate-800 mb-4">{currentPattern.name} Pattern</h3>
                                <p className="text-slate-600 mb-4">{currentPattern.description}</p>

                                <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-sm overflow-x-auto">
                                    <h4 className="font-bold text-slate-800 mb-3 text-center">{currentPattern.name} Pattern UML</h4>
                                    <div className="mermaid min-w-[300px]" key={activeTab}>
                                        {currentPattern.mermaid}
                                    </div>
                                </div>

                                {currentPattern.usage && (
                                    <div className="mt-6 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-md">
                                        <div className="px-5 py-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                                            <div className="font-bold text-slate-200 flex items-center gap-2">
                                                <Code size={20} className="text-blue-400" /> {currentPattern.usage.title}
                                            </div>
                                            <span className="text-xs text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded">TypeScript</span>
                                        </div>
                                        <div className="p-5 overflow-x-auto">
                                            {currentPattern.usage.description && (
                                                <p className="text-slate-400 mb-4 text-sm leading-relaxed border-b border-slate-800 pb-4">
                                                    {currentPattern.usage.description}
                                                </p>
                                            )}
                                            <CodeBlock code={currentPattern.usage.code} language="typescript" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DomainTab;
