// =============================================================================
// --- [Composite] 結構實作 ---
// =============================================================================

import { BaseVisitor } from "./Visitor";

/**
 * EntryComponent (抽象元件)
 *
 * 定義了檔案系統中所有物件的共通介面 (Interface)。
 * [為什麼?] 讓 Client (如 UI 或 Visitor) 不需要知道現在處理的是檔案還是目錄，
 * 只要呼叫共通方法 (如 accept, name, size) 即可。這就是多型 (Polymorphism) 的威力。
 */
export class EntryComponent {
    constructor(id, name, type, size, created) {
        this.id = id; this.name = name; this.type = type; this.size = size; this.created = created;
        this.attributes = { iconType: 'File' }; // 預設屬性
    }
    /**
     * 接受訪問者 (Double Dispatch 的第一步)
     * @param {BaseVisitor} visitor
     */
    accept(visitor) { throw new Error("Abstract Method"); }

    /**
     * 原型模式 (Prototype Pattern) - 複製自身
     * @returns {EntryComponent} 新的實例
     */
    clone() { throw new Error("Abstract Method"); }
}

/**
 * FileLeaf (葉節點基底類別)
 *
 * 代表基本的檔案，沒有子節點。
 * [注意] 這是一個抽象類別 (Abstract Class)，不應直接實例化。
 * 請使用 WordDocument, ImageFile, TextFile 等具體類別。
 */
export class FileLeaf extends EntryComponent {
    constructor(id, name, type, size, created) {
        super(id, name, type, Number(size), created);
        if (new.target === FileLeaf) {
            throw new Error("FileLeaf is an abstract class and cannot be instantiated directly.");
        }
    }
    accept(visitor) { visitor.visitFile(this); }

    /**
     * 實作 Clone
     * 這裡演示了 Prototype 的精髓：不需要知道具體 Class (Word, Image...)，
     * 只要呼叫 clone()，多型機制會確保產生正確的類型副本。
     */
    clone() {
        throw new Error("Must implement clone in subclass");
    }
}

/**
 * DirectoryComposite (目錄組合節點)
 *
 * 實作複合模式 (Composite Pattern) 的容器角色。
 * 它可以包含其他的 FileLeaf 或 DirectoryComposite。
 *
 * [核心設計]
 * 1. 私有屬性 (#children): 強制封裝，外部無法直接操作陣列，只能透過 add/remove/sort 等公開方法。
 *    這確保了內部狀態的一致性 (例如排序規則)。
 * 2. 遞歸結構: 繼承自 EntryComponent，使得 Client 可以一致地對待檔案與目錄。
 */
export class DirectoryComposite extends EntryComponent {
    /** @type {EntryComponent[]} - 子節點列表 */
    #children = [];
    /** @type {BaseStrategy} - 當前的排序策略 */
    #activeStrategy = null;

    constructor(id, name, created) {
        super(id, name, 'Directory', 0, created);
        this.attributes = { iconType: 'Folder' };
    }

    /**
     * 新增子節點，並立即套用目前的排序策略。
     * @param {EntryComponent} child
     */
    add(child) {
        this.#children.push(child);
        this.#applySort();
    }

    remove(childId) { this.#children = this.#children.filter(c => c.id !== childId); }

    /**
     * 取得子節點的"副本"。
     * [為什麼?] 為了防禦性編程 (Defensive Copy)。如果直接回傳 this.#children，
     * 外部可能會不經意地使用 sort() 或 push() 修改內部狀態，破壞封裝。
     */
    getChildren() { return [...this.#children]; }

    /**
     * 設定並執行排序策略。
     * [為什麼?] 策略模式 (Strategy Pattern) 的應用，讓排序邏輯可以動態切換，
     * 而不需修改 DirectoryComposite 的程式碼 (Open-Closed Principle)。
     */
    sort(strategy) {
        this.#activeStrategy = strategy;
        this.#applySort();
    }

    #applySort() {
        if (this.#activeStrategy) {
            this.#activeStrategy.sort(this.#children);
        }
    }

    /**
     * 接受訪問者
     * @param {BaseVisitor} visitor 
     */
    accept(visitor) { visitor.visitDirectory(this); }

    /**
     * 目錄的 Clone (深拷貝 Deep Copy)
     * Prototype 模式在複合結構中的應用：遞歸複製整棵樹。
     */
    clone() {
        const newId = `${this.id}_copy_${Date.now()}`;
        const clone = new DirectoryComposite(newId, `Copy of ${this.name}`, new Date().toISOString().split('T')[0]);

        // 遞歸複製所有子節點
        this.#children.forEach(child => {
            const childClone = child.clone();
            clone.add(childClone);
        });

        return clone;
    }
}

// =============================================================================
// --- [Concrete Implementations] 具體檔案類型 ---
// =============================================================================

/** Word 文件 */
export class WordDocument extends FileLeaf {
    constructor(id, name, size, created, pageCount = 1) {
        super(id, name, 'Word', size, created);
        this.pageCount = pageCount;
        this.attributes = {
            iconType: 'FileText',
            pages: pageCount
        };
    }

    clone() {
        const newId = `${this.id}_copy_${Date.now()}`;
        return new WordDocument(newId, `Copy of ${this.name}`, this.size, new Date().toISOString().split('T')[0], this.pageCount);
    }
}

/** 圖片檔案 */
export class ImageFile extends FileLeaf {
    constructor(id, name, size, created, width = 800, height = 600) {
        super(id, name, 'Image', size, created);
        this.width = width;
        this.height = height;
        this.attributes = {
            iconType: 'ImageIcon',
            res: `${width}x${height}`
        };
    }

    clone() {
        const newId = `${this.id}_copy_${Date.now()}`;
        return new ImageFile(newId, `Copy of ${this.name}`, this.size, new Date().toISOString().split('T')[0], this.width, this.height);
    }
}

/** 純文字檔案 */
export class PlainText extends FileLeaf {
    constructor(id, name, size, created, encoding = 'UTF-8') {
        super(id, name, 'Text', size, created);
        this.encoding = encoding;
        this.attributes = {
            iconType: 'File',
            enc: encoding
        };
    }

    clone() {
        const newId = `${this.id}_copy_${Date.now()}`;
        return new PlainText(newId, `Copy of ${this.name}`, this.size, new Date().toISOString().split('T')[0], this.encoding);
    }
}
