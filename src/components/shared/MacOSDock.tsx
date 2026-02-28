/**
 * MacOSDock — 仿 macOS Dock 的魚眼放大互動元件
 * 物理引擎 1:1 移植自 https://github.com/puruvj/macos-web
 *
 * @example 基本用法
 * ```tsx
 * import { MacOSDock } from './shared/MacOSDock';
 * import { Home, Settings, User } from 'lucide-react';
 *
 * const items = [
 *   { id: 'home', name: '首頁', icon: Home },
 *   { id: 'settings', name: '設定', icon: Settings },
 *   { id: 'profile', name: '個人', icon: User },
 * ];
 *
 * <MacOSDock items={items} activeId="home" onSelect={(id) => setActive(id)} />
 * ```
 *
 * @example 自訂大小與間距
 * ```tsx
 * <MacOSDock
 *   items={items}
 *   activeId={activeId}
 *   onSelect={setActiveId}
 *   baseSize={48}        // 圖示基礎尺寸 (預設 57.6px)
 *   maxScale={1.8}       // 最大放大倍率 (預設 2x)
 *   gap={8}              // 圖示間距 (預設 12px)
 *   showLabels={false}   // 隱藏文字標籤 (預設 true)
 * />
 * ```
 *
 * @example 自訂顏色
 * ```tsx
 * <MacOSDock
 *   items={items}
 *   activeId={activeId}
 *   onSelect={setActiveId}
 *   colorMap={{
 *     home: 'text-blue-500',
 *     settings: 'text-gray-500',
 *     profile: 'text-green-500',
 *   }}
 * />
 * ```
 *
 * @example 響應式（行動裝置切換 Grid）
 * ```tsx
 * <MacOSDock
 *   items={items}
 *   activeId={activeId}
 *   onSelect={setActiveId}
 *   isMobile={window.innerWidth < 1024}
 *   mobileColumns={3}    // 行動版每列 3 個 (預設 4)
 * />
 * ```
 */
import React from 'react';
import { motion, useMotionValue, MotionValue, useAnimationFrame } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

// ── 型別定義 ──
export interface DockItemData {
    /** 唯一識別碼 */
    id: string;
    /** 顯示名稱 */
    name: string;
    /** Lucide 圖示元件 */
    icon: LucideIcon;
    /** 額外的 tooltip 文字（可選） */
    tooltip?: string;
}

export interface MacOSDockProps {
    /** Dock 項目資料陣列 */
    items: DockItemData[];
    /** 目前選中的項目 ID */
    activeId: string;
    /** 選中項目時的回呼 */
    onSelect: (id: string) => void;
    /** 是否為行動裝置模式（使用 Grid 佈局） */
    isMobile?: boolean;
    /** 未選中時的圖示顏色對照表（可選） */
    colorMap?: Record<string, string>;
    /** 容器的額外 className（可選） */
    className?: string;
    /** 行動裝置的 Grid 欄數（預設 4） */
    mobileColumns?: number;
    /** 圖示基礎尺寸 px（預設 57.6） */
    baseSize?: number;
    /** 圖示之間的間距 px（預設 12） */
    gap?: number;
    /** 是否顯示圖示下方的文字標籤（預設 true） */
    showLabels?: boolean;
    /** 滑鼠懸停時的最大放大倍率（預設 2，即 2 倍） */
    maxScale?: number;
}

// ── 預設值 ──
const DEFAULT_BASE_SIZE = 57.6;

/** 根據 baseSize 與 maxScale 產生插值斷點 */
function buildInterpolation(baseWidth: number, maxScale: number) {
    const distanceLimit = baseWidth * 6;
    const beyond = distanceLimit + 1;
    // 中間倍率用 sqrt(maxScale) 來保持鐘形曲線的平滑過渡
    const midScale = Math.sqrt(maxScale);
    const nearScale = 1 + (maxScale - 1) * 0.1;
    const distanceInput = [
        -distanceLimit, -distanceLimit / 1.25, -distanceLimit / 2, 0,
        distanceLimit / 2, distanceLimit / 1.25, distanceLimit,
    ];
    const widthOutput = [
        baseWidth, baseWidth * nearScale, baseWidth * midScale, baseWidth * maxScale,
        baseWidth * midScale, baseWidth * nearScale, baseWidth,
    ];
    return { distanceInput, widthOutput, beyond };
}

/** 線性插值函式（替代 popmotion interpolate） */
function interpolate(input: number[], output: number[], value: number): number {
    if (value <= input[0]) return output[0];
    if (value >= input[input.length - 1]) return output[output.length - 1];
    for (let i = 0; i < input.length - 1; i++) {
        if (value >= input[i] && value <= input[i + 1]) {
            const t = (value - input[i]) / (input[i + 1] - input[i]);
            return output[i] + t * (output[i + 1] - output[i]);
        }
    }
    return output[output.length - 1];
}

