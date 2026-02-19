import React from 'react';
import { Database, Layers, TableProperties, Eye, Search } from 'lucide-react';

const ERTab: React.FC = () => {
    return (
        <div className="text-left text-base animate-in fade-in duration-500">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 mb-8 text-left transition-all hover:shadow-md">
                <h2 className="text-xl font-black mb-6 flex items-center gap-2"><Database className="text-blue-600" /> 混合 ER 模型 (Hybrid Model: JSON + EAV)</h2>

                <div className="space-y-8 mt-6">
                    {/* Row 1: Entries & EntryAttributes */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        {/* Entries 主表 */}
                        <div>
                            <div className="bg-slate-800 text-white p-4 rounded-t-2xl font-mono text-base flex justify-between items-center shadow-lg text-left">
                                <span className="flex items-center gap-2 font-bold text-left"><Layers size={16} /> Entries (主表結構: Composite)</span>
                                <Database size={16} className="text-blue-400" />
                            </div>
                            <div className="border border-slate-200 rounded-b-2xl overflow-hidden shadow-md bg-white">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                                        <tr><th className="p-4 text-left">COLUMN</th><th className="p-4 text-left">ROLE</th></tr>
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
                            <div className="bg-indigo-900 text-white p-4 rounded-t-2xl font-mono text-base flex justify-between items-center shadow-lg text-indigo-100">
                                <span className="flex items-center gap-2 font-bold"><TableProperties size={16} /> EntryAttributes (細節表結構: SubClass)</span>
                                <Search size={16} className="text-indigo-300" />
                            </div>
                            <div className="border border-indigo-200 rounded-b-2xl overflow-hidden shadow-md bg-white">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-indigo-50 text-indigo-500 uppercase font-bold text-xs">
                                        <tr><th className="p-4 text-left">COLUMN</th><th className="p-4 text-left">ROLE</th></tr>
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        {/* EntryTags 關聯表 (Mediator) */}
                        <div>
                            <div className="bg-rose-900 text-white p-4 rounded-t-2xl font-mono text-base flex justify-between items-center shadow-lg text-rose-100">
                                <span className="flex items-center gap-2 font-bold"><TableProperties size={16} /> EntryTags (關聯表: Mediator)</span>
                                <Search size={16} className="text-rose-300" />
                            </div>
                            <div className="border border-rose-200 rounded-b-2xl overflow-hidden shadow-md bg-white">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-rose-50 text-rose-500 uppercase font-bold text-xs">
                                        <tr><th className="p-4 text-left">COLUMN</th><th className="p-4 text-left">ROLE</th></tr>
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
                            <div className="bg-emerald-800 text-white p-4 rounded-t-2xl font-mono text-base flex justify-between items-center shadow-lg text-emerald-100">
                                <span className="flex items-center gap-2 font-bold"><Layers size={16} /> Tags (標籤來源: Flyweight)</span>
                                <Database size={16} className="text-emerald-400" />
                            </div>
                            <div className="border border-emerald-200 rounded-b-2xl overflow-hidden shadow-md bg-white">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-emerald-50 text-emerald-500 uppercase font-bold text-xs">
                                        <tr><th className="p-4 text-left">COLUMN</th><th className="p-4 text-left">ROLE</th></tr>
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
                            <p className="text-sm font-bold text-slate-600 flex items-center gap-2"><TableProperties size={14} /> 4. EntryTags (Mediator) 實例</p>
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
                            <p className="text-sm font-bold text-slate-600 flex items-center gap-2"><Layers size={14} /> 3. Tags (Flyweight) 實例</p>
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

            <div className="p-6 bg-slate-900 rounded-2xl text-white text-base shadow-xl border border-slate-700 text-left transition-all hover:shadow-2xl hover:scale-[1.005]">
                <h4 className="text-blue-400 font-bold mb-4 flex items-center gap-2 italic tracking-wider">混合架構 (Hybrid) 教學引導</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 leading-relaxed text-left">
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <p className="font-bold text-amber-400 mb-2">● 為何要重複存屬性？</p>
                        <p className="text-sm opacity-80">**Entries 表的 JSON** 用於「前端呈現」。只需一次查詢主表即可得到快照，大幅減少資料庫查詢次數。</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <p className="font-bold text-amber-400 mb-2">● 細節表 (EAV) 用在哪？</p>
                        <p className="text-sm opacity-80">用於「搜尋與分析」。SQL 透過細節表過濾速度遠快於解析 JSON，且能建立高效索引。</p>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default ERTab;
