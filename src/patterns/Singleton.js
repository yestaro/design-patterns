import { Subject } from "./Observer";

// =============================================================================
// --- [Singleton] 單例模式 ---
// =============================================================================

/**
 * Clipboard (剪貼簿)
 *
 * 實作 Singleton 模式，確保全域只有一個剪貼簿實例。
 * 用於存放透過 Prototype 模式複製的物件原型。
 * 
 * [改進] 使用 Observer 模式通知狀態變更，而非直接 console.log
 */
class Clipboard {
    static instance = null;

    constructor() {
        if (Clipboard.instance) {
            throw new Error("Use Clipboard.getInstance()");
        }
        this._content = null;
        this.notifier = new Subject();
        Clipboard.instance = this;
    }

    static getInstance() {
        if (!Clipboard.instance) {
            Clipboard.instance = new Clipboard();
        }
        return Clipboard.instance;
    }

    /**
     * 設定剪貼簿內容 (Prototype)
     * @param {EntryComponent} component
     */
    set(component) {
        this._content = component;
        // 通知訂閱者 (例如 ExplorerTab，雖然目前它是靠 forceUpdate，但這是更 decoupled 的做法)
        this.notifier.notify({
            type: 'clipboard_set',
            name: component.name,
            message: `[Clipboard] Copied: ${component.name}`
        });
    }

    /**
     * 取得剪貼簿內容的"副本" (Clone)
     * Client 從剪貼簿拿出來的永遠是新的實例，
     * 這樣就可以無限貼上而不影響原始物件。
     * @returns {EntryComponent|null}
     */
    get() {
        if (!this._content) return null;
        return this._content.clone(); // 關鍵：回傳的是 clone，不是原本的 reference
    }

    hasContent() {
        return this._content !== null;
    }

    clear() {
        this._content = null;
        this.notifier.notify({ type: 'clipboard_cleared' });
    }
}

// 全域唯一實例
export const clipboardInstance = Clipboard.getInstance();