// ── Dock 動畫引擎 (Parent 層級，批量讀寫，1 次 reflow/frame) ──
function useDockAnimation(mouseX: MotionValue<number>, count: number, baseSize: number, maxScale: number) {
    const { distanceInput, widthOutput, beyond } = React.useMemo(
        () => buildInterpolation(baseSize, maxScale), [baseSize, maxScale]
    );

    const widths = React.useMemo(() =>
        Array.from({ length: count }, () => new MotionValue(baseSize)), [count, baseSize]
    );
    const lastWidths = React.useRef(Array(count).fill(baseSize));
    const refsArray = React.useRef<(HTMLDivElement | null)[]>(Array(count).fill(null));

    /** 穩定的 ref callback 陣列 */
    const refCallbacks = React.useMemo(() =>
        Array.from({ length: count }, (_, i) => (el: HTMLDivElement | null) => {
            refsArray.current[i] = el;
        }), [count]
    );

    useAnimationFrame(() => {
        const mx = mouseX.get();
        const isMouseOut = mx === Infinity;

        // 階段 1：批量讀取所有 DOM rect（只觸發 1 次 forced reflow）
        const rects = refsArray.current.map(el =>
            el ? el.getBoundingClientRect() : null
        );

        // 階段 2：批量計算所有 spring
        for (let i = 0; i < count; i++) {
            let dist = beyond;
            const rect = rects[i];
            if (rect && !isMouseOut) {
                dist = mx - rect.left - rect.width / 2;
            }
            const target = interpolate(distanceInput, widthOutput, dist);

            const current = widths[i].get();
            const last = lastWidths.current[i];

            // Svelte spring tick (stiffness 略高於原版 0.12，補償 React 管線延遲)
            const delta = target - current;
            const velocity = current - last;
            const spring_force = 0.25 * delta;
            const damping_force = 0.7 * velocity;
            const acceleration = spring_force - damping_force;
            const displacement = velocity + acceleration;
            const next = current + displacement;

            lastWidths.current[i] = current;

            if (Math.abs(target - next) < 0.01 && Math.abs(displacement) < 0.01) {
                widths[i].set(target);
                lastWidths.current[i] = target;
            } else {
                widths[i].set(next);
            }
        }
    });

    return { widths, refCallbacks };
}

// ── DockItem（純渲染元件，動畫由 parent 驅動） ──
function DockItem({
    item, isActive, onSelect, width, elRef, subtleColor, showLabels
}: {
    item: DockItemData; isActive: boolean; onSelect: () => void;
    width: MotionValue<number>; elRef: (el: HTMLDivElement | null) => void;
    subtleColor: string; showLabels: boolean;
}) {
    const Icon = item.icon;

    return (
        <button
            onClick={onSelect}
            className="group relative flex flex-col items-center justify-end transition-colors duration-200 ease-out shrink-0 outline-none pb-1"
            title={item.tooltip || item.name}
        >
            <motion.div
                ref={elRef}
                style={{ width, height: width, willChange: 'width' }}
                className={`rounded-[22%] shadow-xl border flex items-center justify-center origin-bottom ${isActive ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-400 ring-2 ring-blue-500/20 shadow-blue-500/30' : 'bg-white border-slate-200 hover:border-slate-300'}`}
            >
                <Icon className={`w-[50%] h-[50%] transition-colors duration-300 ${isActive ? 'text-white' : subtleColor}`} />
            </motion.div>

            {showLabels && (
                <span className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-bold transition-all duration-200 pointer-events-none ${isActive ? 'text-slate-800 opacity-100' : 'text-slate-500 opacity-80 group-hover:opacity-100 group-hover:text-slate-600'}`} style={{ top: '100%', marginTop: 8 }}>
                    {item.name}
                </span>
            )}
        </button>
    );
}

// ── DockItem 行動版（無動畫） ──
function DockItemMobile({
    item, isActive, onSelect, subtleColor, baseSize
}: {
    item: DockItemData; isActive: boolean; onSelect: () => void;
    subtleColor: string; baseSize: number;
}) {
    const Icon = item.icon;
    const iconSize = Math.round(baseSize * 0.47);
    return (
        <button
            onClick={onSelect}
            className="group flex flex-col items-center gap-1.5 transition-all duration-200"
        >
            <div
                style={{ width: baseSize, height: baseSize }}
                className={`rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm border ${isActive ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-400' : 'bg-white border-slate-200'}`}
            >
                <Icon size={iconSize} className={isActive ? 'text-white' : subtleColor} />
            </div>
            <span className={`text-[10px] font-bold ${isActive ? 'text-blue-700' : 'text-slate-400'}`}>{item.name}</span>
        </button>
    );
}

// ── 主元件 ──
const DEFAULT_COLOR = 'text-slate-400';

export const MacOSDock: React.FC<MacOSDockProps> = ({
    items,
    activeId,
    onSelect,
    isMobile = false,
    colorMap = {},
    className = '',
    mobileColumns = 4,
    baseSize = DEFAULT_BASE_SIZE,
    gap = 12,
    showLabels = true,
    maxScale = 2,
}) => {
    const mouseX = useMotionValue(Infinity);
    const { widths, refCallbacks } = useDockAnimation(mouseX, items.length, baseSize, maxScale);

    if (isMobile) {
        return (
            <div className={`grid gap-y-8 gap-x-2 px-2 py-4 ${className}`} style={{ gridTemplateColumns: `repeat(${mobileColumns}, 1fr)` }}>
                {items.map((item) => (
                    <DockItemMobile
                        key={item.id}
                        item={item}
                        isActive={activeId === item.id}
                        onSelect={() => onSelect(item.id)}
                        subtleColor={colorMap[item.id] || DEFAULT_COLOR}
                        baseSize={baseSize}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            onMouseMove={(e) => mouseX.set(e.clientX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            className={`relative flex justify-center items-end overflow-visible select-none ${className}`}
            style={{ height: baseSize * 1.8, gap, paddingBottom: 4 }}
        >
            {/* 貫穿 icon 下方 ~3/4 處的橫線 */}
            <div className="absolute left-0 right-0 border-b border-slate-200" style={{ bottom: 12 + baseSize * 0.25 }} />
            {items.map((item, index) => (
                <DockItem
                    key={item.id}
                    item={item}
                    isActive={activeId === item.id}
                    onSelect={() => onSelect(item.id)}
                    width={widths[index]}
                    elRef={refCallbacks[index]}
                    subtleColor={colorMap[item.id] || DEFAULT_COLOR}
                    showLabels={showLabels}
                />
            ))}
        </div>
    );
};

export default MacOSDock;
