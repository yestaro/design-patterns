import { Subject } from "./Observer";
import type { EntryComponent } from "./Composite";

// =============================================================================
// --- [Singleton] 單例模式 ---
// =============================================================================

/**
 * Clipboard (剪貼簿)
 */
export class Clipboard {
    private static instance: Clipboard | null = null;
    private _content: EntryComponent | null = null;
    public notifier: Subject;

    private constructor() {
        this.notifier = new Subject();
    }

    public static getInstance(): Clipboard {
        if (!Clipboard.instance) {
            Clipboard.instance = new Clipboard();
        }
        return Clipboard.instance;
    }

    /**
     * 設定剪貼簿內容 (Prototype)
     */
    set(component: EntryComponent): void {
        this._content = component;
        this.notifier.notify({
            source: 'clipboard',
            type: 'set',
            message: `[Clipboard] Copied: ${component.name}`,
            data: { name: component.name }
        });
    }

    /**
     * 取得剪貼簿內容的"副本" (Clone)
     */
    get(): EntryComponent | null {
        if (!this._content) return null;
        return this._content.clone();
    }

    hasContent(): boolean {
        return this._content !== null;
    }

    clear(): void {
        this._content = null;
        this.notifier.notify({ source: 'clipboard', type: 'cleared', message: '[Clipboard] Cleared' });
    }
}
