import { Check, Copy, Maximize2, Minus, X } from 'lucide-react';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import CodeBlock from './CodeBlock';

interface CodeWindowProps {
    title: ReactNode;
    onClose: () => void;
    initialSourceCode?: string;
    targetClass?: string;
    defaultPosition?: { x: number; y: number };
}

import { HelpCircle, Loader2 } from 'lucide-react';
import { patterns } from '../../data/patterns';
import { useSourceCode } from '../../hooks/useSourceCode';
import { extractClassOrInterface } from '../../utils/codeParser';

export const CodeWindow: React.FC<CodeWindowProps> = ({
    title,
    onClose,
    initialSourceCode,
    targetClass,
    defaultPosition = { x: 32, y: 100 }
}) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    const pos = useRef(defaultPosition);
    const { fetchCode, codes, isLoading } = useSourceCode();

    const [resolvedNodeId, setResolvedNodeId] = useState<string | null>(null);
    const [statusText, setStatusText] = useState("");
    const isDragging = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const dragBounds = useRef({ width: 0, height: 0 });
    const [copied, setCopied] = useState(false);

    // 【核心邏輯】自動路航並委託 Hook 載入
    useEffect(() => {
        const resolveAndFetch = async () => {
            const targetName = targetClass || (typeof title === 'string' ? title : null);
            if (!targetName) return;

            setResolvedNodeId(targetName);

            // 第一層：若 initialSourceCode 已包含目標類別，則直接顯示
            if (initialSourceCode) {
                const chunk = extractClassOrInterface(initialSourceCode, targetName);
                if (chunk) {
                    return; // 真的抓到了才結束
                }
            }

            // 第二層：跨檔案定位 (Meta-data Scan)
            // 尋找在哪個模式的 mermaid 定義中出現過這個類別
            // 優先找精確匹配 class ClassName
            let owners = patterns.filter(p =>
                p.mermaid.includes(`class ${targetName}`) ||
                p.mermaid.includes(`interface ${targetName}`)
            );

            // 備援：模糊匹配
            if (owners.length === 0) {
                owners = patterns.filter(p => p.mermaid.includes(targetName));
            }

            const validOwners = owners.filter(o => o.sourceFile);

            if (validOwners.length > 0) {
                // 如果找到的所有 owner 中，有跟目前傳入的碼在同一份檔案的，就不需要全都重抓
                const currentPattern = patterns.find(p => p.mermaid.includes(initialSourceCode || ''));
                if (validOwners.length === 1 && currentPattern && validOwners[0].sourceFile === currentPattern.sourceFile) {
                    return;
                }

                setStatusText(`正在跨檔掃描...`);
                await Promise.all(
                    validOwners.map(owner => fetchCode(owner.id, owner.sourceFile))
                );
            }
        };

        resolveAndFetch();
    }, [title, targetClass, initialSourceCode, fetchCode]);

    // 智慧型代碼解析：監聽 Hook 快取的變化
    const displayCode = React.useMemo(() => {
        const targetName = resolvedNodeId;
        if (!targetName) return initialSourceCode || "";

        // 1. 先從初始傳入的找
        if (initialSourceCode) {
            const chunk = extractClassOrInterface(initialSourceCode, targetName);
            if (chunk) return chunk;
        }

        // 2. 遍歷 Hook 緩存中的所有檔案
        for (const [key, source] of Object.entries(codes)) {
            if (typeof source !== 'string') continue;
            const chunk = extractClassOrInterface(source, targetName);
            if (chunk) return chunk;
        }

        // 3. 回退：如果跨檔案找到了但 extract 失敗（可能語法不合），則回傳找到的該檔案全文
        const owner = patterns.find(p => p.mermaid.includes(targetName));
        if (owner && codes[owner.id] && typeof codes[owner.id] === 'string') {
            return codes[owner.id] as string;
        }

        return initialSourceCode || "";
    }, [resolvedNodeId, initialSourceCode, codes]);

    // Mac-style window states
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const savedStyle = useRef({ x: '', y: '', w: '600px', h: '500px' });

    useEffect(() => {
        // 初始化與確認視窗範圍
        if (popoverRef.current) {
            const rect = popoverRef.current.getBoundingClientRect();
            let startX = pos.current.x;
            let startY = pos.current.y;

            // 避免初始狀態就在螢幕外
            const maxX = window.innerWidth - rect.width;
            const maxY = window.innerHeight - rect.height;
            startX = Math.max(0, Math.min(startX, Math.max(0, maxX)));
            startY = Math.max(0, Math.min(startY, Math.max(0, maxY)));

            pos.current = { x: startX, y: startY };
            popoverRef.current.style.left = `${startX}px`;
            popoverRef.current.style.top = `${startY}px`;
            popoverRef.current.style.width = savedStyle.current.w;
            popoverRef.current.style.height = savedStyle.current.h;
        }
    }, []);

    useEffect(() => {
        if (!popoverRef.current) return;
        const el = popoverRef.current;

        if (isMaximized) {
            el.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            el.style.left = '16px';
            el.style.top = '16px';
            el.style.width = 'calc(100vw - 32px)';
            el.style.height = 'calc(100vh - 32px)';
            setTimeout(() => { el.style.transition = ''; }, 300);
        } else if (isMinimized) {
            el.style.transition = 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            el.style.height = '48px'; // Just title bar
            setTimeout(() => { el.style.transition = ''; }, 300);
        } else {
            // Restore normal state
            el.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

            const restoredX = savedStyle.current.x || `${pos.current.x}px`;
            const restoredY = savedStyle.current.y || `${pos.current.y}px`;

            el.style.left = restoredX;
            el.style.top = restoredY;
            el.style.width = savedStyle.current.w;
            el.style.height = savedStyle.current.h;

            // 同步將 pos.current 更新回還原後的座標，否則縮小/放大後的下一次拖曳起點會錯誤導致視窗瞬移
            if (savedStyle.current.x) pos.current.x = parseFloat(savedStyle.current.x) || 0;
            if (savedStyle.current.y) pos.current.y = parseFloat(savedStyle.current.y) || 0;

            setTimeout(() => { el.style.transition = ''; }, 300);
        }
    }, [isMaximized, isMinimized]);

    const saveCurrentStyle = () => {
        if (popoverRef.current) {
            savedStyle.current = {
                x: popoverRef.current.style.left,
                y: popoverRef.current.style.top,
                w: popoverRef.current.style.width || '600px',
                h: popoverRef.current.style.height || '500px'
            };
        }
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.closest('button')) return; // 點擊到按鈕時不觸發拖曳

        // Mac 視窗放大時不允許拖曳
        if (isMaximized) return;

        if (e.button !== 0) return; // 只允許左鍵
        isDragging.current = true;
        dragOffset.current = {
            x: e.clientX - pos.current.x,
            y: e.clientY - pos.current.y
        };

        // 快取拖曳當下的寬高，避免在 move 事件中去讀取而觸發 Layout Thrashing (嚴重卡頓的主因)
        if (popoverRef.current) {
            dragBounds.current = {
                width: popoverRef.current.offsetWidth,
                height: popoverRef.current.offsetHeight
            };
        }

        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging.current || !popoverRef.current || isMaximized) return;

        // 計算新的 (X,Y)
        let newX = e.clientX - dragOffset.current.x;
        let newY = e.clientY - dragOffset.current.y;

        // 加入邊界保護 (不能離開瀏覽器範圍, 預留一些底部空間防切斷)
        const padding = 10;
        const offsetWidth = dragBounds.current.width;
        const offsetHeight = dragBounds.current.height;

        const maxX = window.innerWidth - offsetWidth - padding;
        const maxY = window.innerHeight - offsetHeight - padding;

        newX = Math.max(padding, Math.min(newX, Math.max(padding, maxX)));
        newY = Math.max(padding, Math.min(newY, Math.max(padding, maxY)));

        pos.current = { x: newX, y: newY };

        // 直接操作 DOM 以避開 React Rendering 帶來的卡頓
        popoverRef.current.style.left = `${newX}px`;
        popoverRef.current.style.top = `${newY}px`;
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging.current) return;
        isDragging.current = false;
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    const handleToggleMaximize = (e?: React.MouseEvent | React.PointerEvent) => {
        if (e) e.stopPropagation();
        if (!isMaximized && !isMinimized) saveCurrentStyle();
        setIsMaximized(!isMaximized);
        if (isMinimized) setIsMinimized(false);
    };

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (displayCode) {
            navigator.clipboard.writeText(displayCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div
            ref={popoverRef}
            className="fixed z-[100] bg-slate-900/80 backdrop-blur-2xl rounded-xl flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-slate-700 animate-in fade-in duration-200"
            style={{
                minWidth: '300px',
                minHeight: isMinimized ? '48px' : '200px',
                maxWidth: '90vw',
                maxHeight: '90vh',
                resize: (isMaximized || isMinimized) ? 'none' : 'both',
                overflow: 'hidden'
            }}
        >
            {/* Draggable Header */}
            <div
                className="relative flex items-center justify-between p-3 border-b border-slate-800 bg-transparent z-10 cursor-move select-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onDoubleClick={handleToggleMaximize}
            >
                {/* 絕對置中標題 */}
                <div className="absolute inset-x-0 h-full flex items-center justify-center pointer-events-none">
                    <span className="text-slate-300 font-mono tracking-wider font-bold text-sm select-none">{title}</span>
                </div>

                {/* Mac 視窗控制鈕 (左邊) */}
                <div className="flex gap-2 z-20 items-center px-1 group/mac">
                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] hover:bg-[#ff5f56]/80 flex items-center justify-center transition-colors overflow-hidden"
                        title="Close"
                    >
                        <X size={8} className="text-black/60 opacity-0 group-hover/mac:opacity-100 transition-opacity pointer-events-none" strokeWidth={3} />
                    </button>
                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isMaximized && !isMinimized) saveCurrentStyle();
                            setIsMinimized(!isMinimized);
                            if (isMaximized) setIsMaximized(false);
                        }}
                        className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] hover:bg-[#ffbd2e]/80 flex items-center justify-center transition-colors overflow-hidden"
                        title="Minimize"
                    >
                        <Minus size={8} className="text-black/60 opacity-0 group-hover/mac:opacity-100 transition-opacity pointer-events-none" strokeWidth={4} />
                    </button>
                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={handleToggleMaximize}
                        className="w-3.5 h-3.5 rounded-full bg-[#27c93f] hover:bg-[#27c93f]/80 flex items-center justify-center transition-colors overflow-hidden"
                        title="Maximize"
                    >
                        <Maximize2 size={7} className="text-black/60 opacity-0 group-hover/mac:opacity-100 transition-opacity pointer-events-none" strokeWidth={3} />
                    </button>
                </div>

                <div className="flex items-center gap-2 z-20">
                    {displayCode && (
                        <button
                            onClick={handleCopy}
                            className={`p-1 px-2 hover:bg-slate-700/50 rounded-full transition-colors active:scale-95 flex items-center gap-1.5 text-xs font-mono font-bold ${copied ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-white'}`}
                            title="複製程式碼"
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    )}
                </div>
            </div>

            {/* Scrollable Content */}
            {!isMinimized && (
                <div className="p-0 overflow-auto flex-1 custom-scrollbar bg-black/20" onPointerDown={(e) => e.stopPropagation()}>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[150px] gap-3">
                            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                            <span className="text-slate-400 text-xs font-mono">{statusText}</span>
                        </div>
                    ) : displayCode ? (
                        <CodeBlock code={displayCode} language="typescript" showLineNumbers={true} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full min-h-[150px] gap-2 p-6 text-center">
                            <HelpCircle className="w-8 h-8 text-slate-600 mb-2" />
                            <span className="text-slate-300 font-bold mb-1">找不到相關代碼實作</span>
                            <span className="text-slate-500 text-xs">該元件可能為純架構定義節點，尚未提供原始碼檔案</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
