import { Database, Eye, Layers, TableProperties } from 'lucide-react';
import React, { useState } from 'react';

const ERTab: React.FC = () => {
    const [activeInheritance, setActiveInheritance] = useState<'sti' | 'cti' | 'concrete'>('sti');
    const [activeHierarchy, setActiveHierarchy] = useState<'adjacency' | 'path' | 'closure'>('adjacency');
    const [activePolymorphic, setActivePolymorphic] = useState<'belongsTo' | 'exclusive' | 'reverse'>('belongsTo');
    const [activeMetadata, setActiveMetadata] = useState<'eav' | 'json' | 'overload'>('eav');

    return (
        <div className="text-left text-base animate-in fade-in duration-500">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 mb-8 text-left transition-all hover:shadow-md">
                <h2 className="text-xl font-black mb-6 flex items-center gap-2"><Database className="text-blue-600" /> 混合 ER 模型 (Hybrid Model: JSON + EAV)</h2>

                <div className="space-y-8 mt-6">
                    {/* Row 1: Entries & EntryAttributes */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Entries 主表 */}
                        <div>
                            <div className="bg-slate-800 text-white p-4 rounded-t-2xl font-mono text-base flex items-center shadow-lg text-left">
                                <span className="flex items-center gap-2 font-bold text-left"><Layers size={16} /> Entries (主表結構: Composite)</span>
                            </div>
                            <div className="border border-slate-200 rounded-b-2xl overflow-hidden shadow-md bg-white">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                                        <tr><th className="p-4 text-left w-1/2">COLUMN</th><th className="p-4 text-left w-1/2">ROLE</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                        <tr><td className="p-4 font-bold">EntryID</td><td className="p-4 text-blue-600 font-bold">PK</td></tr>
                                        <tr className="bg-amber-50/30"><td className="p-4 font-bold">ParentID</td><td className="p-4 text-amber-600 font-bold italic text-xs">FK (Self)</td></tr>
                                        <tr><td className="p-4 font-bold">Name</td><td className="p-4 text-slate-400 italic">Core Data</td></tr>
                                        <tr><td className="p-4 font-bold">Type</td><td className="p-4 text-slate-400 italic">Core Data</td></tr>
                                        <tr><td className="p-4 font-bold">Size</td><td className="p-4 text-slate-400 italic">Core Data</td></tr>
                                        <tr><td className="p-4 font-bold text-slate-700">Created</td><td className="p-4 text-slate-400 italic font-mono">DateTime</td></tr>
                                        <tr className="bg-blue-50/50">
                                            <td className="p-4 font-bold text-blue-800 italic">Attributes (JSONB)</td>
                                            <td className="p-4 text-blue-600 text-xs font-bold">FAST READ SNAPSHOT</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* EntryAttributes 細節表 */}
                        <div>
                            <div className="bg-indigo-900 text-white p-4 rounded-t-2xl font-mono text-base flex items-center shadow-lg text-indigo-100">
                                <span className="flex items-center gap-2 font-bold"><TableProperties size={16} /> EntryAttributes (細節表結構: SubClass)</span>
                            </div>
                            <div className="border border-indigo-200 rounded-b-2xl overflow-hidden shadow-md bg-white">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-indigo-50 text-indigo-500 uppercase font-bold text-xs">
                                        <tr><th className="p-4 text-left w-1/2">COLUMN</th><th className="p-4 text-left w-1/2">ROLE</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-indigo-50 text-slate-700">
                                        <tr><td className="p-4 font-bold">AttrID</td><td className="p-4 text-blue-600 font-bold">PK</td></tr>
                                        <tr className="bg-slate-50"><td className="p-4 font-bold">EntryID</td><td className="p-4 text-red-600 font-bold text-xs">FK (Entries)</td></tr>
                                        <tr><td className="p-4 font-bold">AttrName</td><td className="p-4 text-indigo-700 italic font-bold">INDEXED</td></tr>
                                        <tr><td className="p-4 font-bold">AttrValue</td><td className="p-4 text-slate-500">Value</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: EntryTags & Tags */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* EntryTags 關聯表 (Mediator) */}
                        <div>
                            <div className="bg-rose-900 text-white p-4 rounded-t-2xl font-mono text-base flex items-center shadow-lg text-rose-100">
                                <span className="flex items-center gap-2 font-bold"><TableProperties size={16} /> EntryTags (關聯表: Mediator)</span>
                            </div>
                            <div className="border border-rose-200 rounded-b-2xl overflow-hidden shadow-md bg-white">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-rose-50 text-rose-500 uppercase font-bold text-xs">
                                        <tr><th className="p-4 text-left w-1/2">COLUMN</th><th className="p-4 text-left w-1/2">ROLE</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-rose-50 text-slate-700">
                                        <tr><td className="p-4 font-bold">EntryID</td><td className="p-4 text-blue-600 font-bold text-xs">PK, FK(Entries)</td></tr>
                                        <tr><td className="p-4 font-bold">TagID</td><td className="p-4 text-blue-600 font-bold text-xs">PK, FK(Tags)</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Tags 標籤表 (Flyweight) */}
                        <div>
                            <div className="bg-emerald-800 text-white p-4 rounded-t-2xl font-mono text-base flex items-center shadow-lg text-emerald-100">
                                <span className="flex items-center gap-2 font-bold"><Layers size={16} /> Tags (標籤來源: Flyweight)</span>
                            </div>
                            <div className="border border-emerald-200 rounded-b-2xl overflow-hidden shadow-md bg-white">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-emerald-50 text-emerald-500 uppercase font-bold text-xs">
                                        <tr><th className="p-4 text-left w-1/2">COLUMN</th><th className="p-4 text-left w-1/2">ROLE</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-emerald-50 text-slate-700">
                                        <tr><td className="p-4 font-bold">TagID</td><td className="p-4 text-blue-600 font-bold">PK</td></tr>
                                        <tr><td className="p-4 font-bold">TagName</td><td className="p-4 text-emerald-700 italic font-bold">UNIQUE</td></tr>
                                        <tr><td className="p-4 font-bold">Color</td><td className="p-4 text-slate-500">Style</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 範例數據 */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 mb-8 text-left transition-all hover:shadow-md">
                <div className="flex items-center mb-6 gap-2 text-slate-800">
                    <Eye size={24} className="text-blue-500" />
                    <h4 className="text-xl font-bold tracking-tight">範例數據展示 (Sample Data)</h4>
                </div>
                <div className="space-y-8">
                    {/* Row 1: Entries & EntryAttributes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <p className="text-sm font-bold text-slate-600 flex items-center gap-2"><Layers size={14} /> 1. Entries 主表實例</p>
                            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                                <table className="w-full text-sm text-slate-700">
                                    <thead className="bg-slate-100 border-b border-slate-200 text-left">
                                        <tr>
                                            <th className="p-3">EntryID</th><th className="p-3">ParentID</th><th className="p-3">Name</th><th className="p-3">Type</th><th className="p-3">Size (KB)</th><th className="p-3">Created</th><th className="p-3">Attributes (JSON)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        <tr>
                                            <td className="p-3 font-mono">101</td><td className="p-3 text-slate-400 font-mono">NULL</td><td className="p-3 font-bold text-blue-600 italic">根目錄 (Root)</td><td className="p-3">Dir</td><td className="p-3">0</td><td className="p-3 text-xs">2025-01-01</td><td className="p-3 text-slate-400">{"{}"}</td>
                                        </tr>
                                        <tr className="bg-slate-50/50">
                                            <td className="p-3 font-mono">202</td><td className="p-3 font-mono">101</td><td className="p-3 font-bold text-blue-600 italic">專案文件 (Project_Docs)</td><td className="p-3">Dir</td><td className="p-3">0</td><td className="p-3 text-xs">2025-01-10</td><td className="p-3 text-slate-400">{"{}"}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-mono">303</td><td className="p-3 font-mono">202</td><td className="p-3 font-bold underline">需求規格書.docx</td><td className="p-3">Word</td><td className="p-3">500</td><td className="p-3 text-xs">2025-01-10</td><td className="p-3 text-indigo-600">{"{\"PageCount\": 15}"}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm font-bold text-slate-600 flex items-center gap-2"><TableProperties size={14} /> 2. EntryAttributes 細節表實例</p>
                            <div className="overflow-x-auto rounded-xl border border-indigo-200 shadow-sm">
                                <table className="w-full text-sm text-slate-700">
                                    <thead className="bg-indigo-50 border-b border-indigo-100 text-left">
                                        <tr><th className="p-3">AttrID</th><th className="p-3">EntryID</th><th className="p-3">AttrName</th><th className="p-3">AttrValue</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-indigo-50 bg-white">
                                        <tr><td className="p-3">1</td><td className="p-3 font-mono">303</td><td className="p-3 text-indigo-600 font-bold underline">PageCount</td><td className="p-3 font-mono">15</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: EntryTags & Tags */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <p className="text-sm font-bold text-slate-600 flex items-center gap-2"><TableProperties size={14} /> 3. EntryTags (Mediator) 實例</p>
                            <div className="overflow-x-auto rounded-xl border border-rose-200 shadow-sm">
                                <table className="w-full text-sm text-slate-700">
                                    <thead className="bg-rose-50 border-b border-rose-100 text-left">
                                        <tr><th className="p-3">EntryID (FK)</th><th className="p-3">TagID (FK)</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-rose-50 bg-white">
                                        <tr><td className="p-3 font-mono">303</td><td className="p-3 font-mono">T1</td></tr>
                                        <tr><td className="p-3 font-mono">303</td><td className="p-3 font-mono">T2</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm font-bold text-slate-600 flex items-center gap-2"><Layers size={14} /> 4. Tags (Flyweight) 實例</p>
                            <div className="overflow-x-auto rounded-xl border border-emerald-200 shadow-sm">
                                <table className="w-full text-sm text-slate-700">
                                    <thead className="bg-emerald-50 border-b border-emerald-100 text-left">
                                        <tr><th className="p-3">TagID</th><th className="p-3">TagName</th><th className="p-3">Color</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-emerald-50 bg-white">
                                        <tr><td className="p-3 font-mono">T1</td><td className="p-3 text-emerald-600 font-bold">Urgent</td><td className="p-3 text-xs"><span className="px-2 py-1 rounded bg-red-100 text-red-600">red-500</span></td></tr>
                                        <tr><td className="p-3 font-mono">T2</td><td className="p-3 text-emerald-600 font-bold">Work</td><td className="p-3 text-xs"><span className="px-2 py-1 rounded bg-blue-100 text-blue-600">blue-500</span></td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-slate-900 rounded-2xl text-white text-base shadow-xl border border-slate-700 text-left">
                <h4 className="text-blue-400 font-bold mb-4 flex items-center gap-2 italic tracking-wider">混合架構 (Hybrid) 教學引導</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 leading-relaxed text-left">
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <p className="font-bold text-amber-400 mb-2">● 為何要重複存屬性？</p>
                        <p className="text-sm opacity-80">Entries 表的 JSON 用於「前端呈現」。只需一次查詢主表即可得到快照，減少查詢次數。</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <p className="font-bold text-amber-400 mb-2">● 細節表 (EAV) 用在哪？</p>
                        <p className="text-sm opacity-80">用於「搜尋與分析」。SQL 透過細節表過濾速度遠快於解析 JSON，且能建立高效索引。</p>
                    </div>
                </div>
            </div>

            {/* 3. 模式的無所不在 (Patterns Everywhere) */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 text-left space-y-12 mt-8">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 border-l-8 border-indigo-600 pl-4 py-1">
                    Other Schema Designs
                </h2>

                {/* 1. Inheritance Mapping */}
                <section className="space-y-8">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3 text-slate-800">
                            <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-base">1</span>
                            <h4 className="text-xl font-bold text-slate-800">繼承映射 Inheritance Mapping</h4>
                        </div>

                        {/* Inheritance Scorecards Tabs */}
                        <div className="flex flex-wrap justify-center gap-3 w-full">
                            <button
                                onClick={() => setActiveInheritance('sti')}
                                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activeInheritance === 'sti' ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                            >
                                <span className={`text-sm font-black tracking-wide ${activeInheritance === 'sti' ? 'text-indigo-700' : 'text-slate-500'}`}>Single Table Inheritance</span>
                                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Query:</span><span className="text-amber-500">5/5</span></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Integrity:</span><span className="text-amber-500">2/5</span></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Flexibility:</span><span className="text-amber-500">1/5</span></div>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveInheritance('cti')}
                                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activeInheritance === 'cti' ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                            >
                                <span className={`text-sm font-black tracking-wide ${activeInheritance === 'cti' ? 'text-indigo-700' : 'text-slate-500'}`}>Class Table Inheritance</span>
                                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Query:</span><span className="text-amber-500">3/5</span></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Integrity:</span><span className="text-amber-500">5/5</span></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Flexibility:</span><span className="text-amber-500">4/5</span></div>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveInheritance('concrete')}
                                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activeInheritance === 'concrete' ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                            >
                                <span className={`text-sm font-black tracking-wide ${activeInheritance === 'concrete' ? 'text-indigo-700' : 'text-slate-500'}`}>Concrete Table Inheritance</span>
                                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Query:</span><span className="text-amber-500">4/5</span></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Integrity:</span><span className="text-amber-500">3/5</span></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Flexibility:</span><span className="text-amber-500">5/5</span></div>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {activeInheritance === 'sti' && (
                            /* A. STI */
                            <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-lg font-black text-slate-700 italic">STI (Single Table Inheritance) - 全量寬表映射</h5>
                                </div>
                                <div className="sample-table-container shadow-lg">
                                    <table className="sample-table whitespace-nowrap">
                                        <thead>
                                            <tr>
                                                <th className="bg-slate-100/50">EntryID</th>
                                                <th className="text-indigo-700">Type</th>
                                                <th className="italic">ParentID</th>
                                                <th>Name</th>
                                                <th>Size</th>
                                                <th className="bg-rose-50 text-rose-600 font-black">PageCount</th>
                                                <th className="bg-emerald-50 text-emerald-600 font-black text-center">Width</th>
                                                <th className="bg-emerald-50 text-emerald-600 font-black text-center">Height</th>
                                                <th className="bg-amber-50 text-amber-700 font-black">Encoding</th>
                                                <th>Created</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="row-highlight">
                                                <td>101</td>
                                                <td className="font-bold text-slate-500">Dir</td>
                                                <td className="cell-null">NULL</td>
                                                <td className="font-black text-slate-700">根目錄 (Root)</td>
                                                <td>0</td>
                                                <td className="cell-null">NULL</td>
                                                <td className="cell-null">NULL</td>
                                                <td className="cell-null">NULL</td>
                                                <td className="cell-null">NULL</td>
                                                <td className="text-slate-400">2025-01-01</td>
                                            </tr>
                                            <tr>
                                                <td>202</td>
                                                <td className="font-bold text-slate-500">Dir</td>
                                                <td className="text-slate-400 italic">101</td>
                                                <td>專案文件 (Project_Docs)</td>
                                                <td>0</td>
                                                <td className="cell-null">NULL</td>
                                                <td className="cell-null">NULL</td>
                                                <td className="cell-null">NULL</td>
                                                <td className="cell-null">NULL</td>
                                                <td className="text-slate-400">2025-01-10</td>
                                            </tr>
                                            <tr>
                                                <td>303</td>
                                                <td className="font-black text-indigo-600">Word</td>
                                                <td className="text-slate-400 italic">202</td>
                                                <td>需求規格書.docx</td>
                                                <td>500</td>
                                                <td className="bg-rose-50/30 font-black text-rose-700 text-center italic">15</td>
                                                <td className="cell-null">NULL</td>
                                                <td className="cell-null">NULL</td>
                                                <td className="cell-null">NULL</td>
                                                <td className="text-slate-400">2025-01-10</td>
                                            </tr>
                                            <tr>
                                                <td>404</td>
                                                <td className="font-black text-indigo-600">Image</td>
                                                <td className="text-slate-400 italic">202</td>
                                                <td>架構圖.png</td>
                                                <td>2500</td>
                                                <td className="cell-null">NULL</td>
                                                <td className="bg-emerald-50/30 font-black text-emerald-700 text-center">1920</td>
                                                <td className="bg-emerald-50/30 font-black text-emerald-700 text-center">1080</td>
                                                <td className="cell-null">NULL</td>
                                                <td className="text-slate-400">2025-01-12</td>
                                            </tr>
                                            <tr>
                                                <td>505</td>
                                                <td className="font-black text-indigo-600">Text</td>
                                                <td className="text-slate-400 italic">202</td>
                                                <td>README.txt</td>
                                                <td>10</td>
                                                <td className="cell-null">NULL</td>
                                                <td className="cell-null">NULL</td>
                                                <td className="cell-null">NULL</td>
                                                <td className="bg-amber-50/30 font-black text-amber-700 text-center italic">UTF-8</td>
                                                <td className="text-slate-400">2025-01-15</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium"><b>物理真相：</b> 所有子型別共用同一張大寬表。查詢極快但造成大量 `NULL` 浪費，且每增加一個物件類型就必須頻繁修改物理 Schema，維護成本最高。</p>
                            </div>
                        )}

                        {activeInheritance === 'cti' && (
                            /* B. CTI */
                            <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-lg font-black text-slate-700 italic">CTI (Class Table Inheritance) - 階層式正規化</h5>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-lg shadow-slate-100/50">
                                        <div className="bg-slate-800 text-white px-4 py-1 font-black text-sm uppercase tracking-widest text-center italic">Main Table: Entries_Base</div>
                                        <table className="sample-table">
                                            <thead>
                                                <tr>
                                                    <th className="text-red-500">EntryID(PK)</th>
                                                    <th className="italic">ParentID</th>
                                                    <th>Name</th>
                                                    <th className="text-indigo-600">Type</th>
                                                    <th>Size</th>
                                                    <th>Created</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-slate-700">
                                                <tr className="row-highlight"><td>101</td><td className="cell-null">NULL</td><td className="font-black text-slate-700">根目錄 (Root)</td><td className="font-bold text-slate-500">Dir</td><td>0</td><td className="text-slate-400 text-nowrap">2025-01-01</td></tr>
                                                <tr><td>202</td><td className="text-slate-400 italic text-sm">101</td><td>專案文件 (Project_Docs)</td><td className="font-bold text-slate-500">Dir</td><td>0</td><td className="text-slate-400 text-nowrap">2025-01-10</td></tr>
                                                <tr><td className="underline text-red-500">303</td><td className="text-slate-400 italic text-sm">202</td><td className="italic">需求規格書.docx</td><td className="font-black text-indigo-600 text-sm">Word</td><td>500</td><td className="text-slate-400 text-nowrap">2025-01-10</td></tr>
                                                <tr><td className="underline text-red-500">404</td><td className="text-slate-400 italic text-sm">202</td><td className="italic">架構圖.png</td><td className="font-black text-indigo-600 text-sm">Image</td><td>2500</td><td className="text-slate-400 text-nowrap">2025-01-12</td></tr>
                                                <tr><td className="underline text-red-500">505</td><td className="text-slate-400 italic text-sm">202</td><td className="italic">README.txt</td><td className="font-black text-indigo-600 text-sm">Text</td><td>10</td><td className="text-slate-400 text-nowrap">2025-01-15</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="border border-rose-200 rounded-xl overflow-hidden shadow-lg shadow-rose-100/50">
                                            <div className="bg-rose-600 text-white px-4 py-1 font-black text-sm uppercase tracking-widest text-center italic">Extension: Word_Only</div>
                                            <table className="sample-table">
                                                <thead className="bg-rose-50 text-rose-600 font-black"><tr><th className="text-red-500 text-sm">EntryID(FK)</th><th>PageCount</th></tr></thead>
                                                <tbody><tr><td className="text-red-500 font-bold px-3 py-2">303</td><td className="font-black underline text-rose-700 px-3 py-2">15</td></tr></tbody>
                                            </table>
                                        </div>
                                        <div className="border border-emerald-200 rounded-xl overflow-hidden shadow-lg shadow-emerald-100/50">
                                            <div className="bg-emerald-600 text-white px-4 py-1 font-black text-sm uppercase tracking-widest text-center italic">Extension: Image_Only</div>
                                            <table className="sample-table">
                                                <thead className="bg-emerald-50 text-emerald-600 font-black"><tr><th className="text-red-500 text-sm">EntryID(FK)</th><th>Width</th><th>Height</th></tr></thead>
                                                <tbody><tr><td className="text-red-500 font-bold px-3 py-2">404</td><td className="font-black underline text-emerald-700 px-3 py-2">1920</td><td className="font-black underline text-emerald-700 px-3 py-2">1080</td></tr></tbody>
                                            </table>
                                        </div>
                                        <div className="border border-amber-200 rounded-xl overflow-hidden shadow-lg shadow-amber-100/50">
                                            <div className="bg-amber-600 text-white px-4 py-1 font-black text-sm uppercase tracking-widest text-center italic">Extension: Text_Only</div>
                                            <table className="sample-table">
                                                <thead className="bg-amber-50 text-amber-600 font-black"><tr><th className="text-red-500 text-sm">EntryID(FK)</th><th>Encoding</th></tr></thead>
                                                <tbody><tr><td className="text-red-500 font-bold px-3 py-2">505</td><td className="font-black underline text-amber-700 px-3 py-2">UTF-8</td></tr></tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium"><b>結構化：</b> 分離共用與特有屬性。模型乾淨但每次強制 `JOIN`，查詢負擔隨層級增加。</p>
                            </div>
                        )}

                        {activeInheritance === 'concrete' && (
                            /* C. Concrete Table Inheritance */
                            <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-lg font-black text-slate-700 italic">Concrete Table Inheritance - 物理隔離</h5>
                                </div>
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                                    {/* Dirs Table */}
                                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-lg shadow-slate-100/50">
                                        <div className="bg-slate-600 text-white px-4 py-1 font-black text-sm uppercase tracking-widest text-center italic">Physical Table: Directories_Only</div>
                                        <table className="sample-table">
                                            <thead className="text-slate-600">
                                                <tr><th>EntryID</th><th className="italic">ParentID</th><th>Name</th><th>Size</th><th>Created</th></tr>
                                            </thead>
                                            <tbody className="text-slate-700">
                                                <tr><td>101</td><td className="cell-null">NULL</td><td className="font-black text-slate-700">根目錄 (Root)</td><td>0</td><td className="text-slate-400 text-xs">2025-01-01</td></tr>
                                                <tr><td>202</td><td className="text-slate-400 italic">101</td><td>專案文件 (Project_Docs)</td><td>0</td><td className="text-slate-400 text-xs">2025-01-10</td></tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Words Table */}
                                    <div className="border border-rose-200 rounded-xl overflow-hidden shadow-lg shadow-rose-100/50">
                                        <div className="bg-rose-600 text-white px-4 py-1 font-black text-sm uppercase tracking-widest text-center italic">Physical Table: Words_Only</div>
                                        <table className="sample-table">
                                            <thead className="text-rose-600">
                                                <tr><th>EntryID</th><th className="italic">ParentID</th><th>Name</th><th className="bg-rose-50 text-rose-600 font-black">PageCount</th><th>Size</th><th>Created</th></tr>
                                            </thead>
                                            <tbody className="text-slate-700">
                                                <tr><td className="font-bold underline text-red-500">303</td><td className="text-slate-400 italic">202</td><td className="italic text-rose-700">需求規格書.docx</td><td className="bg-rose-50/20 text-rose-700 font-black text-center italic underline">15</td><td>500</td><td className="text-slate-400 text-xs text-nowrap">2025-01-10</td></tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Images Table */}
                                    <div className="border border-emerald-200 rounded-xl overflow-hidden shadow-lg shadow-emerald-100/50">
                                        <div className="bg-emerald-600 text-white px-4 py-1 font-black text-sm uppercase tracking-widest text-center italic">Physical Table: Images_Only</div>
                                        <table className="sample-table">
                                            <thead className="text-emerald-600">
                                                <tr><th>EntryID</th><th className="italic">ParentID</th><th>Name</th><th className="bg-emerald-50 text-emerald-600 font-black text-center">Width</th><th className="bg-emerald-50 text-emerald-600 font-black text-center">Height</th><th>Size</th><th>Created</th></tr>
                                            </thead>
                                            <tbody className="text-slate-700">
                                                <tr><td className="font-bold underline text-red-500">404</td><td className="text-slate-400 italic">202</td><td className="font-black italic text-emerald-700">架構圖.png</td><td className="bg-emerald-50/20 text-emerald-700 font-black text-center underline">1920</td><td className="bg-emerald-50/20 text-emerald-700 font-black text-center underline">1080</td><td>2500</td><td className="text-slate-400 text-xs text-nowrap">2025-01-12</td></tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Texts Table */}
                                    <div className="border border-amber-200 rounded-xl overflow-hidden shadow-lg shadow-amber-100/50">
                                        <div className="bg-amber-600 text-white px-4 py-1 font-black text-sm uppercase tracking-widest text-center italic">Physical Table: Texts_Only</div>
                                        <table className="sample-table">
                                            <thead className="text-amber-600">
                                                <tr><th>EntryID</th><th className="italic">ParentID</th><th>Name</th><th className="bg-amber-50 text-amber-600 font-black text-center">Encoding</th><th>Size</th><th>Created</th></tr>
                                            </thead>
                                            <tbody className="text-slate-700">
                                                <tr><td className="font-bold underline text-red-500">505</td><td className="text-slate-400 italic">202</td><td className="italic text-amber-700">README.txt</td><td className="bg-amber-50/20 text-amber-700 font-black text-center italic underline">UTF-8</td><td>10</td><td className="text-slate-400 text-xs text-nowrap">2025-01-15</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium"><b>物理隔離：</b> 每張表完全獨立存儲父類與子類欄位。雖然 `JOIN` 為零，但資料完整性與共用欄位的維護（如 Size 統計）極為困難。</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 2. Hierarchy Patterns */}
                <section className="pt-12 border-t border-slate-100 space-y-8">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-base">2</span>
                            <h4 className="text-xl font-bold text-slate-800">階層存儲模式 Hierarchy Patterns</h4>
                        </div>

                        {/* Hierarchy Scorecards Tabs */}
                        <div className="flex flex-wrap justify-center gap-3 w-full">
                            <button
                                onClick={() => setActiveHierarchy('adjacency')}
                                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activeHierarchy === 'adjacency' ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                            >
                                <span className={`text-sm font-black tracking-wide ${activeHierarchy === 'adjacency' ? 'text-indigo-700' : 'text-slate-500'}`}>Adjacency List</span>
                                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Query:</span><span className="text-amber-500">1/5</span></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Integrity:</span><span className="text-amber-500">5/5</span></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Flexibility:</span><span className="text-amber-500">5/5</span></div>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveHierarchy('path')}
                                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activeHierarchy === 'path' ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                            >
                                <span className={`text-sm font-black tracking-wide ${activeHierarchy === 'path' ? 'text-indigo-700' : 'text-slate-500'}`}>Path Enumeration</span>
                                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Query:</span><span className="text-amber-500">4/5</span></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Integrity:</span><span className="text-amber-500">2/5</span></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Flexibility:</span><span className="text-amber-500">3/5</span></div>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveHierarchy('closure')}
                                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activeHierarchy === 'closure' ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                            >
                                <span className={`text-sm font-black tracking-wide ${activeHierarchy === 'closure' ? 'text-indigo-700' : 'text-slate-500'}`}>Closure Table</span>
                                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Query:</span><span className="text-amber-500">5/5</span></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Integrity:</span><span className="text-amber-500">4/5</span></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Flexibility:</span><span className="text-amber-500">2/5</span></div>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {activeHierarchy === 'adjacency' && (
                            /* A. Adjacency List */
                            <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-lg font-black text-slate-700 italic">Adjacency List (鄰接表) - 最簡物理指標</h5>
                                </div>
                                <div className="sample-table-container shadow-lg shadow-slate-100/50">
                                    <table className="sample-table">
                                        <thead>
                                            <tr><th className="text-red-600">EntryID(PK)</th><th className="text-slate-400 italic">ParentID(FK)</th><th>Name</th><th className="bg-slate-100 text-slate-700 text-center font-black">Sort</th><th>Size</th><th>Created</th></tr>
                                        </thead>
                                        <tbody className="text-slate-700">
                                            <tr className="row-highlight"><td>101</td><td className="cell-null">NULL</td><td className="font-black text-slate-700">根目錄 (Root)</td><td className="bg-slate-50/80 text-center font-bold">1</td><td>0</td><td className="text-slate-400">2025-01-01</td></tr>
                                            <tr><td>202</td><td className="text-slate-400 underline italic font-black">101</td><td>專案文件 (Project_Docs)</td><td className="bg-slate-50/80 text-center font-bold text-slate-700">1</td><td>0</td><td className="text-slate-400">2025-01-10</td></tr>
                                            <tr><td>303</td><td className="text-slate-400 underline italic font-black">202</td><td className="italic">需求規格書.docx</td><td className="bg-slate-50/80 text-center font-bold text-slate-700 underline">1</td><td>500</td><td className="text-slate-400">2025-01-10</td></tr>
                                            <tr><td>404</td><td className="text-slate-400 underline italic font-black">202</td><td className="italic">架構圖.png</td><td className="bg-slate-50/80 text-center font-bold text-slate-700 underline">2</td><td>2500</td><td className="text-slate-400">2025-01-12</td></tr>
                                            <tr><td>505</td><td className="text-slate-400 underline italic font-black">202</td><td className="italic">README.txt</td><td className="bg-slate-50/80 text-center font-bold text-slate-700 underline">3</td><td>10</td><td className="text-slate-400">2025-01-15</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium"><b>物理真相：</b> 每個節點只知道自己的父節點。移動節點極快。排序時需增加 <b>Sort</b> 欄位並依 `ORDER BY ParentID, Sort` 查詢。</p>
                            </div>
                        )}

                        {activeHierarchy === 'path' && (
                            /* B. Path Enumeration */
                            <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-lg font-black text-slate-700 italic">Path Enumeration (路徑枚舉) - 預計算字串存儲</h5>
                                </div>
                                <div className="sample-table-container shadow-lg shadow-emerald-100/50">
                                    <table className="sample-table">
                                        <thead>
                                            <tr><th>EntryID</th><th>Name</th><th className="text-emerald-600 font-black italic">Materialized Path (Weight-Encoded)</th><th className="bg-slate-100 text-slate-700 text-center font-black">Sort</th><th>Size</th><th>Created</th></tr>
                                        </thead>
                                        <tbody className="text-slate-700">
                                            <tr className="row-highlight"><td>101</td><td className="font-black">根目錄 (Root)</td><td className="text-slate-400 font-bold">/001:101/</td><td className="bg-slate-50/80 text-center font-bold">1</td><td>0</td><td className="text-slate-400">2025-01-01</td></tr>
                                            <tr><td>202</td><td>專案文件</td><td className="text-emerald-700 font-black italic">/001:101/001:202/</td><td className="bg-slate-50/80 text-center font-bold">1</td><td>0</td><td className="text-slate-400">2025-01-10</td></tr>
                                            <tr><td>303</td><td className="italic">需求規格書.docx</td><td className="text-emerald-700 font-black italic">/001:101/001:202/001:303/</td><td className="bg-slate-50/80 text-center font-bold text-slate-700 underline">1</td><td>500</td><td className="text-slate-400">2025-01-10</td></tr>
                                            <tr><td>404</td><td className="italic">架構圖.png</td><td className="text-emerald-700 font-black italic">/001:101/001:202/002:404/</td><td className="bg-slate-50/80 text-center font-bold text-slate-700 underline">2</td><td>2500</td><td className="text-slate-400">2025-01-12</td></tr>
                                            <tr><td>505</td><td className="italic">README.txt</td><td className="text-emerald-700 font-black italic">/001:101/001:202/003:505/</td><td className="bg-slate-50/80 text-center font-bold text-slate-700 underline">3</td><td>10</td><td className="text-slate-400">2025-01-15</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium"><b>字串匹配：</b> 可將排序權重直接編入路徑（如 `/001:ID/`）實現「天然排序免計算」，或像上方一樣維持獨立 <b>Sort</b> 欄位以求靈活。</p>
                            </div>
                        )}

                        {activeHierarchy === 'closure' && (
                            /* C. Closure Table */
                            <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-lg font-black text-slate-700 italic">Closure Table (閉包表) - 笛卡兒積空間表</h5>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-lg shadow-slate-100/50">
                                        <div className="bg-slate-800 text-white px-4 py-1 font-black text-sm uppercase tracking-widest text-center italic">Main Table: Entries_Base</div>
                                        <table className="sample-table">
                                            <thead>
                                                <tr><th>EntryID(PK)</th><th>Name</th><th className="bg-slate-100 text-slate-700 text-center font-black">Sort</th><th>Size</th><th>Created</th></tr>
                                            </thead>
                                            <tbody className="text-slate-700 border-b border-slate-100">
                                                <tr className="row-highlight"><td>101</td><td className="font-black">根目錄 (Root)</td><td className="bg-slate-50/80 text-center font-bold">1</td><td>0</td><td className="text-slate-400">2025-01-01</td></tr>
                                                <tr><td>202</td><td>專案文件</td><td className="bg-slate-50/80 text-center font-bold">1</td><td>0</td><td className="text-slate-400">2025-01-10</td></tr>
                                                <tr><td>303</td><td className="italic">需求規格書.docx</td><td className="bg-slate-50/80 text-center font-bold text-slate-700 underline">1</td><td>500</td><td className="text-slate-400">2025-01-10</td></tr>
                                                <tr><td>404</td><td className="italic">架構圖.png</td><td className="bg-slate-50/80 text-center font-bold text-slate-700 underline">2</td><td>2500</td><td className="text-slate-400">2025-01-12</td></tr>
                                                <tr><td>505</td><td className="italic">README.txt</td><td className="bg-slate-50/80 text-center font-bold text-slate-700 underline">3</td><td>10</td><td className="text-slate-400">2025-01-15</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="sample-table-container shadow-lg shadow-indigo-100/50">
                                            <div className="bg-indigo-600 text-white px-4 py-1 font-black text-sm uppercase tracking-widest text-center italic">Closure Relations Table</div>
                                            <table className="sample-table">
                                                <thead>
                                                    <tr><th className="text-rose-600">Ancestor</th><th className="text-indigo-600">Descendant</th><th className="text-center font-black">Depth</th></tr>
                                                </thead>
                                                <tbody className="italic text-slate-700 text-xs">
                                                    <tr><td className="text-slate-400">101</td><td>101</td><td className="text-center">0</td></tr>
                                                    <tr><td className="font-bold text-slate-500">101</td><td className="font-black text-indigo-700">202</td><td className="text-center">1</td></tr>
                                                    <tr><td className="font-bold text-slate-500">101</td><td className="font-black text-rose-700">303</td><td className="text-center">2</td></tr>
                                                    <tr><td className="font-bold text-slate-500">202</td><td className="font-black text-rose-700">303</td><td className="text-center">1</td></tr>
                                                    <tr className="bg-slate-50"><td>...</td><td>...</td><td className="text-center">...</td></tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium"><b>空間換時間：</b> 它是最正規、查詢最強大的層級設計。透過一張專門的關聯表紀錄所有「祖先-子代」的笛卡兒積。</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 3. Polymorphic Associations */}
                <section className="pt-12 border-t border-slate-100 space-y-8">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-base">3</span>
                            <h4 className="text-xl font-bold text-slate-800">多型關聯模式 Polymorphic Associations</h4>
                        </div>

                        {/* Polymorphic Scorecards Tabs */}
                        <div className="flex flex-wrap justify-center gap-3 w-full">
                            <button
                                onClick={() => setActivePolymorphic('belongsTo')}
                                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activePolymorphic === 'belongsTo' ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                            >
                                <span className={`text-sm font-black tracking-wide ${activePolymorphic === 'belongsTo' ? 'text-indigo-700' : 'text-slate-500'}`}>Polymorphic Belongs-To</span>
                                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Query:</span><span className="text-amber-500">4/5</span></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Integrity:</span><span className="text-amber-500">2/5</span></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Flexibility:</span><span className="text-amber-500">5/5</span></div>
                                </div>
                            </button>
                            <button
                                onClick={() => setActivePolymorphic('exclusive')}
                                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activePolymorphic === 'exclusive' ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                            >
                                <span className={`text-sm font-black tracking-wide ${activePolymorphic === 'exclusive' ? 'text-indigo-700' : 'text-slate-500'}`}>Exclusive Foreign Keys</span>
                                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Query:</span><span className="text-amber-500">4/5</span></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Integrity:</span><span className="text-amber-500">5/5</span></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Flexibility:</span><span className="text-amber-500">3/5</span></div>
                                </div>
                            </button>
                            <button
                                onClick={() => setActivePolymorphic('reverse')}
                                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activePolymorphic === 'reverse' ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                            >
                                <span className={`text-sm font-black tracking-wide ${activePolymorphic === 'reverse' ? 'text-indigo-700' : 'text-slate-500'}`}>Reverse Polymorphic</span>
                                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Query:</span><span className="text-amber-500">5/5</span></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Integrity:</span><span className="text-amber-500">4/5</span></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Flexibility:</span><span className="text-amber-500">4/5</span></div>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {activePolymorphic === 'belongsTo' && (
                            <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-lg font-black text-slate-700 italic">Polymorphic Belongs-To (多型外部鍵) - ORM 預設的最愛</h5>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                                    <p className="text-sm text-slate-600 leading-relaxed"><b>情境：</b> 建立一張通用的 `ItemTags` 關聯表。如果需要的話，使用 `ItemType` 記錄目標表格名稱 (Word 還是 Image)，`ItemID` 記錄它的 ID。</p>
                                </div>
                                <div className="sample-table-container shadow-lg shadow-slate-100/50">
                                    <table className="sample-table">
                                        <thead>
                                            <tr><th>TagID (FK)</th><th className="text-rose-600 font-black bg-rose-50/50">ItemType (字串字面量)</th><th className="text-rose-600 font-black bg-rose-50/50">ItemID (弱約束數值)</th></tr>
                                        </thead>
                                        <tbody className="text-slate-700">
                                            <tr><td>1</td><td className="text-rose-700 font-bold italic">'Word'</td><td>303</td></tr>
                                            <tr><td>2</td><td className="text-rose-700 font-bold italic">'Word'</td><td>303</td></tr>
                                            <tr className="bg-slate-50"><td>1</td><td className="text-emerald-700 font-bold italic">'Image'</td><td>404</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium"><b>動態映射：</b> 表格結構不變，保有極高的擴充性，容易在應用程式端實作（如 Rails 的 Polymorphic Associations）。</p>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium"><b>潛在限制：</b> <code className="text-rose-500 font-bold">ItemID 無法在資料庫層級建立有效的 Foreign Key 約束</code>。如果來源實體被刪除，這裡可能會留下失去指向的「孤兒記錄 (Orphan Records)」。</p>
                            </div>
                        )}
                        {activePolymorphic === 'exclusive' && (
                            <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-lg font-black text-slate-700 italic">Exclusive Foreign Keys (互斥外部鍵) - DBA 的嚴謹堅持</h5>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                                    <p className="text-sm text-slate-600 leading-relaxed"><b>情境：</b> 還是只有一張通用的 `ItemTags` 關聯表，但為「每一個可能會被貼標籤的實體」，都預先開一個專屬的獨立 ID 欄位 (WordID, ImageID)，並設定可空性約束。</p>
                                </div>
                                <div className="sample-table-container shadow-lg shadow-slate-100/50">
                                    <table className="sample-table">
                                        <thead>
                                            <tr><th>TagID (FK)</th><th className="text-rose-600">WordID (具 FK 約束, 可 NULL)</th><th className="text-emerald-600">ImageID (具 FK 約束, 可 NULL)</th></tr>
                                        </thead>
                                        <tbody className="text-slate-700">
                                            <tr><td>1</td><td className="text-rose-700 font-bold">303</td><td className="text-slate-300 italic">NULL</td></tr>
                                            <tr><td>2</td><td className="text-rose-700 font-bold">303</td><td className="text-slate-300 italic">NULL</td></tr>
                                            <tr className="bg-slate-50"><td>1</td><td className="text-slate-300 italic">NULL</td><td className="text-emerald-700 font-bold">404</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium"><b>嚴謹約束：</b> 每個實體欄位都能建立真實的 Foreign Key，可透過資料庫的 `CHECK CONSTRAINT` 確保「單筆記錄只有一個 FK 有值」，維持關聯正確性。</p>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium"><b>架構負擔：</b> 未來若新增可關聯實體（如新增 Videos 表），就必須修改 Schema 增加 <code className="text-rose-500 font-bold">VideoID</code> 欄位，擴充流程繁瑣且容易產生過多 NULL 值。</p>
                            </div>
                        )}
                        {activePolymorphic === 'reverse' && (
                            <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-lg font-black text-slate-700 italic">Reverse Polymorphic (交叉中間表) - 高度正規化設計</h5>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                                    <p className="text-sm text-slate-600 leading-relaxed"><b>情境：</b> 放棄萬用關聯表！誰要貼標籤，就為誰開一張專屬的中介表。為 Words 建立 `WordTags` 表；為 Images 建立 `ImageTags` 表。</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                    <div className="sample-table-container shadow-lg shadow-rose-100/50">
                                        <div className="bg-rose-600 text-white px-4 py-1 font-black text-sm uppercase tracking-widest text-center italic">WordTags 表</div>
                                        <table className="sample-table">
                                            <thead>
                                                <tr><th className="text-rose-600">WordID (強 FK 約束)</th><th>TagID (強 FK 約束)</th></tr>
                                            </thead>
                                            <tbody className="text-slate-700 bg-white">
                                                <tr><td className="text-rose-700 font-bold">303</td><td>1</td></tr>
                                                <tr><td className="text-rose-700 font-bold">303</td><td>2</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="sample-table-container shadow-lg shadow-emerald-100/50">
                                        <div className="bg-emerald-600 text-white px-4 py-1 font-black text-sm uppercase tracking-widest text-center italic">ImageTags 表</div>
                                        <table className="sample-table">
                                            <thead>
                                                <tr><th className="text-emerald-600">ImageID (強 FK 約束)</th><th>TagID (強 FK 約束)</th></tr>
                                            </thead>
                                            <tbody className="text-slate-700 bg-white">
                                                <tr className="bg-slate-50"><td className="text-emerald-700 font-bold">404</td><td>1</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium"><b>高度解耦：</b> 符合正規化精神且保留穩固的 FK 約束。未來擴充實體時，只需新增專屬的關聯表（如 `VideoTags`），完全無需異動既有資料表。</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 4. Metadata & Attribute Patterns */}
                <section className="pt-12 border-t border-slate-100 space-y-8 pb-12">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-base">4</span>
                            <h4 className="text-xl font-bold text-slate-800">元數據與屬性擴充 Metadata & Attribute Patterns</h4>
                        </div>

                        {/* Metadata Scorecards Tabs */}
                        <div className="flex flex-wrap justify-center gap-3 w-full">
                            <button
                                onClick={() => setActiveMetadata('eav')}
                                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activeMetadata === 'eav' ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                            >
                                <span className={`text-sm font-black tracking-wide ${activeMetadata === 'eav' ? 'text-indigo-700' : 'text-slate-500'}`}>EAV (Entity-Attribute-Value)</span>
                                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Query:</span><span className="text-amber-500">2/5</span></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Integrity:</span><span className="text-amber-500">2/5</span></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Flexibility:</span><span className="text-amber-500">5/5</span></div>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveMetadata('json')}
                                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activeMetadata === 'json' ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                            >
                                <span className={`text-sm font-black tracking-wide ${activeMetadata === 'json' ? 'text-indigo-700' : 'text-slate-500'}`}>Hybrid JSON</span>
                                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Query:</span><span className="text-amber-500">4/5</span></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Integrity:</span><span className="text-amber-500">3/5</span></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Flexibility:</span><span className="text-amber-500">4/5</span></div>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveMetadata('overload')}
                                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activeMetadata === 'overload' ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                            >
                                <span className={`text-sm font-black tracking-wide ${activeMetadata === 'overload' ? 'text-indigo-700' : 'text-slate-500'}`}>Multi-Column Overload</span>
                                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Query:</span><span className="text-amber-500">5/5</span></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Integrity:</span><span className="text-amber-500">4/5</span></div>
                                    <div className="flex items-center gap-1"><span className="text-slate-400">Flexibility:</span><span className="text-amber-500">2/5</span></div>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {activeMetadata === 'eav' && (
                            <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-lg font-black text-slate-700 italic">EAV (Entity-Attribute-Value) - 無限擴充的屬性清單</h5>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                                    <p className="text-sm text-slate-600 leading-relaxed"><b>情境：</b> 也就是最上方「混合模型」裡的 `EntryAttributes` 表。不論未來增加什麼新屬性（例如：Author, Resolution），都不用修改 Schema，而是以「行(Row)」的形式無限寫入這張表。</p>
                                </div>
                                <div className="sample-table-container shadow-lg shadow-indigo-100/50">
                                    <div className="bg-indigo-600 text-white px-4 py-1 font-black text-sm uppercase tracking-widest text-center italic">EntryAttributes 表 (EAV 機制)</div>
                                    <table className="sample-table">
                                        <thead>
                                            <tr><th>AttrID (PK)</th><th className="text-rose-600">EntryID (FK)</th><th className="text-indigo-600">AttrName (屬性鍵)</th><th className="text-emerald-600">AttrValue (屬性值字串)</th></tr>
                                        </thead>
                                        <tbody className="text-slate-700">
                                            <tr><td>1001</td><td className="text-rose-700 font-bold">303</td><td className="text-indigo-700 font-bold italic">'Author'</td><td className="text-emerald-700">'John Doe'</td></tr>
                                            <tr><td>1002</td><td className="text-rose-700 font-bold">303</td><td className="text-indigo-700 font-bold italic">'PageCount'</td><td className="text-emerald-700">'15'</td></tr>
                                            <tr className="bg-slate-50"><td>1003</td><td className="text-rose-700 font-bold">404</td><td className="text-indigo-700 font-bold italic">'Resolution'</td><td className="text-emerald-700">'1920x1080'</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium"><b>屬性列化：</b> 高度靈活，適合屬性極端稀疏、未知或動態變化的業務需求（如電商商品規格）。</p>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium"><b>效能與型別限制：</b> 查詢實體的多個屬性時，需要進行昂貴的 <code className="text-rose-500 font-bold">多次自我 JOIN</code>，資料庫負擔大會有顯著的效能折損。此外，所有數值通常被轉存為字串，難以實施型別和範圍檢查。</p>
                            </div>
                        )}
                        {activeMetadata === 'json' && (
                            <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-lg font-black text-slate-700 italic">Hybrid JSON / Document Storage - 現代主流混合設計</h5>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                                    <p className="text-sm text-slate-600 leading-relaxed"><b>情境：</b> 如同第一大單元「混合模型」裡 `Entries` 表內的 `Attributes (JSONB)` 欄位。將變動性高的屬性結構化為 JSON 格式，直接存儲於單一欄位中。</p>
                                </div>
                                <div className="sample-table-container shadow-lg shadow-slate-100/50">
                                    <div className="bg-slate-800 text-white px-4 py-1 font-black text-sm uppercase tracking-widest text-center italic">Entries 表 (主表 / 含 JSONB)</div>
                                    <table className="sample-table">
                                        <thead>
                                            <tr><th className="text-blue-600">EntryID (PK)</th><th>Name</th><th className="text-blue-800 bg-blue-50/50">Attributes (JSONB 欄位)</th></tr>
                                        </thead>
                                        <tbody className="text-slate-700">
                                            <tr><td className="font-bold">303</td><td className="italic">需求規格書.docx</td><td className="font-mono text-xs text-blue-800 bg-blue-50/20">{"{ \"Author\": \"John\", \"Pages\": 15 }"}</td></tr>
                                            <tr className="bg-slate-50"><td className="font-bold">404</td><td className="italic font-black text-slate-700">架構圖.png</td><td className="font-mono text-xs text-blue-800 bg-blue-50/20">{"{ \"Resolution\": \"1920x1080\", \"Format\": \"PNG\" }"}</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium"><b>混合存儲：</b> 大幅簡化了查詢語法與複雜度（降低 JOIN 的依賴），一次讀取即可取得關聯屬性，兼顧關聯式資料庫的嚴謹性與 Document 結構的彈性。</p>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium"><b>使用場景：</b> 主流資料庫 (PostgreSQL, MySQL) 皆有良好支援。不過，若頻繁更新 JSON 內部的細微節點，或需常以 JSON 內容當作高頻 JOIN/WHERE 條件，仍會面臨資源消耗的議題。</p>
                            </div>
                        )}
                        {activeMetadata === 'overload' && (
                            <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-lg font-black text-slate-700 italic">Multi-Column Overload (溢出表格) - 傳統寬表妥協設計</h5>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                                    <p className="text-sm text-slate-600 leading-relaxed"><b>情境：</b> 避免變更主表結構，而是另外建立一張 `Entries_ExtraData` 副表，並預先定義了 `StringAttr1`, `StringAttr2`, `IntAttr1` 等多個泛用型預留欄位。</p>
                                </div>
                                <div className="sample-table-container shadow-lg shadow-amber-100/50">
                                    <div className="bg-amber-600 text-white px-4 py-1 font-black text-sm uppercase tracking-widest text-center italic">Entries_ExtraData 表 (預留欄位)</div>
                                    <table className="sample-table">
                                        <thead>
                                            <tr><th className="text-blue-600">EntryID</th><th className="text-amber-600">StringAttr1</th><th className="text-amber-600">StringAttr2</th><th className="text-emerald-600">IntAttr1</th><th className="text-emerald-600">IntAttr2</th></tr>
                                        </thead>
                                        <tbody className="text-slate-700">
                                            <tr><td className="text-blue-700 font-bold">303</td><td className="text-amber-700">"John" (當作 Author)</td><td className="text-slate-300 italic">NULL</td><td className="text-emerald-700">15 (當作 PageCount)</td><td className="text-slate-300 italic">NULL</td></tr>
                                            <tr className="bg-slate-50"><td className="text-blue-700 font-bold">404</td><td className="text-amber-700">"1920x1080"</td><td className="text-amber-700">"PNG"</td><td className="text-slate-300 italic">NULL</td><td className="text-slate-300 italic">NULL</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium"><b>分層寬表：</b> 讀取特定屬性時有不錯的掃描效能，並保留了基本的資料庫型別特質，也沒有額外的 JSON 解析負擔。</p>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium"><b>維護負擔：</b> 開發端必須額外維護一份 <code className="text-rose-500 font-bold">對應字典</code>，才能翻譯泛用欄位代表的商業邏輯。預留欄位耗盡時仍需變更 Schema。由於 JSON 類型普及，此作法已逐漸減少使用。</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ERTab;
