// =============================================================================
// --- [Adapter Pattern] ---
// =============================================================================

import { IObserver, NotificationEvent } from './Observer';

/**
 * [Adapter Pattern] DashboardAdapter
 * 這裡展示了標準的轉接器模式：
 * 1. Target (目標介面)：IObserver (具有 `update(event)` 介面)
 * 2. Adaptee (被轉接者)：React 的 `updateStatsFn`，它不認識 event，只吃特定的物件格式
 * 3. Adapter (轉接器)：DashboardAdapter，實作 Target 並呼叫 Adaptee。
 */
export class DashboardAdapter implements IObserver {
    constructor(
        // Adaptee：React 更新畫面的方法
        private updateStatsFn: (stats: { name: string; count: number; total: number; type: string }) => void,
        private total: number
    ) { }

    // 實作 Target 的介面
    update(event: NotificationEvent): void {
        const payload = event.data || {};

        // 適配 (Adaptation)：將原始 event 翻譯/轉換為 Adaptee 期望的格式
        const adaptedStats = {
            name: payload.currentNode || '-',
            count: payload.count || 0,
            total: this.total,
            type: payload.nodeType || '-'
        };

        // 呼叫 Adaptee 以完成轉接
        this.updateStatsFn(adaptedStats);
    }
}
