import {
    Calculator,
    Calendar,
    File,
    FileJson,
    FileText,
    Folder,
    Github,
    Image as ImageIcon,
    Search,
    SortAsc,
    SortDesc,
    X,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { patterns } from "../data/patterns";
import { DashboardAdapter } from "../patterns/Adapter";
import { commandInvokerInstance, SortState } from "../patterns/Command";
import {
    DirectoryComposite,
    EntryComponent,
} from "../patterns/Composite";
import {
    BoldDecorator,
    HighlightDecorator,
    IconDecorator,
} from "../patterns/Decorator";
import { FileSystemFacade } from "../patterns/Facade";
import {
    ConsoleObserver,
    IObserver,
    LogEntry,
    NotificationEvent,
} from "../patterns/Observer";
import { Clipboard } from "../patterns/Singleton";
import PatternMermaidDialog from "./shared/PatternMermaidDialog";
import RoadmapDialog from "./shared/RoadmapDialog";

export const PatternIconButton = ({
    id,
    onClick,
    className = "",
}: {
    id: string;
    onClick: () => void;
    className?: string;
}) => {
    const p = patterns.find((x) => x.id === id);
    if (!p) return null;
    const Icon = p.icon;
    const themeMaps: Record<string, string> = {
        amber: "bg-amber-50 text-amber-500 border-amber-100/50",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100/50",
        indigo: "bg-indigo-50 text-indigo-500 border-indigo-100/50",
        pink: "bg-pink-50 text-pink-500 border-pink-100/50",
        cyan: "bg-cyan-50 text-cyan-500 border-cyan-100/50",
        orange: "bg-orange-50 text-orange-500 border-orange-100/50",
        red: "bg-red-50 text-red-500 border-red-100/50",
        purple: "bg-purple-50 text-purple-500 border-purple-100/50",
        lime: "bg-lime-50 text-lime-600 border-lime-100/50",
        sky: "bg-sky-50 text-sky-500 border-sky-100/50",
        fuchsia: "bg-fuchsia-50 text-fuchsia-500 border-fuchsia-100/50",
        blue: "bg-blue-50 text-blue-500 border-blue-100/50",
    };
    const c = themeMaps[p.themeColor] || "bg-slate-50 text-slate-500 border-slate-100/50";

    return (
        <button
            onClick={onClick}
            className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm border cursor-pointer hover:scale-110 transition-transform shrink-0 ${c} ${className}`}
            title={`點擊查看 ${p.name} UML`}
        >
            <Icon size={18} />
        </button>
    );
};

interface RenderTreeProps {
    entry: EntryComponent;
    facade: FileSystemFacade;
    selectedId: string | null;
    setSelectedId: (id: string | null) => void;
    setLiveStats: (stats: { name: string; count: number; total: number; type: string }) => void;
    matchedIds: string[];
    forceUpdate: () => void;
    /** 拖曳放置回呼 */
    onDrop: (sourceId: string, targetId: string) => void;
    /** 目前被拖曳經過的目錄 ID */
    dragOverId: string | null;
    /** 設定拖曳經過的目錄 ID */
    setDragOverId: (id: string | null) => void;
}

const RenderTree: React.FC<RenderTreeProps> = ({
    entry,
    facade,
    selectedId,
    setSelectedId,
    setLiveStats,
    matchedIds,
    forceUpdate,
    onDrop,
    dragOverId,
    setDragOverId,
}) => {
    const isSelected = selectedId === entry.id;
    const isMatched = matchedIds.includes(entry.id);
    const isDragOver =
        dragOverId === entry.id && entry instanceof DirectoryComposite;
    const isDragOverInvalid =
        dragOverId === entry.id && !(entry instanceof DirectoryComposite);
    const isRoot = entry.id === "root";

    const otherAttrs = entry.attributes;

    const attrString = Object.entries(otherAttrs)
        .map(([key, value]) => `, ${key}: ${value}`)
        .join("");

    const infoString =
        entry instanceof DirectoryComposite
            ? attrString
            : `(${entry.size} KB${attrString})`;

    const iconMap: Record<string, any> = {
        Directory: Folder,
        Word: FileText,
        Image: ImageIcon,
        Text: File,
    };
    const Icon = iconMap[entry.type] || File;

    const labels = facade.getLabels(entry.id);

    return (
        <div className="ml-4 text-left">
            <div
                draggable={!isRoot}
                onDragStart={(e) => {
                    e.stopPropagation();
                    e.dataTransfer.setData("text/plain", entry.id);
                    e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (entry instanceof DirectoryComposite) {
                        e.dataTransfer.dropEffect = "move";
                    } else {
                        e.dataTransfer.dropEffect = "none";
                    }
                    setDragOverId(entry.id);
                }}
                onDragLeave={(e) => {
                    e.stopPropagation();
                    if (dragOverId === entry.id) setDragOverId(null);
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const sourceId = e.dataTransfer.getData("text/plain");
                    if (sourceId && entry instanceof DirectoryComposite) {
                        onDrop(sourceId, entry.id);
                    }
                    setDragOverId(null);
                }}
                onDragEnd={() => setDragOverId(null)}
                onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(entry.id);
                    setLiveStats({
                        name: entry.name,
                        count: 1,
                        total: 1,
                        type: entry.type,
                    });
                }}
                className={`flex items-center py-2 pr-2 pl-2 border-l-2 transition-all cursor-pointer ${isSelected ? "bg-blue-50 border-blue-500 shadow-sm" : "border-transparent"} ${isDragOver ? "ring-2 ring-blue-400 bg-blue-50/60 rounded-lg" : ""} ${isDragOverInvalid ? "cursor-not-allowed" : ""} ${isMatched ? "bg-amber-50 ring-1 ring-amber-200 shadow-sm" : "hover:bg-gray-100"}`}
            >
                <Icon
                    className={`mr-2 h-4 w-4 ${entry instanceof DirectoryComposite ? "text-yellow-500" : "text-blue-500"}`}
                />
                <span
                    className={`text-sm ${isMatched ? "font-bold text-amber-700" : "font-medium text-slate-700"}`}
                >
                    {entry.name}
                    <span className="ml-1 text-[10px] opacity-60">{infoString}</span>
                </span>
                <div className="ml-auto flex gap-1 items-center">
                    {labels.map((l) => (
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
                    {entry.getChildren().map((child) => (
                        <RenderTree
                            key={child.id}
                            entry={child}
                            facade={facade}
                            selectedId={selectedId}
                            setSelectedId={setSelectedId}
                            setLiveStats={setLiveStats}
                            matchedIds={matchedIds}
                            forceUpdate={forceUpdate}
                            onDrop={onDrop}
                            dragOverId={dragOverId}
                            setDragOverId={setDragOverId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const ExplorerTab: React.FC = () => {
    const [visitorLogs, setVisitorLogs] = useState<LogEntry[]>([]);
    const [liveStats, setLiveStats] = useState<{
        name: string;
        count: number;
        total: number;
        type: string;
    }>({
        name: "-",
        count: 0,
        total: 0,
        type: "-",
    });
    const [results, setResults] = useState<React.ReactNode | null>(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [matchedIds, setMatchedIds] = useState<string[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [, setUpdateTick] = useState(0);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [showRoadmap, setShowRoadmap] = useState(true);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const [previewPatternId, setPreviewPatternId] = useState<string | null>(null);

    // Console Auto-scroll - Adjusted to scroll only the container, not the window
    const consoleContainerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (consoleContainerRef.current) {
            consoleContainerRef.current.scrollTop =
                consoleContainerRef.current.scrollHeight;
        }
    }, [visitorLogs, results]);

    const [history, setHistory] = useState({ canUndo: false, canRedo: false });
    const [sortState, setSortState] = useState<SortState>({
        attr: "none",
        dir: "asc",
    });

    const forceUpdate = () => setUpdateTick((t) => t + 1);

    const facade = useMemo(
        () => new FileSystemFacade(FileSystemFacade.getSampleRoot()),
        [],
    );

    const highlightLoggerRef = useRef<IObserver | null>(null);
    if (!highlightLoggerRef.current) {
        let logger: IObserver = new ConsoleObserver((logEntry) =>
            setVisitorLogs((prev) => [...prev, logEntry]),
        );

        logger = new BoldDecorator(logger, [
            "[符合]",
            "[Undo]",
            "[Redo]",
            "[System]",
            "[Clipboard]",
            "[Command]",
            "[Error]",
        ]);

        logger = new HighlightDecorator(logger, "[符合]", "text-emerald-600");
        logger = new HighlightDecorator(logger, "[Undo]", "text-amber-600");
        logger = new HighlightDecorator(logger, "[Redo]", "text-orange-600");
        logger = new HighlightDecorator(logger, "[Selection]", "text-indigo-600");
        logger = new HighlightDecorator(logger, "[System]", "text-blue-600");
        logger = new HighlightDecorator(logger, "[Clipboard]", "text-purple-600");
        logger = new HighlightDecorator(logger, "[Command]", "text-cyan-700");
        logger = new HighlightDecorator(logger, "移動", "text-teal-600");
        logger = new HighlightDecorator(logger, "刪除", "text-red-600");

        logger = new IconDecorator(logger, "asc", "🔺");
        logger = new IconDecorator(logger, "desc", "🔻");
        logger = new IconDecorator(logger, "[符合]", "🔍");
        logger = new IconDecorator(logger, "[Undo]", "↩️");
        logger = new IconDecorator(logger, "[Redo]", "↪️");
        logger = new IconDecorator(logger, "刪除", "⛔");
        logger = new IconDecorator(logger, "貼上標籤", "🏷️");
        logger = new IconDecorator(logger, "移除標籤", "🧹");
        logger = new IconDecorator(logger, "[Clipboard]", "📋");
        logger = new IconDecorator(logger, "[Error]", "❌");
        logger = new IconDecorator(logger, "移動", "✂️");

        highlightLoggerRef.current = logger;
    }

    useEffect(() => {
        const clipboardObs: IObserver = {
            update: (event: NotificationEvent) => {
                if (event.source === "clipboard" && event.type === "set") {
                    highlightLoggerRef.current?.update(event);
                    forceUpdate();
                }
            },
        };
        const cmdObs: IObserver = {
            update: (event: NotificationEvent) => {
                setHistory({
                    canUndo: commandInvokerInstance.undoStack.length > 0,
                    canRedo: commandInvokerInstance.redoStack.length > 0,
                });
                if (event.message) {
                    highlightLoggerRef.current?.update(event);
                }
                if (event.data?.sortState) {
                    setSortState(event.data.sortState);
                }
                forceUpdate();
            },
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

    const handleAnalysis = async (
        analysisAction: (obs: IObserver[]) => Promise<void>,
    ) => {
        setIsProcessing(true);
        setVisitorLogs([]);
        setResults(null);
        setMatchedIds([]);

        try {
            const totalNodes = facade.totalItems();
            const dashboardAdapter = new DashboardAdapter(
                (stats) => setLiveStats(stats),
                totalNodes,
            );
            const observers: IObserver[] = [
                highlightLoggerRef.current!,
                dashboardAdapter,
            ];

            await analysisAction(observers);
        } catch (error: any) {
            console.error(error);
            setVisitorLogs((prev) => [
                ...prev,
                {
                    message: `[Error] ${error.message}`,
                    highlight: "text-red-400 font-bold",
                    icon: "",
                    bold: false,
                },
            ]);
        } finally {
            setIsProcessing(false);
        }
    };

    const progressPercent =
        liveStats.total > 0
            ? Math.round((liveStats.count / liveStats.total) * 100)
            : 0;

    return (
        <div className="flex flex-col gap-0 animate-in fade-in duration-500 text-left max-w-[1440px] mx-auto bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            {/* 頂部整合工具列 */}
            <div className="bg-slate-50/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-3 text-left z-10 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative">
                <div
                    className="flex items-center gap-2 border-r border-slate-200/60 pr-4 shrink-0"
                >
                    <div className="font-bold text-slate-800 flex items-center gap-3 text-left py-1.5 rounded-2xl">
                        <PatternIconButton id="command" onClick={() => setPreviewPatternId("command")} />
                        <span className="text-sm tracking-tight opacity-90">Command</span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 border-r border-slate-200 pr-3 shrink-0">
                    <button
                        disabled={!history.canUndo}
                        onClick={() => facade.undo()}
                        className={`px-2.5 py-0 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${history.canUndo ? "bg-slate-50 text-slate-700 hover:bg-blue-100" : "opacity-50 text-slate-400 disabled:cursor-not-allowed"}`}
                    >
                        復原
                    </button>
                    <button
                        disabled={!history.canRedo}
                        onClick={() => facade.redo()}
                        className={`px-2.5 py-0 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${history.canRedo ? "bg-slate-50 text-slate-700 hover:bg-blue-100" : "opacity-50 text-slate-400 disabled:cursor-not-allowed"}`}
                    >
                        重做
                    </button>
                </div>
                <div className="flex items-center gap-1.5 border-r border-slate-200 pr-3 shrink-0">
                    <div className="cursor-pointer hover:bg-slate-200/40 transition-all group shrink-0">
                        <PatternIconButton
                            id="singleton"
                            onClick={() => setPreviewPatternId("singleton")}
                            className="group-hover:scale-110 transition-transform"
                        />
                    </div>
                    <button
                        disabled={!selectedId}
                        onClick={() => {
                            if (selectedId) facade.copyItem(selectedId);
                        }}
                        className={`px-2.5 py-0 h-8 rounded-lg text-xs font-bold transition-all flex items-center ${!selectedId ? "opacity-50 text-slate-400 disabled:cursor-not-allowed" : "bg-slate-50 text-slate-700 hover:bg-blue-100"}`}
                        title="複製 (Copy)"
                    >
                        複製
                    </button>

                    <button
                        disabled={!facade.getClipboardStatus()}
                        onClick={() => facade.pasteItem(selectedId)}
                        className={`px-2.5 py-0 h-8 rounded-lg text-xs font-bold transition-all flex items-center ${!facade.getClipboardStatus() ? "opacity-50 text-slate-400 disabled:cursor-not-allowed" : "bg-slate-50 text-slate-700 hover:bg-blue-100"}`}
                        title="貼上 (Paste)"
                    >
                        貼上
                    </button>

                    <button
                        disabled={!selectedId || selectedId === "root"}
                        onClick={() => {
                            if (selectedId) facade.deleteItem(selectedId);
                            setSelectedId(null);
                        }}
                        className={`px-2.5 py-0 h-8 rounded-lg transition-all flex items-center text-xs font-bold ${!selectedId || selectedId === "root" ? "opacity-50 text-slate-400 disabled:cursor-not-allowed" : "bg-red-50 text-red-600 hover:bg-red-100"}`}
                    >
                        刪除
                    </button>
                </div>
                <div className="flex items-center gap-1.5 border-r border-slate-200 pr-3 text-left shrink-0">
                    <PatternIconButton
                        id="strategy"
                        onClick={() => setPreviewPatternId("strategy")}
                    />
                    {[
                        { id: "name", l: "名稱" },
                        { id: "size", l: "大小" },
                        { id: "extension", l: "類型" },
                        { id: "label", l: "標籤" },
                    ].map((s) => {
                        const active = sortState.attr === s.id;
                        return (
                            <button
                                key={s.id}
                                onClick={() => handleSort(s.id)}
                                className={`px-2.5 py-0 h-8 rounded-lg text-sm font-bold flex items-center gap-1 transition-all whitespace-nowrap ${active ? "bg-blue-100 text-blue-800" : "bg-slate-50 text-slate-700 hover:bg-blue-100"}`}
                            >
                                {s.l}{" "}
                                {active &&
                                    (sortState.dir === "asc" ? (
                                        <SortAsc size={14} />
                                    ) : (
                                        <SortDesc size={14} />
                                    ))}
                            </button>
                        );
                    })}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <PatternIconButton
                        id="flyweight"
                        onClick={() => setPreviewPatternId("flyweight")}
                    />
                    <div className="flex gap-1.5 text-left">
                        {["Urgent", "Work", "Personal"].map((lbl) => {
                            const count = facade.mediator.getFiles(lbl).length;
                            const colorMap: Record<string, string> = {
                                Urgent:
                                    "bg-red-50 hover:bg-red-100 text-red-600 border-red-100",
                                Work: "bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-100",
                                Personal:
                                    "bg-green-50 hover:bg-green-100 text-green-600 border-green-100",
                            };
                            const colorClass =
                                colorMap[lbl] ||
                                "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-100";

                            return (
                                <button
                                    key={lbl}
                                    disabled={!selectedId || selectedId === "root"}
                                    onClick={() => facade.tagItem(selectedId!, lbl)}
                                    className={`relative px-2.5 py-0 h-8 rounded-lg text-xs font-bold border transition-all flex items-center ${!selectedId || selectedId === "root" ? "opacity-30 border-slate-200 text-slate-400 cursor-not-allowed" : `${colorClass} shadow-sm`}`}
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
                <div className="ml-auto flex-1 shrink-0">
                    <button
                        onClick={() => setIsHelpOpen(true)}
                        className="w-full group flex items-center justify-center gap-3 px-4 py-1.5 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 font-black text-sm active:scale-95 shadow-md text-center"
                    >
                        <Calendar
                            size={18}
                            className="group-hover:rotate-12 transition-transform"
                        />
                        <span className="text-base tracking-wide">
                            Readme in a Week
                        </span>
                    </button>
                </div>
            </div>

            {/* 主工作區佈局 */}
            <div className="flex flex-col md:flex-row md:h-[520px] md:overflow-hidden h-auto">
                {/* 1. 側邊欄：檔案階層 (w-[440px]) */}
                <div className="w-full md:w-[440px] bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0 p-4 text-left h-[400px] md:h-auto overflow-hidden">
                    <div className="font-bold text-slate-800 mb-5 flex w-max items-center gap-3 text-left py-1.5 rounded-2xl">
                        <PatternIconButton id="composite" onClick={() => setPreviewPatternId("composite")} />
                        <span className="text-sm tracking-tight opacity-90">Composite</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar text-left">
                        <RenderTree
                            entry={facade.root as DirectoryComposite}
                            facade={facade}
                            selectedId={selectedId}
                            setSelectedId={setSelectedId}
                            setLiveStats={setLiveStats}
                            matchedIds={matchedIds}
                            forceUpdate={forceUpdate}
                            onDrop={(sourceId, targetId) => {
                                facade.moveItem(sourceId, targetId);
                            }}
                            dragOverId={dragOverId}
                            setDragOverId={setDragOverId}
                        />
                    </div>
                </div>

                {/* 2. 右側容器：操作、監控與 Console */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 flex flex-col md:flex-row min-h-0 border-b border-slate-200 bg-white">
                        {/* Visitor 操作 */}
                        <div className="flex-1 p-4 flex flex-col justify-start space-y-4 border-r border-slate-100 overflow-y-auto custom-scrollbar">
                            <div className="font-bold text-slate-800 flex items-center gap-3 text-left py-1.5 rounded-2xl">
                                <PatternIconButton id="visitor" onClick={() => setPreviewPatternId("visitor")} />
                                <span className="text-sm tracking-tight opacity-90">Visitor</span>
                                <PatternIconButton id="template" onClick={() => setPreviewPatternId("template")} />
                                <span className="text-sm tracking-tight opacity-90">Template Method</span>
                            </div>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() =>
                                        handleAnalysis(async (obs) => {
                                            const size = await facade.calculateSize(obs);
                                            setResults(`總大小：${size} KB`);
                                        })
                                    }
                                    className="py-2.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-sm font-bold flex justify-between px-4 items-center transition-all text-left"
                                >
                                    <span>計算大小</span>
                                    <Calculator size={18} />
                                </button>
                                <button
                                    onClick={() =>
                                        handleAnalysis(async (obs) => {
                                            const xml = await facade.exportXml(obs);
                                            setResults(
                                                <pre className="text-left bg-slate-800 p-2 rounded text-amber-200 text-[10px] whitespace-pre-wrap break-all">
                                                    {xml}
                                                </pre>,
                                            );
                                        })
                                    }
                                    className="flex-1 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-bold flex justify-between px-4 items-center transition-all text-left"
                                >
                                    <span>匯出 XML</span>
                                    <FileJson size={18} />
                                </button>
                            </div>
                            <div className="flex flex-row gap-1.5 flex-nowrap items-center text-left">
                                <div className="relative flex-1 min-w-0 text-left">
                                    <input
                                        type="text"
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && searchKeyword) {
                                                handleAnalysis(async (obs) => {
                                                    const ids = await facade.searchFiles(
                                                        searchKeyword,
                                                        obs,
                                                    );
                                                    setMatchedIds(ids);
                                                    setResults(`找到 ${ids.length} 項`);
                                                });
                                            }
                                        }}
                                        className="w-full px-2.5 py-1.5 pr-7 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:ring-1 focus:ring-blue-400 truncate text-left"
                                        placeholder="輸入關鍵字..."
                                    />
                                    {(searchKeyword || matchedIds.length > 0) && (
                                        <button
                                            onClick={() => {
                                                setSearchKeyword("");
                                                setMatchedIds([]);
                                            }}
                                            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                                <button
                                    disabled={!searchKeyword}
                                    onClick={() =>
                                        handleAnalysis(async (obs) => {
                                            const ids = await facade.searchFiles(
                                                searchKeyword,
                                                obs,
                                            );
                                            setMatchedIds(ids);
                                            setResults(`找到 ${ids.length} 項`);
                                        })
                                    }
                                    className="whitespace-nowrap px-4 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl font-bold text-sm py-2 transition-all flex items-center gap-1 text-left"
                                >
                                    搜尋 <Search size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Observer 監控 */}
                        <div className="w-full md:w-80 p-4 flex flex-col justify-start space-y-4 bg-white overflow-y-auto custom-scrollbar">
                            <div className="font-bold text-slate-800 flex items-center justify-between text-left py-1.5 rounded-2xl">
                                <div className="flex items-center gap-3 text-left">
                                    <PatternIconButton id="observer" onClick={() => setPreviewPatternId("observer")} />
                                    <span className="text-sm tracking-tight opacity-90">Observer</span>
                                    <PatternIconButton id="adapter" onClick={() => setPreviewPatternId("adapter")} />
                                    <span className="text-sm tracking-tight opacity-90">Adapter</span>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 bg-pink-500 text-white rounded-full font-bold uppercase tracking-tighter text-left shadow-sm ${isProcessing ? "animate-live-fast" : ""}`}>
                                    Live
                                </span>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-slate-50 p-3.5 rounded-xl border border-blue-50 flex flex-col text-left">
                                    <span className="text-sm text-slate-400 font-bold uppercase mb-1.5 text-left">
                                        目前節點
                                    </span>
                                    <span className="text-sm font-black text-blue-700 truncate mb-2 text-left">
                                        {liveStats.name}
                                    </span>
                                    <div className="flex justify-between items-center mb-2 text-left">
                                        <span className="text-sm text-slate-400 font-bold uppercase text-left">
                                            掃描進度
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner text-left">
                                            <div
                                                className="h-full bg-blue-500 transition-all duration-300 ease-out relative overflow-hidden text-left"
                                                style={{ width: `${progressPercent}%` }}
                                            >
                                                <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]"></div>
                                            </div>
                                        </div>
                                        <span className="text-sm font-black text-blue-600 text-left">
                                            {progressPercent}%
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 text-right font-bold tracking-tight mt-2 text-left">
                                        {liveStats.count} / {liveStats.total} Nodes
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 底部 Console */}
                    <div className="h-[240px] bg-slate-50/80 px-4 pb-5 flex flex-col overflow-hidden">
                        <div className="relative h-10 shrink-0">
                            {/* Left: Decorator Title & Pattern */}
                            <div className="absolute left-0 inset-y-0 flex items-center whitespace-nowrap">
                                <div className="font-bold text-slate-800 flex items-center gap-3 text-left rounded-2xl">
                                    <PatternIconButton id="decorator" onClick={() => setPreviewPatternId("decorator")} />
                                    <span className="text-sm font-bold tracking-tight">
                                        Decorator
                                    </span>
                                </div>
                            </div>

                            {/* Middle: Output Label */}
                            <div className="absolute left-1/2 -translate-x-1/2 inset-y-0 flex items-center pointer-events-none">
                                <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                                    Console
                                </span>
                            </div>

                            {/* Right: Git (Consistent positioning) */}
                            <div className="absolute right-0 inset-y-0 flex items-center">
                                <a
                                    className="text-blue-600 text-xs font-bold tracking-tight flex items-center gap-1 hover:underline pr-1"
                                    href="https://github.com/yestaro/design-patterns"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="前往 GitHub 檢視原始碼"
                                >
                                    <Github size={14} />
                                    Git
                                </a>
                            </div>
                        </div>
                        <div
                            ref={consoleContainerRef}
                            className="flex-1 overflow-y-auto space-y-0.5 pr-2 custom-scrollbar text-left text-sm font-mono leading-tight bg-slate-900/[0.03] rounded-xl p-4 border border-slate-200/60"
                        >
                            {visitorLogs.length === 0 && !results && (
                                <div className="space-y-3 text-slate-500">
                                    <p className="text-amber-600 font-bold text-base tracking-wide">
                                        {">"} Stay a while and listen..._
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
                                            <p className="text-emerald-600 font-bold">
                                                ⚡ 操作與觀察
                                            </p>
                                            <p className="pl-4">• 計算大小 / 匯出 XML / 搜尋</p>
                                            <p className="pl-4">• 操作進度與結果會即時顯示</p>
                                            <p className="pl-4">
                                                • 試試任意操作，Console 將記錄每一步
                                            </p>
                                            <p className="text-amber-600/80 text-sm pt-2 font-medium">
                                                💡 如果是你，會如何實作這些功能？
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {visitorLogs.map((log, i) => (
                                <div key={i} className="py-0.5 leading-snug text-slate-600">
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: log.message
                                                .replace(/text-blue-300/g, "text-blue-600")
                                                .replace(/text-emerald-400/g, "text-emerald-600"),
                                        }}
                                    />
                                </div>
                            ))}
                            {results && (
                                <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded text-sm font-bold border border-blue-100 text-left">
                                    {results}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <RoadmapDialog isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
            <PatternMermaidDialog
                isOpen={!!previewPatternId}
                patternId={previewPatternId}
                onClose={() => setPreviewPatternId(null)}
            />
        </div>
    );
};

export default ExplorerTab;
