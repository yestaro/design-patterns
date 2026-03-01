import { Database, Eye, Layers, TableProperties } from 'lucide-react';
import React from 'react';

const ERTab: React.FC = () => {
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
                <section className="space-y-6">
                    <div className="flex items-center gap-3 text-slate-800">
                        <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-base">1</span>
                        <h4 className="text-xl font-bold">繼承映射 Inheritance Mapping</h4>
                    </div>

                    <div className="space-y-12">
                        {/* A. STI */}
                        <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                            <div className="flex items-center justify-between">
                                <h5 className="text-lg font-black text-slate-700 italic">A. STI (Single Table Inheritance) - 全量寬表映射</h5>
                                <div className="flex gap-2 text-xs font-bold">
                                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Query: ★★★★★</span>
                                    <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded">Maintenance: ★★☆☆☆</span>
                                </div>
                            </div>
                            <div className="overflow-x-auto border border-slate-300 rounded-2xl bg-white shadow-lg">
                                <table className="w-full text-sm font-mono text-left whitespace-nowrap">
                                    <thead className="bg-slate-50 border-b-2 border-slate-200 font-bold uppercase text-slate-500 text-xs">
                                        <tr>
                                            <th className="px-3 py-2 border-r bg-slate-100/50">EntryID</th>
                                            <th className="px-3 py-2 border-r text-indigo-700">Type</th>
                                            <th className="px-3 py-2 border-r text-slate-400 italic font-normal">ParentID</th>
                                            <th className="px-3 py-2 border-r">Name</th>
                                            <th className="px-3 py-2 border-r">Size</th>
                                            <th className="px-3 py-2 border-r bg-rose-50 text-rose-600 font-black">PageCount</th>
                                            <th className="px-3 py-2 border-r bg-emerald-50 text-emerald-600 font-black text-center">Resolution</th>
                                            <th className="px-3 py-2 border-r bg-amber-50 text-amber-700 font-black">Encoding</th>
                                            <th className="px-3 py-2 text-slate-400 font-normal">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                        <tr>
                                            <td className="px-3 py-2 border-r">101</td>
                                            <td className="px-3 py-2 border-r font-bold text-slate-500">Dir</td>
                                            <td className="px-3 py-2 border-r text-slate-300 italic">NULL</td>
                                            <td className="px-3 py-2 border-r">根目錄 (Root)</td>
                                            <td className="px-3 py-2 border-r">0</td>
                                            <td className="px-3 py-2 border-r text-slate-300 italic">NULL</td>
                                            <td className="px-3 py-2 border-r text-slate-300 italic">NULL</td>
                                            <td className="px-3 py-2 border-r text-slate-300 italic">NULL</td>
                                            <td className="px-3 py-2 text-slate-400 text-xs">2025-01-01</td>
                                        </tr>
                                        <tr>
                                            <td className="px-3 py-2 border-r">202</td>
                                            <td className="px-3 py-2 border-r font-bold text-slate-500">Dir</td>
                                            <td className="px-3 py-2 border-r text-slate-400 italic">101</td>
                                            <td className="px-3 py-2 border-r">專案文件 (Project_Docs)</td>
                                            <td className="px-3 py-2 border-r">0</td>
                                            <td className="px-3 py-2 border-r text-slate-300 italic">NULL</td>
                                            <td className="px-3 py-2 border-r text-slate-300 italic">NULL</td>
                                            <td className="px-3 py-2 border-r text-slate-300 italic">NULL</td>
                                            <td className="px-3 py-2 text-slate-400 text-xs">2025-01-10</td>
                                        </tr>
                                        <tr>
                                            <td className="px-3 py-2 border-r">303</td>
                                            <td className="px-3 py-2 border-r font-black text-indigo-600">Word</td>
                                            <td className="px-3 py-2 border-r text-slate-400 italic">202</td>
                                            <td className="px-3 py-2 border-r">需求規格書.docx</td>
                                            <td className="px-3 py-2 border-r">500</td>
                                            <td className="px-3 py-2 border-r bg-rose-50/30 font-black text-rose-700 text-center italic">15</td>
                                            <td className="px-3 py-2 border-r text-slate-300 italic">NULL</td>
                                            <td className="px-3 py-2 border-r text-slate-300 italic">NULL</td>
                                            <td className="px-3 py-2 text-slate-400 text-xs">2025-01-10</td>
                                        </tr>
                                        <tr>
                                            <td className="px-3 py-2 border-r">404</td>
                                            <td className="px-3 py-2 border-r font-black text-indigo-600">Image</td>
                                            <td className="px-3 py-2 border-r text-slate-400 italic">202</td>
                                            <td className="px-3 py-2 border-r">架構圖.png</td>
                                            <td className="px-3 py-2 border-r">2500</td>
                                            <td className="px-3 py-2 border-r text-slate-300 italic">NULL</td>
                                            <td className="px-3 py-2 border-r bg-emerald-50/30 font-black text-emerald-700 text-center">1920x1080</td>
                                            <td className="px-3 py-2 border-r text-slate-300 italic">NULL</td>
                                            <td className="px-3 py-2 text-slate-400 text-xs">2025-01-12</td>
                                        </tr>
                                        <tr>
                                            <td className="px-3 py-2 border-r">505</td>
                                            <td className="px-3 py-2 border-r font-black text-indigo-600">Text</td>
                                            <td className="px-3 py-2 border-r text-slate-400 italic">202</td>
                                            <td className="px-3 py-2 border-r">README.txt</td>
                                            <td className="px-3 py-2 border-r">10</td>
                                            <td className="px-3 py-2 border-r text-slate-300 italic">NULL</td>
                                            <td className="px-3 py-2 border-r text-slate-300 italic">NULL</td>
                                            <td className="px-3 py-2 border-r bg-amber-50/30 font-black text-amber-700 text-center italic">UTF-8</td>
                                            <td className="px-3 py-2 text-slate-400 text-xs">2025-01-15</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">**物理真相：** 所有子型別共用同一張大寬表。查詢極快但造成大量 `NULL` 浪費，且每增加一個物件類型就必須頻繁修改物理 Schema，維護成本最高。</p>
                        </div>

                        {/* B. CTI */}
                        <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                            <div className="flex items-center justify-between">
                                <h5 className="text-lg font-black text-slate-700 italic">B. CTI (Class Table Inheritance) - 階層式正規化</h5>
                                <div className="flex gap-2 text-xs font-bold">
                                    <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Query: ★★★☆☆</span>
                                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">Reliability: ★★★★★</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                <div className="space-y-2">
                                    <div className="bg-slate-800 text-white px-3 py-1 rounded-t-lg text-xs font-bold font-mono tracking-widest text-center uppercase">TABLE: Entries_Base</div>
                                    <div className="border border-slate-200 bg-white rounded-b-lg overflow-x-auto">
                                        <table className="w-full text-sm font-mono text-left">
                                            <thead className="bg-slate-50 border-b font-black text-xs uppercase text-slate-500">
                                                <tr><th className="px-2 py-1 border-r text-red-500">EntryID(PK)</th><th className="px-2 py-1 border-r">ParentID</th><th className="px-2 py-1 border-r">Name</th><th className="px-2 py-1 text-indigo-600">Type</th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 italic">
                                                <tr><td className="px-2 py-1 border-r font-bold text-red-500 underline">303</td><td className="px-2 py-1 border-r italic text-slate-400">202</td><td className="px-2 py-1 border-r font-bold">需求規格書.docx</td><td className="px-2 py-1 text-indigo-600 italic">Word</td></tr>
                                                <tr><td className="px-2 py-1 border-r font-bold text-red-500 underline">404</td><td className="px-2 py-1 border-r italic text-slate-400">202</td><td className="px-2 py-1 border-r font-bold">架構圖.png</td><td className="px-2 py-1 text-indigo-600 italic">Image</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="bg-white border-2 border-rose-200 rounded-lg overflow-hidden shadow-sm">
                                        <div className="bg-rose-600 text-white px-3 py-0.5 text-xs font-black uppercase tracking-widest text-center">TABLE: Word_Extensions</div>
                                        <table className="w-full text-sm font-mono text-left bg-white">
                                            <thead className="bg-rose-50 border-b text-rose-600 text-xs font-black uppercase"><tr><th className="px-2 py-1 border-r text-red-500">EntryID(FK)</th><th className="px-2 py-1">PageCount</th></tr></thead>
                                            <tbody><tr><td className="px-2 py-1 border-r text-red-500 font-bold">303</td><td className="px-2 py-1 font-black underline text-rose-700">15</td></tr></tbody>
                                        </table>
                                    </div>
                                    <div className="bg-white border-2 border-emerald-200 rounded-lg overflow-hidden shadow-sm">
                                        <div className="bg-emerald-600 text-white px-3 py-0.5 text-xs font-black uppercase tracking-widest text-center">TABLE: Image_Extensions</div>
                                        <table className="w-full text-sm font-mono text-left bg-white">
                                            <thead className="bg-emerald-50 border-b text-emerald-600 text-xs font-black uppercase"><tr><th className="px-2 py-1 border-r text-red-500">EntryID(FK)</th><th className="px-2 py-1">Resolution</th></tr></thead>
                                            <tbody><tr><td className="px-2 py-1 border-r text-red-500 font-bold">404</td><td className="px-2 py-1 font-black underline text-emerald-700">1920x1080</td></tr></tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">**結構化：** 分離共用與特有屬性。模型乾淨但每次強制 `JOIN`。</p>
                        </div>

                        {/* C. Concrete Table Inheritance */}
                        <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                            <div className="flex items-center justify-between">
                                <h5 className="text-lg font-black text-slate-700 italic">C. Concrete Table Inheritance - 實體表物化隔離</h5>
                                <div className="flex gap-2 text-xs font-bold text-center">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Query: ★★★★☆</span>
                                    <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Versatility: ★★☆☆☆</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                <div className="border border-indigo-200 rounded-xl overflow-hidden shadow-lg shadow-indigo-100/50">
                                    <div className="bg-indigo-600 text-white px-4 py-1 font-black text-xs uppercase tracking-widest text-center italic">Physical Table: Words_Only</div>
                                    <table className="w-full text-sm font-mono bg-white text-left">
                                        <thead className="bg-slate-50 border-b font-bold text-indigo-600 uppercase text-xs">
                                            <tr><th className="p-2 border-r">EntryID</th><th className="p-2 border-r italic text-xs">ParentID</th><th className="p-2 border-r">Name</th><th className="p-2 bg-rose-50 text-rose-600 font-black">PageCount</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            <tr><td className="p-2 border-r font-bold underline text-red-500">303</td><td className="p-2 border-r text-slate-400 italic">202</td><td className="p-2 border-r font-black italic">需求規格書.docx</td><td className="p-2 bg-rose-50/20 text-rose-700 font-black text-center italic underline">15</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="border border-emerald-200 rounded-xl overflow-hidden shadow-lg shadow-emerald-100/50">
                                    <div className="bg-emerald-600 text-white px-4 py-1 font-black text-xs uppercase tracking-widest text-center italic">
                                        Physical Table: Images_Only
                                    </div>
                                    <table className="w-full text-sm font-mono bg-white text-left text-xs font-mono bg-white text-left">
                                        <thead className="bg-slate-50 border-b font-bold text-emerald-600 uppercase text-xs">
                                            <tr><th className="p-2 border-r">EntryID</th><th className="p-2 border-r italic text-xs">ParentID</th><th className="p-2 border-r">Name</th><th className="p-2 bg-emerald-50 text-emerald-600 font-black text-center">Resolution</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 italic">
                                            <tr><td className="p-2 border-r font-bold underline text-red-500">404</td><td className="p-2 border-r text-slate-400">202</td><td className="p-2 border-r font-black italic">架構圖.png</td><td className="p-2 bg-emerald-50/20 text-emerald-700 font-black text-center underline">1920x1080</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">**物理隔離：** 零 JOIN 但維護困難。</p>
                        </div>
                    </div>
                </section>

                {/* 2. Hierarchy Patterns */}
                <section className="pt-12 border-t border-slate-100 space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-base">2</span>
                        <h4 className="text-xl font-bold text-slate-800">階層存儲模式 (Hierarchy Patterns)</h4>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* A. Adjacency List */}
                        <div className="space-y-4">
                            <h5 className="text-sm font-black uppercase text-slate-400 tracking-tighter italic">A. Adjacency List (鄰接表)</h5>
                            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm font-mono text-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b font-bold text-slate-500 uppercase text-xs">
                                        <tr><th className="px-2 py-2 border-r text-red-600">EntryID</th><th className="px-2 py-2 border-r">Name</th><th className="px-2 py-2 text-indigo-600 underline text-right italic font-black text-xs">ParentID</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 italic">
                                        <tr className="bg-slate-50 text-slate-600"><td className="px-2 py-1 border-r font-bold">101</td><td className="px-2 py-1 border-r font-bold">根目錄 (Root)</td><td className="px-2 py-1 text-right text-slate-400">NULL</td></tr>
                                        <tr><td className="px-2 py-1 border-r font-bold text-slate-600">202</td><td className="px-2 py-1 border-r text-blue-600 font-bold">專案文件</td><td className="px-2 py-1 text-right font-black text-indigo-600 underline">101</td></tr>
                                        <tr><td className="px-2 py-1 border-r font-bold text-red-600 underline">303</td><td className="px-2 py-1 border-r text-blue-800 font-black italic">需求規格書.docx</td><td className="px-2 py-1 text-right font-black text-indigo-600 underline">202</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-slate-500 italic">**簡單模型：** 僅存父節點。隨意搬移，但下鑽查詢效能極差。</p>
                        </div>

                        {/* B. Path Enumeration */}
                        <div className="space-y-4">
                            <h5 className="text-sm font-black uppercase text-slate-400 tracking-tighter italic">B. Path Enumeration (路徑枚舉)</h5>
                            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm font-mono text-sm">
                                <table className="w-full text-left italic">
                                    <thead className="bg-slate-50 border-b font-bold text-slate-500 uppercase text-xs">
                                        <tr><th className="px-2 py-2 border-r text-red-600">EntryID</th><th className="px-2 py-2 border-r">Name</th><th className="px-2 py-2 text-emerald-600 font-black">Materialized Path</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        <tr className="bg-slate-50 text-slate-600"><td className="px-2 py-1 border-r font-bold">101</td><td className="px-2 py-1 border-r font-bold">根目錄 (Root)</td><td className="px-2 py-1 font-bold">/101/</td></tr>
                                        <tr><td className="px-2 py-1 border-r font-bold text-slate-600">202</td><td className="px-2 py-1 border-r text-blue-600 font-bold">專案文件</td><td className="px-2 py-1 text-emerald-600 font-black italic">/101/202/</td></tr>
                                        <tr><td className="px-2 py-1 border-r font-bold text-red-600 underline">303</td><td className="px-2 py-1 border-r text-blue-800 font-black">需求規格書.docx</td><td className="px-2 py-1 text-emerald-600 font-black italic">/101/202/303/</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-slate-500 italic">**預計算路徑：** 透過 LIKE 查詢。子樹獲取極快。</p>
                        </div>

                        {/* C. Closure Table */}
                        <div className="space-y-4 font-mono">
                            <h5 className="text-sm font-black uppercase text-indigo-600 tracking-tighter italic">C. Closure Table (閉包表)</h5>
                            <div className="border border-indigo-200 rounded-lg overflow-hidden shadow-sm">
                                <div className="bg-indigo-600 text-white px-2 py-0.5 font-bold uppercase tracking-widest text-xs text-center italic">Relations (代際空間表)</div>
                                <table className="w-full text-left bg-white text-sm italic">
                                    <thead className="bg-indigo-50 border-b border-indigo-100 text-indigo-600 font-black uppercase text-xs">
                                        <tr><th className="px-1 py-1 border-r">Ancestor</th><th className="px-1 py-1 border-r">Descendant</th><th className="px-1 py-1 text-center">Depth</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-indigo-50">
                                        <tr><td className="px-1 border-r text-rose-500">101</td><td className="px-1 border-r font-black">101</td><td className="px-1 text-center font-bold">0</td></tr>
                                        <tr><td className="px-1 border-r text-rose-500 font-bold underline">101</td><td className="px-1 border-r text-indigo-600 font-black">303</td><td className="px-1 text-center font-bold">2</td></tr>
                                        <tr><td className="px-1 border-r text-rose-500 font-bold underline">202</td><td className="px-1 border-r text-indigo-600 font-black">303</td><td className="px-1 text-center font-bold">1</td></tr>
                                        <tr><td className="px-1 border-r text-rose-500">303</td><td className="px-1 border-r font-black">303</td><td className="px-1 text-center font-bold">0</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-slate-500 italic">**極致效能：** 儲存所有代際關係。最強大的層級搜尋。</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ERTab;
