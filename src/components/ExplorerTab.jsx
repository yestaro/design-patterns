import React, { useState, useEffect, useMemo } from 'react';
import {
    RotateCcw, RotateCw, LayoutList, SortAsc, SortDesc, Tag, Trash2,
    Folder, User, Calculator, FileJson, Search, X, Activity, Box, File, FileText, Image as ImageIcon
} from 'lucide-react';
import { TagCommand, DeleteCommand, SortCommand, CopyCommand, PasteCommand, commandInvokerInstance } from '../patterns/Command';
import { LabelSortStrategy, AttributeSortStrategy } from '../patterns/Strategy';
import { DirectoryComposite, FileLeaf, WordDocument, ImageFile, PlainText, EntryComponent } from '../patterns/Composite';
import { tagMediator } from '../patterns/Mediator';
import { NodeCountVisitor, SizeCalculatorVisitor, FileSearchVisitor, XmlExportVisitor } from '../patterns/Visitor';
import { ConsoleObserver, DashboardObserver } from '../patterns/Observer';
import { clipboardInstance } from '../patterns/Singleton';
// ... other imports ...

const RenderTree = ({ entry, selectedId, setSelectedId, setLiveStats, matchedIds, forceUpdate }) => {
    // ...
    const isSelected = selectedId === entry.id;
    const isMatched = matchedIds.includes(entry.id);

    // 使用 attributes 取得 UI 資訊
    const { iconType, ...otherAttrs } = entry.attributes;

    // 真正的泛用化：遍歷所有 attributes 屬性並自動顯示其值
    // 這樣未來在 Composite.js 新增任何屬性，這裡都不需要修改
    const infoString = Object.entries(otherAttrs)
        .map(([key, value]) => `, ${key}: ${value}`)
        .join('');

    // Map iconType string to component
    const iconMap = {
        'Folder': Folder,
        'FileText': FileText,
        'ImageIcon': ImageIcon,
        'File': File
    };
    let Icon = iconMap[iconType] || File;

    const labels = tagMediator.getLabels(entry.id);

    return (
        <div className="ml-4 text-left">
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(entry.id);
                    setLiveStats({ name: entry.name, count: 1, total: 1, type: entry.type });
                }}
                className={`flex items-center p-2 rounded-lg transition-all cursor-pointer ${isSelected ? 'bg-blue-600 text-white shadow-md' : isMatched ? 'bg-blue-50 ring-1 ring-blue-200 shadow-sm' : 'hover:bg-gray-100'}`}
            >
                <Icon className={`mr-2 h-4 w-4 ${entry instanceof DirectoryComposite ? (isSelected ? 'text-white' : 'text-yellow-500') : (isSelected ? 'text-white' : 'text-blue-500')}`} />
                <span className={`text-sm ${isSelected ? 'font-black' : isMatched ? 'font-bold text-blue-700' : 'font-medium text-slate-700'}`}>
                    {entry.name}
                    <span className="ml-1 text-[10px] opacity-60">
                        ({Number(entry.size)} KB{infoString})
                    </span>
                </span>
                <div className="ml-auto flex gap-1 items-center">
                    {labels.map(l => (
                        <button
                            key={l.name}
                            onClick={(e) => {
                                e.stopPropagation();
                                commandInvokerInstance.execute(new TagCommand(tagMediator, entry.id, l.name, forceUpdate, false));
                            }}
                            className={`px-1.5 py-0 rounded-[4px] text-[8px] font-black text-white uppercase leading-tight flex items-center gap-0.5 h-4 ${l.color} hover:opacity-80 transition-opacity cursor-pointer`}
                        >
                            {l.name}
                            <X size={10} className="opacity-70" />
                        </button>
                    ))}
                </div>
            </div>
            {entry instanceof DirectoryComposite && (
                <div className="border-l border-gray-200 ml-4 mt-1">
                    {entry.getChildren().map(child => (
                        <RenderTree
                            key={child.id}
                            entry={child}
                            selectedId={selectedId}
                            setSelectedId={setSelectedId}
                            setLiveStats={setLiveStats}
                            matchedIds={matchedIds}
                            forceUpdate={forceUpdate}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const ExplorerTab = () => {
    // ... (state hooks unchanged) ...
    const [visitorLogs, setVisitorLogs] = useState([]);
    const [liveStats, setLiveStats] = useState({ name: '-', count: 0, total: 0, type: '-' });
    const [results, setResults] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [matchedIds, setMatchedIds] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [updateTick, setUpdateTick] = useState(0);
    const [history, setHistory] = useState({ canUndo: false, canRedo: false });
    const [sortState, setSortState] = useState({ attr: 'none', dir: 'asc' });

    const compositeRoot = useMemo(() => {
        const root = new DirectoryComposite('root', '我的根目錄', '2025-01-01');
        const d1 = new DirectoryComposite('d1', '專案文件', '2025-01-10');

        // 使用具體的檔案類型
        d1.add(new WordDocument('f1', '需求規格書.docx', 500, '2025-01-10', 35));
        d1.add(new WordDocument('f_api', 'API介面定義.docx', 120, '2025-01-12', 12));
        d1.add(new ImageFile('f2', '系統架構圖.png', 2048, '2025-01-10', 1920, 1080));

        const d2 = new DirectoryComposite('d2', '個人筆記', '2025-01-15');
        d2.add(new PlainText('f3', '待辦清單.txt', 1, '2025-01-15', 'UTF-8'));

        const d2_1 = new DirectoryComposite('d2_1', '2025備份', '2025-01-20');
        d2_1.add(new WordDocument('f4', '會議記錄.docx', 200, '2025-01-20', 5));
        d2.add(d2_1);

        root.add(d1); root.add(d2);
        root.add(new PlainText('f5', 'README.txt', 0.5, '2025-01-01', 'ASCII'));
        return root;
    }, []);

    const forceUpdate = () => setUpdateTick(t => t + 1);

    useEffect(() => {
        // 訂閱剪貼簿變動 (用於更新 Console Log 與 UI 按鈕狀態)
        const clipboardObs = {
            update: (data) => {
                if (data.type === 'clipboard_set') {
                    setVisitorLogs(prev => [data.message, ...prev]);
                    forceUpdate(); // 更新 UI (啟用/禁用按鈕)
                }
            }
        };
        const cmdObs = {
            update: (data) => {
                setHistory({ canUndo: commandInvokerInstance.undoStack.length > 0, canRedo: commandInvokerInstance.redoStack.length > 0 });
                if (data.message) {
                    setVisitorLogs(prev => [data.message, ...prev]);
                }
                forceUpdate();
            }
        };

        commandInvokerInstance.notifier.subscribe(cmdObs);

        return () => {
            commandInvokerInstance.notifier.unsubscribe(cmdObs);
            clipboardInstance.notifier.unsubscribe(clipboardObs);
        };
    }, []);
    const handleUndo = () => {
        commandInvokerInstance.undo();
        // Log is handled by notifier
    };

    const handleRedo = () => {
        commandInvokerInstance.redo();
        // Log is handled by notifier
    };

    const handleSort = (attr) => {
        const nextDir = (sortState.attr === attr && sortState.dir === 'asc') ? 'desc' : 'asc';
        const getStrategy = (a, d) => (a === 'label' ? new LabelSortStrategy(tagMediator, d) : new AttributeSortStrategy(a, d));
        const oldStrategy = getStrategy(sortState.attr, sortState.dir);
        const newStrategy = getStrategy(attr, nextDir);
        const newState = { attr, dir: nextDir };
        commandInvokerInstance.execute(new SortCommand(compositeRoot, oldStrategy, newStrategy, forceUpdate, (st) => setSortState(st), sortState, newState));
        setSortState(newState);
        // Log is handled by notifier
    };

    const findNode = (root, id) => {
        if (root.id === id) return root;
        if (root instanceof DirectoryComposite) {
            for (let child of root.getChildren()) {
                const found = findNode(child, id);
                if (found) return found;
            }
        }
        return null;
    };

    const handleCopy = () => {
        if (!selectedId) return;
        commandInvokerInstance.execute(new CopyCommand(selectedId, compositeRoot, clipboardInstance, forceUpdate));
        // Log is handled by notifier
    };

    const handlePaste = () => {
        // 決定貼上的目的地：如果是目錄就貼進去，如果是檔案就貼到父目錄 (或是禁止)
        // 這裡策略：如果是目錄 -> 貼進去。如果是檔案 -> 貼到同一層 (需找父節點)

        let targetDir = null;
        const selectedNode = selectedId ? findNode(compositeRoot, selectedId) : compositeRoot;

        if (selectedNode instanceof DirectoryComposite) {
            targetDir = selectedNode;
        } else {
            // 找出父節點
            const parent = (function f(n, id) {
                if (n instanceof DirectoryComposite) {
                    if (n.getChildren().some(c => c.id === id)) return n;
                    for (let c of n.getChildren()) { let r = f(c, id); if (r) return r; }
                }
                return null;
            })(compositeRoot, selectedId);
            targetDir = parent || compositeRoot; // fallback to root
        }

        if (targetDir) {
            commandInvokerInstance.execute(new PasteCommand(targetDir, clipboardInstance, forceUpdate));
            setVisitorLogs(prev => [`[Prototype] 貼上物件至 ${targetDir.name}`, ...prev]);
        }
    };

    const runTask = async (visitorType, extra) => {
        setIsProcessing(true); setVisitorLogs([`啟動 ${visitorType}...`]); setResults(null); setMatchedIds([]);
        const countVisitor = new NodeCountVisitor();
        compositeRoot.accept(countVisitor);
        const totalNodes = countVisitor.total;

        let visitor;
        if (visitorType === 'SizeVisitor') visitor = new SizeCalculatorVisitor();
        if (visitorType === 'SearchVisitor') visitor = new FileSearchVisitor(extra);
        if (visitorType === 'XmlVisitor') visitor = new XmlExportVisitor();

        const logsBuffer = [], statsBuffer = [];
        const consoleObserver = new ConsoleObserver((msg) => logsBuffer.push(msg));
        const dashboardObserver = new DashboardObserver((stats) => statsBuffer.push(stats), totalNodes);

        visitor.notifier.subscribe(consoleObserver);
        visitor.notifier.subscribe(dashboardObserver);

        compositeRoot.accept(visitor);
        for (let i = 0; i < logsBuffer.length; i++) {
            setVisitorLogs(prev => [logsBuffer[i], ...prev]);
            setLiveStats(statsBuffer[i]);
            await new Promise(r => setTimeout(r, 60));
        }
        if (visitorType === 'SizeVisitor') setResults(`總大小：${visitor.totalSize} KB`);
        if (visitorType === 'SearchVisitor') { setResults(`找到 ${visitor.foundIds.length} 項`); setMatchedIds(visitor.foundIds); }
        if (visitorType === 'XmlVisitor') setResults(<pre className="text-left bg-slate-800 p-2 rounded text-amber-200 text-[10px] whitespace-pre-wrap break-all">{visitor.xml}</pre>);
        setIsProcessing(false);
    };

    const progressPercent = liveStats.total > 0 ? Math.round((liveStats.count / liveStats.total) * 100) : 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-in fade-in duration-500 text-left">
            <div className="lg:col-span-9 space-y-4 text-left">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 flex flex-wrap items-center gap-4 text-left">
                    <div className="flex items-center gap-1.5 border-r pr-3">
                        <button disabled={!history.canUndo} onClick={handleUndo} className={`p-1.5 rounded-lg transition-all ${history.canUndo ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 shadow-sm' : 'text-slate-200'}`}><RotateCcw size={20} /></button>
                        <button disabled={!history.canRedo} onClick={handleRedo} className={`p-1.5 rounded-lg transition-all ${history.canRedo ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 shadow-sm' : 'text-slate-200'}`}><RotateCw size={20} /></button>
                    </div>

                    {/* Actions Group: Copy / Paste / Delete */}
                    <div className="flex gap-1.5 border-r pr-3">
                        {/* Copy Button */}
                        <button
                            disabled={!selectedId}
                            onClick={handleCopy}
                            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${!selectedId ? 'text-slate-300' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                            title="複製 (Copy)"
                        >
                            <File size={14} /> 複製
                        </button>

                        {/* Paste Button */}
                        <button
                            disabled={!clipboardInstance.hasContent()}
                            onClick={handlePaste}
                            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${!clipboardInstance.hasContent() ? 'text-slate-300' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                            title="貼上 (Paste)"
                        >
                            <FileText size={14} /> 貼上
                        </button>

                        {/* Delete Button */}
                        <button
                            disabled={!selectedId || selectedId === 'root'}
                            onClick={() => {
                                const p = (function f(n, id) {
                                    if (n instanceof DirectoryComposite) {
                                        if (n.getChildren().some(c => c.id === id)) return n;
                                        for (let c of n.getChildren()) { let r = f(c, id); if (r) return r; }
                                    }
                                    return null;
                                })(compositeRoot, selectedId);
                                if (p) commandInvokerInstance.execute(new DeleteCommand(selectedId, p, forceUpdate));
                                setSelectedId(null);
                            }}
                            className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 text-xs font-bold ${(!selectedId || selectedId === 'root') ? 'opacity-30 text-slate-300' : 'text-red-500 hover:bg-red-50'}`}
                        >
                            <Trash2 size={14} /> 刪除
                        </button>
                    </div>
                    <div className="flex items-center gap-1.5 border-r pr-4 text-left">
                        <LayoutList size={18} className="text-slate-400 mr-1" />
                        {[{ id: 'name', l: '名稱' }, { id: 'size', l: '大小' }, { id: 'extension', l: '類型' }, { id: 'label', l: '標籤' }].map(s => {
                            const active = sortState.attr === s.id;
                            return (
                                <button key={s.id} onClick={() => handleSort(s.id)} className={`px-2.5 py-1 rounded-lg text-sm font-bold flex items-center gap-1 transition-all ${active ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                                    {s.l} {active && (sortState.dir === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                                </button>
                            )
                        })}
                    </div>
                    <div className="flex items-center gap-2 flex-nowrap flex-1 text-left">
                        <Tag size={16} className="text-slate-400" />
                        <div className="flex gap-4 text-left">
                            {['Urgent', 'Work', 'Personal'].map(lbl => {
                                const count = tagMediator.getFiles(lbl).length;
                                // 根據標籤名稱定義專屬顏色
                                const colorMap = {
                                    'Urgent': 'bg-red-50 hover:bg-red-100 text-red-600 border-red-100',
                                    'Work': 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-100',
                                    'Personal': 'bg-green-50 hover:bg-green-100 text-green-600 border-green-100'
                                };
                                const colorClass = colorMap[lbl] || 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-100';

                                return (
                                    <button
                                        key={lbl}
                                        disabled={!selectedId || selectedId === 'root'}
                                        onClick={() => { commandInvokerInstance.execute(new TagCommand(tagMediator, selectedId, lbl, forceUpdate)); }}
                                        className={`relative px-2 py-0.5 rounded text-[11px] font-bold border transition-all h-7 flex items-center ${(!selectedId || selectedId === 'root') ? 'opacity-30 border-slate-200 text-slate-400 cursor-not-allowed' : `${colorClass} shadow-sm`}`}
                                    >
                                        + {lbl}
                                        {count > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-red-500 text-white px-1 rounded-full text-[9px] min-w-[18px] h-[18px] flex items-center justify-center shadow-sm border border-white font-black animate-in zoom-in duration-300">
                                                {count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 text-left flex flex-col h-[500px]">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-left"><Folder className="text-yellow-500" size={18} /> 檔案階層 (Composite)</h3>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex-1 overflow-y-auto shadow-inner text-left custom-scrollbar text-left">
                            <RenderTree
                                entry={compositeRoot}
                                selectedId={selectedId}
                                setSelectedId={setSelectedId}
                                setLiveStats={setLiveStats}
                                matchedIds={matchedIds}
                                forceUpdate={forceUpdate}
                            />
                        </div>
                    </div>
                    <div className="md:col-span-1 space-y-4 flex flex-col h-[500px] text-left">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-4 text-left">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-left"><User className="text-blue-600" size={18} /> 訪問者操作 (Visitor)</h3>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => runTask('SizeVisitor')} className="py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-bold flex justify-between px-4 items-center transition-all text-left"><span>計算大小</span><Calculator size={18} /></button>
                                <button onClick={() => runTask('XmlVisitor')} className="py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-sm font-bold flex justify-between px-4 items-center transition-all text-left"><span>XML 匯出</span><FileJson size={18} /></button>
                            </div>
                            <div className="pt-1 text-left">
                                <div className="flex flex-row gap-1.5 flex-nowrap items-center text-left">
                                    <div className="relative flex-1 min-w-0 text-left">
                                        <input type="text" value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && searchKeyword) runTask('SearchVisitor', searchKeyword); }} className="w-full px-2.5 py-1.5 pr-7 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:ring-1 focus:ring-blue-400 truncate text-left" placeholder="輸入關鍵字..." />
                                        {(searchKeyword || matchedIds.length > 0) && <button onClick={() => { setSearchKeyword(''); setMatchedIds([]); }} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700"><X size={14} /></button>}
                                    </div>
                                    <button disabled={!searchKeyword} onClick={() => runTask('SearchVisitor', searchKeyword)} className="whitespace-nowrap px-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-bold text-sm py-1.5 transition-all flex items-center gap-1 text-left">搜尋 <Search size={16} /></button>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4 flex-1 flex flex-col justify-center space-y-4 text-left">
                            <h3 className="font-bold text-slate-800 flex items-center justify-between text-left"><div className="flex items-center gap-2 text-left"><Activity size={16} className="text-blue-500" /> 監控 (Observer)</div><span className="text-[10px] px-2 py-0.5 bg-blue-500 text-white rounded-full font-bold uppercase tracking-tighter text-left">Live</span></h3>
                            <div className="space-y-4">
                                <div className="bg-slate-50 p-3.5 rounded-xl border border-blue-50 flex flex-col text-left">
                                    <span className="text-xs text-slate-500 font-bold uppercase mb-1.5 text-left">目前節點</span>
                                    <span className="text-sm font-black text-blue-700 truncate text-left">{liveStats.name}</span>
                                </div>
                                <div className="bg-slate-50 p-3.5 rounded-xl border border-blue-50 flex flex-col text-left">
                                    <div className="flex justify-between items-center mb-2 text-left">
                                        <span className="text-xs text-slate-500 font-bold uppercase text-left">掃描進度</span>
                                        <span className="text-sm font-black text-blue-600 text-left">{progressPercent}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner text-left">
                                        <div className="h-full bg-blue-500 transition-all duration-300 ease-out relative overflow-hidden text-left" style={{ width: `${progressPercent}%` }}><div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]"></div></div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2 text-right font-bold tracking-tight text-left">{liveStats.count} / {liveStats.total} Nodes</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-3 bg-slate-900 rounded-2xl p-4 h-[572px] flex flex-col shadow-inner border border-slate-800 overflow-hidden text-left">
                <div className="text-blue-400 mb-3 border-b border-slate-800 pb-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-left"><div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse text-left"></div> Console</div>
                <div className="flex-1 overflow-y-auto space-y-1 pr-2 dark-scrollbar text-left">
                    {visitorLogs.map((log, i) => (
                        <div key={i} className={`py-1 text-[10px] lg:text-[11px] leading-relaxed border-b border-slate-800/40 flex gap-2 ${log.includes('[符合]') ? 'text-green-400 font-bold' : log.includes('[Undo]') ? 'text-yellow-400 font-bold' : log.includes('[Redo]') ? 'text-orange-400 font-bold' : log.includes('[Selection]') ? 'text-indigo-300 italic' : log.includes('[System]') ? 'text-blue-300 italic font-bold' : 'text-slate-300'}`}><span>{log}</span></div>
                    ))}
                    {results && <div className="mt-4 p-3 bg-blue-500/20 text-blue-200 rounded text-xs lg:text-sm font-bold border border-blue-500/30 text-left">{results}</div>}
                </div>
            </div>
        </div>
    );
};

export default ExplorerTab;
