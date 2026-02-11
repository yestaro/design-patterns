// --- Mediator ---
import { labelFactory } from './Flyweight';

/**
 * TagMediator (中介者 - Mediator)
 *
 * [核心職責]
 * 管理 File (多) 與 Label (多) 之間的複雜關聯 (Many-to-Many)。
 *
 * [為什麼?]
 * 如果檔案直接持有標籤陣列，而標籤也想知道自己貼在哪些檔案上，
 * 物件之間會產生強烈的網狀依賴，難以維護。
 *
 * Mediator 集中管理這些關係 (使用雙向 Map)，讓檔案與標籤彼此解耦。
 */
export class TagMediator {
    constructor() {
        // 反向索引: 透過標籤名快速找到所有檔案 (O(1))
        this.fileToLabels = new Map();
        this.labelToFiles = new Map();
    }

    attach(fileId, labelName) {
        if (!this.fileToLabels.has(fileId)) this.fileToLabels.set(fileId, new Set());
        this.fileToLabels.get(fileId).add(labelName);

        if (!this.labelToFiles.has(labelName)) this.labelToFiles.set(labelName, new Set());
        this.labelToFiles.get(labelName).add(fileId);
    }

    detach(fileId, labelName) {
        this.fileToLabels.get(fileId)?.delete(labelName);
        this.labelToFiles.get(labelName)?.delete(fileId);
    }

    /**
     * 透過 ID 取得該檔案的所有標籤物件 (從 Flyweight Factory 拿)
     */
    getLabels(fileId) {
        const names = this.fileToLabels.get(fileId);
        return names ? Array.from(names).map(n => labelFactory.getLabel(n)) : [];
    }

    /**
     * 透過標籤名稱取得所有檔案 ID (O(1) 反向查詢)
     */
    getFiles(labelName) {
        const ids = this.labelToFiles.get(labelName);
        return ids ? Array.from(ids) : [];
    }
}
export const tagMediator = new TagMediator();
