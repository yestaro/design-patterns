// =============================================================================
// --- [Visitor Implementation] ---
// =============================================================================

import { Subject, BaseObserver } from './Observer';

/**
 * BaseVisitor (訪問者介面)
 *
 * 定義了對不同類型節點 (File, Directory) 的訪問操作。
 * [核心概念] Double Dispatch (雙重分派)
 * 1. 呼叫端呼叫 element.accept(visitor)
 * 2. 元素內部呼叫 visitor.visitElement(this)
 * 這樣 Visitor 就確切知道現在處理的是哪個具體類別 (resolved type)。
 */
export class BaseVisitor {
    constructor() {
        this.notifier = new Subject(); // 使用組合 (Has-a) Observer Pattern
        this.processedCount = 0;
    }

    /**
     * 發送狀態通知給訂閱者 (UI)
     */
    changeState(message, currentNode) {
        this.processedCount++;
        this.notifier.notify({ message, currentNode: currentNode.name, count: this.processedCount, type: currentNode.type });
    }

    visitFile(file) { }
    visitDirectory(dir) { }
}

/**
 * NodeCountVisitor
 * 
 * [功能] 計算總節點數。
 * [優點] 將計算邏輯從資料結構 (Filesystem) 中抽離。
 */
export class NodeCountVisitor extends BaseVisitor {
    constructor() { super(); this.total = 0; }
    visitFile(file) { this.total++; }
    visitDirectory(dir) { this.total++; dir.getChildren().forEach(c => c.accept(this)); }
}

/**
 * SizeCalculatorVisitor
 * 
 * [功能] 遞迴計算資料夾總大小 (KB)。
 * 透過遞迴呼叫 dir.getChildren().forEach(c => c.accept(this)) 來走訪整棵樹。
 */
export class SizeCalculatorVisitor extends BaseVisitor {
    constructor() { super(); this.totalSize = 0; }
    visitFile(file) { this.totalSize += file.size; this.changeState(`計算檔案: ${file.name}`, file); }
    visitDirectory(dir) { this.changeState(`進入目錄: ${dir.name}`, dir); dir.getChildren().forEach(c => c.accept(this)); }
}

/**
 * FileSearchVisitor
 *
 * [功能] 關鍵字搜尋。
 * 將符合的檔案 ID 收集到 foundIds 陣列中。
 */
export class FileSearchVisitor extends BaseVisitor {
    constructor(keyword) { super(); this.keyword = keyword.toLowerCase(); this.foundIds = []; }
    visitFile(file) {
        if (file.name.toLowerCase().includes(this.keyword)) { this.foundIds.push(file.id); this.changeState(`[符合] ${file.name}`, file); }
        else this.changeState(`掃描檔案: ${file.name}`, file);
    }
    visitDirectory(dir) { this.changeState(`搜尋目錄: ${dir.name}`, dir); dir.getChildren().forEach(c => c.accept(this)); }
}

/**
 * XmlExportVisitor
 *
 * [功能] 將檔案結構轉換為 XML 字串。
 * [特色] 利用 depth 屬性來控制縮排 (Indentation)，展現 Visitor 如何維護走訪過程中的狀態。
 */
export class XmlExportVisitor extends BaseVisitor {
    constructor() { super(); this.xml = '<?xml version="1.0" encoding="UTF-8"?>\n'; this.depth = 0; }
    visitFile(file) { this.xml += `${"  ".repeat(this.depth)}<File Name="${file.name}" Size="${file.size}KB" />\n`; this.changeState(`產出標籤: ${file.name}`, file); }
    visitDirectory(dir) {
        this.xml += `${"  ".repeat(this.depth)}<Directory Name="${dir.name}">\n`;
        this.changeState(`開啟目錄: ${dir.name}`, dir);
        this.depth++; dir.getChildren().forEach(c => c.accept(this)); this.depth--;
        this.xml += `${"  ".repeat(this.depth)}</Directory>\n`;
    }
}

/**
 * FinderVisitor
 * 
 * [功能] 根據 ID 尋找特定節點。
 * [優點] 取代 ad-hoc 的遞迴搜尋函式，統一使用 Visitor Pattern 走訪結構。
 */
export class FinderVisitor extends BaseVisitor {
    constructor(targetId) { super(); this.targetId = targetId; this.foundNode = null; }
    visitFile(file) {
        if (file.id === this.targetId) this.foundNode = file;
    }
    visitDirectory(dir) {
        if (this.foundNode) return; // 已找到則提早結束 (優化)
        if (dir.id === this.targetId) { this.foundNode = dir; return; }

        // 繼續往子層找
        for (let child of dir.getChildren()) {
            if (this.foundNode) break;
            child.accept(this);
        }
    }
}
