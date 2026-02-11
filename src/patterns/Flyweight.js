// --- Flyweight ---

/**
 * Label (享元物件 - Flyweight)
 *
 * 代表一個標籤實體。
 * [特性] 這個物件是「不可變的 (Immutable)」且被共享的。
 * 系統中可能有 1000 個檔案標記為 'Urgent'，但記憶體中只有這 1 個 Label 實體。
 */
export class Label { constructor(name, color) { this.name = name; this.color = color; } }

/**
 * LabelFactory (享元工廠)
 *
 * 負責管理與快取 (Cache) Label 物件。
 * [為什麼?] 確保對於同名的標籤，永遠只回傳同一個實體 (Singleton Instance per key)。
 * 這大幅減少了記憶體佔用。
 */
export class LabelFactory {
    constructor() { this.labels = {}; }

    /**
     * 取得標籤 (若無則建立)
     * @param {string} name 標籤名稱
     */
    getLabel(name) {
        const colors = { 'Urgent': 'bg-red-500', 'Work': 'bg-blue-500', 'Personal': 'bg-green-500' };
        // 如果快取中有，直接回傳 (Hit Cache)
        if (!this.labels[name]) {
            // 如果沒有，才建立新的 (Lazy Initialization)
            this.labels[name] = new Label(name, colors[name] || 'bg-slate-500');
        }
        return this.labels[name];
    }
}
export const labelFactory = new LabelFactory();
