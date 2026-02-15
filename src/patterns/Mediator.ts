// --- Mediator ---
import { labelFactory, Label } from './Flyweight';

/**
 * TagMediator (中介者 - Mediator)
 */
export class TagMediator {
    private fileToLabels: Map<string, Set<string>> = new Map();
    private labelToFiles: Map<string, Set<string>> = new Map();

    attach(fileId: string, labelName: string): void {
        if (!this.fileToLabels.has(fileId)) {
            this.fileToLabels.set(fileId, new Set());
        }
        this.fileToLabels.get(fileId)!.add(labelName);

        if (!this.labelToFiles.has(labelName)) {
            this.labelToFiles.set(labelName, new Set());
        }
        this.labelToFiles.get(labelName)!.add(fileId);
    }

    detach(fileId: string, labelName: string): void {
        this.fileToLabels.get(fileId)?.delete(labelName);
        this.labelToFiles.get(labelName)?.delete(fileId);
    }

    /**
     * 透過 ID 取得該檔案的所有標籤物件 (從 Flyweight Factory 拿)
     */
    getLabels(fileId: string): Label[] {
        const names = this.fileToLabels.get(fileId);
        return names ? Array.from(names).map(n => labelFactory.getLabel(n)) : [];
    }

    /**
     * 透過標籤名稱取得所有檔案 ID (O(1) 反向查詢)
     */
    getFiles(labelName: string): string[] {
        const ids = this.labelToFiles.get(labelName);
        return ids ? Array.from(ids) : [];
    }
}

export const tagMediator = new TagMediator();
