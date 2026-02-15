// =============================================================================
// --- [Adapter Pattern] ---
// =============================================================================

import { IObserver, NotificationEvent } from './Observer';

/**
 * [Target Adapter] DashboardAdapter
 * 這是將原始事件 (NotificationEvent) 轉換為 UI 期望格式的轉接器物件。
 * 我們將「轉換邏輯」封裝在建構子中，讓轉接過程更物件化。
 */
export class DashboardAdapter {
    public readonly name: string;
    public readonly count: number;
    public readonly total: number;
    public readonly type: string;

    constructor(event: NotificationEvent, total: number) {
        const payload = event.data || {};
        // 這裡就是「適配 (Adaptation)」的核心：
        // 將 payload.currentNode 適配為 name，補全 total，處理空值。
        this.name = payload.currentNode || '-';
        this.count = payload.count || 0;
        this.total = total;
        this.type = payload.nodeType || '-';
    }
}

/**
 * [Adapter Wrapper] DashboardObserver
 * 這裡展示了轉接器模式的另一種應用：
 * 透過建構出 DashboardAdapter 物件，來達成介面轉換。
 */
export class DashboardObserver implements IObserver {
    constructor(
        private updateStatsFn: (stats: DashboardAdapter) => void,
        private total: number
    ) { }

    update(event: NotificationEvent): void {
        // 直接將 Adaptee (event) 丟進 Adapter 的建構子
        // 產生出符合 UI 期待的物件
        const adaptedStats = new DashboardAdapter(event, this.total);
        this.updateStatsFn(adaptedStats);
    }
}
