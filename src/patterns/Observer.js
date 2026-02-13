// =============================================================================
// --- [Infrastructure] 設計模式介面與基礎 ---
// =============================================================================

/**
 * NotificationEvent (通知事件介面)
 *
 * 定義所有 notify/update 傳遞的統一資料格式。
 * [為什麼?] 確保生產者 (Visitor, Command, Clipboard) 與消費者 (Observer)
 * 之間有明確的契約 (Contract)，避免產成難以追蹤的 ad-hoc 資料結構。
 *
 * @property {string} source  - 事件來源: 'command' | 'clipboard' | 'visitor'
 * @property {string} type    - 事件類型: 'executed' | 'undone' | 'redone' | 'set' | 'cleared' | 'progress'
 * @property {string} message - 顯示訊息 (供 Console Log 使用)
 * @property {Object} data    - 事件專屬資料 (依事件不同而異)
 */
export class NotificationEvent {
    constructor(source, type, message, data = {}) {
        this.source = source;
        this.type = type;
        this.message = message;
        this.data = data;
    }
}

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

    /**
     * 通知所有觀察者
     * @param {NotificationEvent} event - 統一格式的通知事件
     */
    notify(event) { this.observers.forEach(o => o.update(event)); }
}

/**
 * BaseObserver (觀察者介面)
 *
 * 定義接收通知的標準介面。
 */
export class BaseObserver {
    /**
     * 接收通知事件
     * @param {NotificationEvent} event - 統一格式的通知事件
     */
    update(event) { throw new Error("必須實作 update 方法"); }
}

// =============================================================================
// --- [Concrete Implementations] 具體實作 ---
// =============================================================================

/**
 * ConsoleObserver (控制台觀察者)
 * 負責將通知訊息寫入 UI 的 console 區域。
 * [Decorator 支援] 傳遞 { message, highlight, icon, bold }，讓多維度裝飾器的資訊都能傳達到 UI。
 */
export class ConsoleObserver extends BaseObserver {
    constructor(addLogFn) { super(); this.addLogFn = addLogFn; }
    update(event) {
        if (event.message) {
            this.addLogFn({
                message: event.message,
                highlight: event.highlight || '',
                icon: event.icon || '',
                bold: event.bold || false
            });
        }
    }
}

/**
 * DashboardObserver (儀表板觀察者)
 * 負責更新 UI 上方的即時進度條與統計數字。
 */
export class DashboardObserver extends BaseObserver {
    constructor(updateStatsFn, total) { super(); this.updateStatsFn = updateStatsFn; this.total = total; }
    update(data) {
        // [Refactor] 允許輸入資料為 { stats: ... } 結構，或直接為 stats 本身
        const source = data.stats || data;

        this.updateStatsFn({
            name: source.currentNode || '-',
            count: source.count || 0,
            total: this.total,
            type: source.nodeType || '-'
        });
    }
}
