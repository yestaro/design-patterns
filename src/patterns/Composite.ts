// =============================================================================
// --- [Composite] 結構實作 ---
// =============================================================================

import type { BaseVisitor } from "./Visitor";

/**
 * 排序策略介面 (ISortStrategy)
 */
export interface ISortStrategy {
    sort(entries: EntryComponent[]): void;
}

export interface EntryAttributes {
    [key: string]: any;
}

/**
 * EntryComponent (抽象元件)
 */
export abstract class EntryComponent {
    public attributes: EntryAttributes;

    constructor(
        public id: string,
        public name: string,
        public type: string,
        public size: number,
        public created: string
    ) {
        this.attributes = {};
    }

    /**
     * 多型支援：定義副檔名介面於基底類別
     * 預設回傳空字串 (適合目錄或無副檔名檔案)
     */
    get extension(): string {
        return "";
    }

    abstract accept(visitor: BaseVisitor): void;
    abstract clone(): EntryComponent;
}

/**
 * FileLeaf (葉節點基底類別)
 */
export abstract class FileLeaf extends EntryComponent {
    constructor(id: string, name: string, type: string, size: number | string, created: string) {
        super(id, name, type, Number(size), created);
    }

    /**
     * 在 File 層級實作真實的副檔名邏輯
     */
    override get extension(): string {
        const parts = this.name.split('.');
        return parts.length > 1 ? parts.pop()?.toLowerCase() || "" : "";
    }

    override accept(visitor: BaseVisitor): void {
        visitor.visitFile(this);
    }

    abstract override clone(): FileLeaf;
}

/**
 * DirectoryComposite (目錄組合節點)
 */
export class DirectoryComposite extends EntryComponent {
    private children: EntryComponent[] = [];
    private activeStrategy: ISortStrategy | null = null;

    constructor(id: string, name: string, created: string) {
        super(id, name, 'Directory', 0, created);
        this.attributes = {};
    }

    add(child: EntryComponent): void {
        this.children.push(child);
        this.applySort();
    }

    remove(childId: string): void {
        this.children = this.children.filter(c => c.id !== childId);
    }

    getChildren(): EntryComponent[] {
        return [...this.children];
    }

    sort(strategy: ISortStrategy): void {
        this.activeStrategy = strategy;
        this.applySort();
    }

    private applySort(): void {
        if (this.activeStrategy) {
            this.activeStrategy.sort(this.children);
        }
    }

    override accept(visitor: BaseVisitor): void {
        visitor.visitDirectory(this);
    }

    override clone(): DirectoryComposite {
        const newId = `${this.id}_copy_${Date.now()}`;
        const clone = new DirectoryComposite(newId, `Copy of ${this.name}`, new Date().toISOString().split('T')[0]);

        this.children.forEach(child => {
            clone.add(child.clone());
        });

        return clone;
    }
}
// ... 下方 WordDocument, ImageFile 等保持不變 ...
export class WordDocument extends FileLeaf {
    public pageCount: number;
    constructor(id: string, name: string, size: number, created: string, pageCount = 1) {
        super(id, name, 'Word', size, created);
        this.pageCount = pageCount;
        this.attributes = { pages: pageCount };
    }
    override clone(): WordDocument {
        const newId = `${this.id}_copy_${Date.now()}`;
        return new WordDocument(newId, `Copy of ${this.name}`, this.size, new Date().toISOString().split('T')[0], this.pageCount);
    }
}

export class ImageFile extends FileLeaf {
    constructor(id: string, name: string, size: number, created: string, public width = 800, public height = 600) {
        super(id, name, 'Image', size, created);
        this.attributes = { res: `${width}x${height}` };
    }
    override clone(): ImageFile {
        const newId = `${this.id}_copy_${Date.now()}`;
        return new ImageFile(newId, `Copy of ${this.name}`, this.size, new Date().toISOString().split('T')[0], this.width, this.height);
    }
}

export class PlainText extends FileLeaf {
    constructor(id: string, name: string, size: number, created: string, public encoding = 'UTF-8') {
        super(id, name, 'Text', size, created);
        this.attributes = { enc: encoding };
    }
    override clone(): PlainText {
        const newId = `${this.id}_copy_${Date.now()}`;
        return new PlainText(newId, `Copy of ${this.name}`, this.size, new Date().toISOString().split('T')[0], this.encoding);
    }
}
