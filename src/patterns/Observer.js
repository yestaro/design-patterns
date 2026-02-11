// =============================================================================
// --- [Infrastructure] 設計模式介面與基礎 ---
// =============================================================================

/**
 * Subject (被觀察者 / 主題)
 *
 * 負責維護觀察者清單，並在狀態改變時通知它們。
 * [特性]
 * 1. 鬆耦合: Subject 不知道 Observer 是誰 (UI? Console? File Logger?)，只知道它們有 update() 方法。
 * 2. 廣播機制: 一次事件可以觸發多個觀察者的反應。
 */
export class Subject {
    constructor() { this.observers = []; }

    subscribe(obs) { if (obs && typeof obs.update === 'function') this.observers.push(obs); }

    unsubscribe(obs) { this.observers = this.observers.filter(o => o !== obs); }

    notify(data) { this.observers.forEach(o => o.update(data)); }
}

/**
 * BaseObserver (觀察者介面)
 *
 * 定義接收通知的標準介面。
 */
export class BaseObserver {
    update(data) { throw new Error("必須實作 update 方法"); }
}

// =============================================================================
// --- [Concrete Implementations] 具體實作 ---
// =============================================================================

/**
 * ConsoleObserver (控制台觀察者)
 * 負責將通知訊息寫入 UI 的 console 區域。
 */
export class ConsoleObserver extends BaseObserver {
    constructor(addLogFn) { super(); this.addLogFn = addLogFn; }
    update(data) { if (data.message) this.addLogFn(data.message); }
}

/**
 * DashboardObserver (儀表板觀察者)
 * 負責更新 UI 上方的即時進度條與統計數字。
 */
export class DashboardObserver extends BaseObserver {
    constructor(updateStatsFn, total) { super(); this.updateStatsFn = updateStatsFn; this.total = total; }
    update(data) {
        this.updateStatsFn({
            name: data.currentNode || '-',
            count: data.count || 0,
            total: this.total,
            type: data.type || '-'
        });
    }
}
