import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    RotateCcw, RotateCw, LayoutList, SortAsc, SortDesc, Tag, Trash2,
    Folder, File, FileText, User, Calculator, FileJson, Search, X, Activity, Copy, ClipboardPaste, Image as ImageIcon,
    Calendar,
    Play,
    Command,
    Zap,
    Workflow
} from 'lucide-react';
import { DirectoryComposite, EntryComponent, WordDocument, ImageFile, PlainText } from '../patterns/Composite';
import { Clipboard } from '../patterns/Singleton';
import { commandInvokerInstance, SortState } from '../patterns/Command';
import { FileSystemFacade } from '../patterns/Facade';
import { ConsoleObserver, IObserver, LogEntry, NotificationEvent } from '../patterns/Observer';
import { DashboardObserver, DashboardAdapter } from '../patterns/Adapter';
import { HighlightDecorator, IconDecorator, BoldDecorator } from '../patterns/Decorator';
import RoadmapDialog from './RoadmapDialog';

interface RenderTreeProps {
    entry: EntryComponent;
    facade: FileSystemFacade;
    selectedId: string | null;
    setSelectedId: (id: string | null) => void;
    setLiveStats: (stats: DashboardAdapter) => void;
    matchedIds: string[];
    forceUpdate: () => void;
}

const RenderTree: React.FC<RenderTreeProps> = ({ entry, facade, selectedId, setSelectedId, setLiveStats, matchedIds, forceUpdate }) => {
    const isSelected = selectedId === entry.id;
    const isMatched = matchedIds.includes(entry.id);

    const otherAttrs = entry.attributes;

    const attrString = Object.entries(otherAttrs)
        .map(([key, value]) => `, ${key}: ${value}`)
        .join('');

    const infoString = entry instanceof DirectoryComposite
        ? attrString
        : `(${entry.size} KB${attrString})`;

    const iconMap: Record<string, any> = {
        'Directory': Folder,
        'Word': FileText,
        'Image': ImageIcon,
        'Text': File
    };
    const Icon = iconMap[entry.type] || File;

    const labels = facade.getLabels(entry.id);

    return (
        <div className="ml-4 text-left">
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(entry.id);
                    setLiveStats({ name: entry.name, count: 1, total: 1, type: entry.type } as DashboardAdapter);
                }}
                className={`flex items-center py-2 pr-2 pl-2 border-l-2 transition-all cursor-pointer ${isSelected ? 'bg-blue-50 border-blue-500 shadow-sm' : 'border-transparent'} ${isMatched ? 'bg-amber-50 ring-1 ring-amber-200 shadow-sm' : 'hover:bg-gray-100'}`}
            >
                <Icon className={`mr-2 h-4 w-4 ${entry instanceof DirectoryComposite ? 'text-yellow-500' : 'text-blue-500'}`} />
                <span className={`text-sm ${isMatched ? 'font-bold text-amber-700' : 'font-medium text-slate-700'}`}>
                    {entry.name}
                    <span className="ml-1 text-[10px] opacity-60">
                        {infoString}
                    </span>
                </span>
                <div className="ml-auto flex gap-1 items-center">
                    {labels.map(l => (
                        <button
                            key={l.name}
                            onClick={(e) => {
                                e.stopPropagation();
                                facade.removeTag(entry.id, l.name);
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
                            facade={facade}
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

const ExplorerTab: React.FC = () => {
    const [visitorLogs, setVisitorLogs] = useState<LogEntry[]>([]);
    const [liveStats, setLiveStats] = useState<DashboardAdapter>({ name: '-', count: 0, total: 0, type: '-' } as DashboardAdapter);
    const [results, setResults] = useState<React.ReactNode | null>(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [matchedIds, setMatchedIds] = useState<string[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [, setUpdateTick] = useState(0);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [showRoadmap, setShowRoadmap] = useState(true);

    // Console Auto-scroll - Adjusted to scroll only the container, not the window
    const consoleContainerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (consoleContainerRef.current) {
            consoleContainerRef.current.scrollTop = consoleContainerRef.current.scrollHeight;
        }
    }, [visitorLogs, results]);

    const [history, setHistory] = useState({ canUndo: false, canRedo: false });
    const [sortState, setSortState] = useState<SortState>({ attr: 'none', dir: 'asc' });

    const forceUpdate = () => setUpdateTick(t => t + 1);

    const compositeRoot = useMemo(() => {
        const root = new DirectoryComposite('root', '我的根目錄', '2025-01-01');
        const d1 = new DirectoryComposite('d1', '專案文件', '2025-01-10');

        d1.add(new WordDocument('f1', '產品開發規畫.docx', 500, '2025-01-10', 35));
        d1.add(new WordDocument('f_api', 'API介面定義書.docx', 120, '2025-01-12', 12));
        d1.add(new ImageFile('f2', '架構設計圖.png', 2048, '2025-01-10', 1920, 1080));

        const d2 = new DirectoryComposite('d2', '個人備份', '2025-01-15');
        d2.add(new PlainText('f3', '密碼記事.txt', 1, '2025-01-15', 'UTF-8'));

        const d2_1 = new DirectoryComposite('d2_1', '2025旅遊', '2025-01-20');
        d2_1.add(new WordDocument('f4', '行程規劃.docx', 200, '2025-01-20', 5));
        d2.add(d2_1);

        root.add(d1);
        root.add(d2);
        root.add(new PlainText('f5', 'README.txt', 0.5, '2025-01-01', 'ASCII'));

        return root;
    }, []);

    const facade = useMemo(() => new FileSystemFacade(compositeRoot), [compositeRoot]);

    const highlightLoggerRef = useRef<IObserver | null>(null);
    if (!highlightLoggerRef.current) {
        let logger: IObserver = new ConsoleObserver((logEntry) => setVisitorLogs(prev => [...prev, logEntry]));

        logger = new BoldDecorator(logger, ['[符合]', '[Undo]', '[Redo]', '[System]', '[Clipboard]', '[Command]', '[Error]']);

        logger = new HighlightDecorator(logger, '[符合]', 'text-emerald-600');
        logger = new HighlightDecorator(logger, '[Undo]', 'text-amber-600');
        logger = new HighlightDecorator(logger, '[Redo]', 'text-orange-600');
        logger = new HighlightDecorator(logger, '[Selection]', 'text-indigo-600');
        logger = new HighlightDecorator(logger, '[System]', 'text-blue-600');
        logger = new HighlightDecorator(logger, '[Clipboard]', 'text-purple-600');
        logger = new HighlightDecorator(logger, '[Command]', 'text-cyan-700');
        logger = new HighlightDecorator(logger, '刪除', 'text-red-600');

        logger = new IconDecorator(logger, '[Command]', '⌘');
        logger = new IconDecorator(logger, '[符合]', '🔍');
        logger = new IconDecorator(logger, '[Undo]', '↩️');
        logger = new IconDecorator(logger, '[Redo]', '↪️');
        logger = new IconDecorator(logger, '刪除', '⛔');
        logger = new IconDecorator(logger, '貼上標籤', '🏷️');
        logger = new IconDecorator(logger, '移除標籤', '🧹');
        logger = new IconDecorator(logger, '[Clipboard]', '📋');
        logger = new IconDecorator(logger, '[Error]', '❌');

        highlightLoggerRef.current = logger;
    }

    useEffect(() => {
        const clipboardObs: IObserver = {
            update: (event: NotificationEvent) => {
                if (event.source === 'clipboard' && event.type === 'set') {
                    highlightLoggerRef.current?.update(event);
                    forceUpdate();
                }
            }
        };
        const cmdObs: IObserver = {
            update: (event: NotificationEvent) => {
                setHistory({
                    canUndo: commandInvokerInstance.undoStack.length > 0,
                    canRedo: commandInvokerInstance.redoStack.length > 0
                });
                if (event.message) {
                    highlightLoggerRef.current?.update(event);
                }
                if (event.data?.sortState) {
                    setSortState(event.data.sortState);
                }
                forceUpdate();
            }
        };

        commandInvokerInstance.notifier.subscribe(cmdObs);
        const clipboard = Clipboard.getInstance();
        clipboard.notifier.subscribe(clipboardObs);


        return () => {
            commandInvokerInstance.notifier.unsubscribe(cmdObs);
            clipboard.notifier.unsubscribe(clipboardObs);
        };
    }, []);

    const handleSort = (attr: string) => {
        facade.sortItems(attr, sortState);
    };

    const handleAnalysis = async (analysisAction: (obs: IObserver[]) => Promise<void>) => {
        setIsProcessing(true);
        setVisitorLogs([]);
        setResults(null);
        setMatchedIds([]);

        try {
            const totalNodes = facade.totalItems();
            const dashboardObserver = new DashboardObserver((stats) => setLiveStats(stats), totalNodes);
            const observers: IObserver[] = [highlightLoggerRef.current!, dashboardObserver];

            await analysisAction(observers);

        } catch (error: any) {
            console.error(error);
            setVisitorLogs(prev => [...prev, { message: `[Error] ${error.message}`, highlight: 'text-red-400 font-bold', icon: '', bold: false }]);
        } finally {
            setIsProcessing(false);
        }
    };

    const progressPercent = liveStats.total > 0 ? Math.round((liveStats.count / liveStats.total) * 100) : 0;

    return (
        <div className="flex flex-col gap-0 animate-in fade-in duration-500 text-left max-w-[1440px] mx-auto bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            {/* 頂部整合工具列 */}
            <div className="bg-white border-b border-slate-200 px-4 py-2 flex flex-wrap items-center gap-4 gap-y-2 text-left z-10">
                <div className="flex items-center gap-2 border-r border-slate-200 pr-4 self-stretch shrink-0" title="所有操作皆封裝為物件 (Command Pattern)">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-left">
                        <Command size={18} className="text-purple-500" /> Command
                    </h3>
                </div>
                <div className="flex items-center gap-1.5 border-r border-slate-200 pr-3 self-stretch shrink-0">
                    <button disabled={!history.canUndo} onClick={() => facade.undo()} className={`h-8 w-8 rounded-lg transition-all flex items-center justify-center ${history.canUndo ? 'bg-slate-50 text-slate-600 hover:bg-blue-100' : 'text-slate-200'}`}><RotateCcw size={18} /></button>
                    <button disabled={!history.canRedo} onClick={() => facade.redo()} className={`h-8 w-8 rounded-lg transition-all flex items-center justify-center ${history.canRedo ? 'bg-slate-50 text-slate-600 hover:bg-blue-100' : 'text-slate-200'}`}><RotateCw size={18} /></button>
                </div>
                <div className="flex items-center gap-1.5 border-r border-slate-200 pr-3 self-stretch shrink-0">
                    <button
                        disabled={!selectedId}
                        onClick={() => { if (selectedId) facade.copyItem(selectedId); }}
                        className={`px-2.5 py-0 h-8 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${!selectedId ? 'text-slate-300' : 'bg-slate-50 text-slate-700 hover:bg-blue-100'}`}
                        title="複製 (Copy)"
                    >
                        <Copy size={14} /> 複製
                    </button>

                    <button
                        disabled={!facade.getClipboardStatus()}
                        onClick={() => facade.pasteItem(selectedId)}
                        className={`px-2.5 py-0 h-8 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${!facade.getClipboardStatus() ? 'text-slate-300' : 'bg-slate-50 text-slate-700 hover:bg-blue-100'}`}
                        title="貼上 (Paste)"
                    >
                        <ClipboardPaste size={14} /> 貼上
                    </button>

                    <button
                        disabled={!selectedId || selectedId === 'root'}
                        onClick={() => {
                            if (selectedId) facade.deleteItem(selectedId);
                            setSelectedId(null);
                        }}
                        className={`px-2.5 py-0 h-8 rounded-lg transition-all flex items-center gap-1 text-xs font-bold ${(!selectedId || selectedId === 'root') ? 'opacity-30 text-slate-300' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                    >
                        <Trash2 size={14} /> 刪除
                    </button>
                </div>
                <div className="flex items-center gap-1.5 border-r border-slate-200 pr-3 text-left self-stretch shrink-0">
                    <LayoutList size={16} className="text-slate-400 mr-1" />
                    {[{ id: 'name', l: '名稱' }, { id: 'size', l: '大小' }, { id: 'extension', l: '類型' }, { id: 'label', l: '標籤' }].map(s => {
                        const active = sortState.attr === s.id;
                        return (
                            <button key={s.id} onClick={() => handleSort(s.id)} className={`px-2.5 py-0 h-8 rounded-lg text-sm font-bold flex items-center gap-1 transition-all whitespace-nowrap ${active ? 'bg-blue-100 text-blue-800' : 'bg-slate-50 text-slate-700 hover:bg-blue-100'}`}>
                                {s.l} {active && (sortState.dir === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                            </button>
                        )
                    })}
                </div>
                <div className="flex items-center gap-1.5 self-stretch shrink-0">
                    <Tag size={16} className="text-slate-400" />
                    <div className="flex gap-1.5 text-left">
                        {['Urgent', 'Work', 'Personal'].map(lbl => {
                            const count = facade.mediator.getFiles(lbl).length;
                            const colorMap: Record<string, string> = {
                                'Urgent': 'bg-red-50 hover:bg-red-100 text-red-600 border-red-100',
                                'Work': 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-100',
                                'Personal': 'bg-green-50 hover:bg-green-100 text-green-600 border-green-100'
                            };
                            const colorClass = colorMap[lbl] || 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-100';

                            return (
                                <button
                                    key={lbl}
                                    disabled={!selectedId || selectedId === 'root'}
                                    onClick={() => facade.tagItem(selectedId!, lbl)}
                                    className={`relative px-2.5 py-0 h-8 rounded-lg text-xs font-bold border transition-all flex items-center ${(!selectedId || selectedId === 'root') ? 'opacity-30 border-slate-200 text-slate-400 cursor-not-allowed' : `${colorClass} shadow-sm`}`}
                                >
                                    {lbl}
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
                <div className="ml-auto shrink-0">
                    <button
                        onClick={() => setIsHelpOpen(true)}
                        className="group flex items-center justify-center gap-3 px-4 py-1.5 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 font-black text-sm active:scale-95 shadow-md text-center"
                    >
                        <Calendar size={18} className="group-hover:rotate-12 transition-transform" />
                        <span className="text-base tracking-wide">課程綱要 - Readme in a Week</span>
                    </button>
                </div>
            </div>

            {/* 主工作區佈局 */}
            <div className="flex flex-col md:flex-row md:h-[520px] md:overflow-hidden h-auto">
                {/* 1. 側邊欄：檔案階層 (w-[440px]) */}
                <div className="w-full md:w-[440px] bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0 p-4 text-left h-[400px] md:h-auto overflow-hidden">
                    <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2 text-left" title="使用 Composite 模式建構檔案與目錄的樹狀結構 (Composite Pattern)"><Workflow className="text-amber-500" size={18} />Composite</h3>
                    <div className="flex-1 overflow-y-auto custom-scrollbar text-left">
                        <RenderTree
                            entry={compositeRoot}
                            facade={facade}
                            selectedId={selectedId}
                            setSelectedId={setSelectedId}
                            setLiveStats={setLiveStats}
                            matchedIds={matchedIds}
                            forceUpdate={forceUpdate}
                        />
                    </div>
                </div>

                {/* 2. 右側容器：操作、監控與 Console */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 flex flex-col md:flex-row min-h-0 border-b border-slate-200 bg-white">
                        {/* Visitor 操作 */}
                        <div className="flex-1 p-4 flex flex-col justify-start space-y-4 border-r border-slate-100 overflow-y-auto custom-scrollbar">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-left" title="使用 Visitor 模式在不修改結構的情況下增加新功能 (Visitor Pattern)"><Zap className="text-emerald-600" size={18} />Visitor</h3>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => handleAnalysis(async (obs) => {
                                        const size = await facade.calculateSize(obs);
                                        setResults(`總大小：${size} KB`);
                                    })}
                                    className="py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-bold flex justify-between px-4 items-center transition-all text-left"
                                >
                                    <span>計算大小</span><Calculator size={18} />
                                </button>
                                <button
                                    onClick={() => handleAnalysis(async (obs) => {
                                        const xml = await facade.exportXml(obs);
                                        setResults(<pre className="text-left bg-slate-800 p-2 rounded text-amber-200 text-[10px] whitespace-pre-wrap break-all">{xml}</pre>);
                                    })}
                                    className="py-2.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-sm font-bold flex justify-between px-4 items-center transition-all text-left"
                                >
                                    <span>匯出 XML</span><FileJson size={18} />
                                </button>
                            </div>
                            <div className="pt-1 text-left">
                                <div className="flex flex-row gap-1.5 flex-nowrap items-center text-left">
                                    <div className="relative flex-1 min-w-0 text-left">
                                        <input
                                            type="text"
                                            value={searchKeyword}
                                            onChange={e => setSearchKeyword(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && searchKeyword) {
                                                    handleAnalysis(async (obs) => {
                                                        const ids = await facade.searchFiles(searchKeyword, obs);
                                                        setMatchedIds(ids);
                                                        setResults(`找到 ${ids.length} 項`);
                                                    });
                                                }
                                            }}
                                            className="w-full px-2.5 py-1.5 pr-7 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:ring-1 focus:ring-blue-400 truncate text-left"
                                            placeholder="輸入關鍵字..."
                                        />
                                        {(searchKeyword || matchedIds.length > 0) && <button onClick={() => { setSearchKeyword(''); setMatchedIds([]); }} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700"><X size={14} /></button>}
                                    </div>
                                    <button
                                        disabled={!searchKeyword}
                                        onClick={() => handleAnalysis(async (obs) => {
                                            const ids = await facade.searchFiles(searchKeyword, obs);
                                            setMatchedIds(ids);
                                            setResults(`找到 ${ids.length} 項`);
                                        })}
                                        className="whitespace-nowrap px-4 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl font-bold text-sm py-1.5 transition-all flex items-center gap-1 text-left"
                                    >
                                        搜尋 <Search size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Observer 監控 */}
                        <div className="w-full md:w-80 p-4 flex flex-col justify-start space-y-4 bg-white overflow-y-auto custom-scrollbar">
                            <h3 className="font-bold text-slate-800 flex items-center justify-between text-left" title="使用 Observer 模式即時更新監控數據 (Observer Pattern)"><div className="flex items-center gap-2 text-left"><Activity size={16} className="text-pink-500" />Observer</div><span className="text-[10px] px-2 py-0.5 bg-pink-500 text-white rounded-full font-bold uppercase tracking-tighter text-left">Live</span></h3>
                            <div className="space-y-4">
                                <div className="bg-slate-50 p-3.5 rounded-xl border border-blue-50 flex flex-col text-left">
                                    <span className="text-sm text-slate-400 font-bold uppercase mb-1.5 text-left">目前節點</span>
                                    <span className="text-sm font-black text-blue-700 truncate text-left">{liveStats.name}</span>
                                </div>
                                <div className="bg-slate-50 p-3.5 rounded-xl border border-blue-50 flex flex-col text-left">
                                    <div className="flex justify-between items-center mb-2 text-left">
                                        <span className="text-sm text-slate-400 font-bold uppercase text-left">掃描進度</span>
                                        <span className="text-sm font-black text-blue-600 text-left">{progressPercent}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner text-left">
                                        <div className="h-full bg-blue-500 transition-all duration-300 ease-out relative overflow-hidden text-left" style={{ width: `${progressPercent}%` }}>
                                            <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]"></div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2 text-right font-bold tracking-tight text-left">{liveStats.count} / {liveStats.total} Nodes</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 底部 Console */}
                    <div className="h-[248px] bg-slate-50/80 px-5 pt-3 pb-5 flex flex-col overflow-hidden">
                        <div className="text-blue-600/70 mb-2 text-xs font-bold uppercase tracking-widest flex items-center relative min-h-[20px]">
                            {/* Left: macOS Dots */}
                            <div className="flex gap-1.5 px-1 absolute left-0">
                                <button
                                    onClick={() => { setVisitorLogs([]); setResults(null); }}
                                    className={`w-2.5 h-2.5 rounded-full bg-[#ff5f57] shadow-inner transition-all hover:brightness-110 active:scale-90 cursor-pointer ${isProcessing ? 'animate-[pulse_0.6s_infinite]' : ''}`}
                                    title="清除控制台"
                                />
                                <div className={`w-2.5 h-2.5 rounded-full bg-[#febc2e] shadow-inner ${isProcessing ? 'animate-[pulse_0.6s_infinite] [animation-delay:0.1s]' : ''}`}></div>
                                <div className={`w-2.5 h-2.5 rounded-full bg-[#28c840] shadow-inner ${isProcessing ? 'animate-[pulse_0.6s_infinite] [animation-delay:0.2s]' : ''}`}></div>
                            </div>

                            {/* Middle: Centered Title */}
                            <div className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
                                Console Output
                            </div>

                            {/* Right: Version */}
                            <div className="absolute right-0 opacity-50 font-mono text-sm tracking-tight">
                                v3000
                            </div>
                        </div>
                        <div
                            ref={consoleContainerRef}
                            className="flex-1 overflow-y-auto space-y-0.5 pr-2 custom-scrollbar text-left text-sm font-mono leading-tight bg-slate-900/[0.03] rounded-xl p-4 border border-slate-200/60"
                        >
                            {visitorLogs.length === 0 && !results && (
                                <div className="space-y-3 py-2 text-slate-500">
                                    <p className="text-amber-600 font-bold text-base tracking-wide">
                                        {'>'} Stay a while and listen..._
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 text-sm">
                                        <div className="space-y-1">
                                            <p className="text-blue-600 font-bold">📂 檔案總管</p>
                                            <p className="pl-4">• 選取後可複製 / 貼上 / 刪除</p>
                                            <p className="pl-4">• 工具列可依名稱 / 大小 / 類型排序</p>
                                            <p className="pl-4">• 點擊標籤，為選取的檔案加上標籤</p>
                                            <p className="pl-4">• 支援 Undo / Redo 操作還原</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-emerald-600 font-bold">⚡ 操作與觀察</p>
                                            <p className="pl-4">• 計算大小 / 匯出 XML / 搜尋</p>
                                            <p className="pl-4">• 操作進度與結果會即時顯示</p>
                                            <p className="pl-4">• 試試任意操作，Console 將記錄每一步</p>
                                            <p className="text-amber-600/80 text-sm pt-2 font-medium">💡 如果是你，會如何實作這些功能？</p>
                                        </div>
                                    </div>

                                </div>
                            )}
                            {visitorLogs.map((log, i) => (
                                <div key={i} className="py-0.5 leading-snug text-slate-600">
                                    <span dangerouslySetInnerHTML={{ __html: log.message.replace(/text-blue-300/g, 'text-blue-600').replace(/text-emerald-400/g, 'text-emerald-600') }} />
                                </div>
                            ))}
                            {results && <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded text-sm font-bold border border-blue-100 text-left">{results}</div>}
                        </div>
                    </div>
                </div>
            </div>

            <RoadmapDialog isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        </div>
    );
};

export default ExplorerTab;
