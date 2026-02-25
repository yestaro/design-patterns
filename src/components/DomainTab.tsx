import React, { useState, useEffect, useRef } from 'react';
import { Layout, Code, ArrowLeft } from 'lucide-react';
import CodeBlock from './shared/CodeBlock';
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

    const [showMobileDetail, setShowMobileDetail] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const listScrollPos = useRef(0);
    const hasEnteredDetail = useRef(false);

    // Restore scroll position when returning to list view on mobile
    useEffect(() => {
        if (showMobileDetail) {
            hasEnteredDetail.current = true;
        } else if (hasEnteredDetail.current && isMobile) {
            window.scrollTo({ top: listScrollPos.current, behavior: 'instant' });
            hasEnteredDetail.current = false;
        }
    }, [showMobileDetail, isMobile]);

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
        } else {
            if (isMobile && showMobileDetail && contentRef.current) {
                // Mobile: Only scroll if we are showing the detail view (slide-in)
                const yOffset = -100; // Offset for sticky header
                const rect = contentRef.current.getBoundingClientRect();
                const targetY = Math.max(0, rect.top + window.scrollY + yOffset);
                window.scrollTo({ top: targetY, behavior: 'smooth' });
            }
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
        <div ref={containerRef} className="text-left text-base animate-in fade-in duration-500">
            {/* Main Grid Layout: Mobile (1 col) -> Desktop (12 cols) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Sidebar Navigation: Mobile (Full Width) -> Desktop (4 cols) */}
                <div className={`col-span-1 md:col-span-4 ${isMobile && showMobileDetail ? 'hidden' : 'block'}`}>
                    <div className="md:sticky md:top-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                        {patterns.map((pattern, index) => (
                            <div
                                key={pattern.id}
                                onClick={() => {
                                    if (isMobile) {
                                        listScrollPos.current = window.scrollY;
                                        setShowMobileDetail(true);
                                    } else {
                                        // Explicitly scroll Desktop content to top ONLY when sidebar is clicked here
                                        if (containerRef.current) {
                                            const yOffset = -100;
                                            const rect = containerRef.current.getBoundingClientRect();
                                            const targetY = Math.max(0, rect.top + window.scrollY + yOffset);
                                            window.scrollTo({ top: targetY, behavior: 'smooth' });
                                        }
                                    }
                                    setActiveTab(pattern.id);
                                }}
                                className={`p-4 cursor-pointer transition-all ${activeTab === pattern.id
                                    ? 'bg-blue-600 text-white'
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

                {/* Content Area: Mobile (Slide-in) -> Desktop (8 cols) */}
                <div ref={contentRef} className={`col-span-1 md:col-span-8 ${isMobile && !showMobileDetail ? 'hidden' : 'block'} ${isMobile ? 'animate-in slide-in-from-right duration-300' : ''}`}>

                    {/* Mobile Back Button - Floating Bottom Right */}
                    {isMobile && (
                        <button
                            onClick={() => {
                                setShowMobileDetail(false);
                            }}
                            className="fixed bottom-6 right-6 z-50 p-3 bg-blue-600/90 text-white rounded-full shadow-lg backdrop-blur-sm active:scale-90 transition-all hover:bg-blue-700"
                            title="返回列表"
                        >
                            <ArrowLeft size={24} />
                        </button>
                    )}

                    <div className={`${isMobile ? '' : 'bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full transition-all hover:shadow-md'}`}>
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
