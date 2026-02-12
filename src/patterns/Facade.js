
// =============================================================================
// --- [Facade Pattern] Complexity Hider ---
// =============================================================================

import { TagCommand, DeleteCommand, SortCommand, CopyCommand, PasteCommand, commandInvokerInstance } from './Command';
import { LabelSortStrategy, AttributeSortStrategy } from './Strategy';
import { DirectoryComposite } from './Composite';
import { tagMediator } from './Mediator';
import { NodeCountVisitor, SizeCalculatorVisitor, FileSearchVisitor, XmlExportVisitor, FinderVisitor } from './Visitor';
import { clipboardInstance } from './Singleton';

// ...

export class ExplorerFacade {
    constructor(root) {
        this.root = root;
        this.invoker = commandInvokerInstance;
        this.clipboard = clipboardInstance;
        this.mediator = tagMediator;
    }


    /**
     * 計算總項目數 (Helper for UI to init DashboardObserver)
     */
    totalItems() {
        const countVisitor = new NodeCountVisitor();
        this.root.accept(countVisitor);
        return countVisitor.total;
    }

    /**
     * 計算檔案大小
     * @returns {Promise<number>} 總大小 (KB)
     */
    async calculateSize(observers = []) {
        const visitor = new SizeCalculatorVisitor();
        await this._runVisitor(visitor, 'SIZE', observers);
        return visitor.totalSize;
    }

    /**
     * 搜尋檔案
     * @returns {Promise<string[]>} 符合的檔案 ID 列表
     */
    async searchFiles(keyword, observers = []) {
        const visitor = new FileSearchVisitor(keyword);
        await this._runVisitor(visitor, 'SEARCH', observers);
        return visitor.foundIds;
    }

    /**
     * 匯出 XML
     * @returns {Promise<string>} XML 字串
     */
    async exportXml(observers = []) {
        const visitor = new XmlExportVisitor();
        await this._runVisitor(visitor, 'XML', observers);
        return visitor.xml;
    }

    /**
     * 通用 Visitor 執行邏輯 (Internal Helper)
     * [Refactored] 接收外部傳入的 Observers 陣列，並負責派送事件
     */
    async _runVisitor(visitor, typeName, observers) {
        // 先計算總數 (雖然 UI 可能已經算過，但這裡為了資料完整性再算一次或重複利用)
        const totalNodes = this.totalItems();

        // Buffer 機制: 收集 Visitor 的事件
        const buffer = [];

        const collector = {
            update: (data) => {
                buffer.push({
                    message: data.message, // 這是 Raw Log
                    // 包裝成完整資訊供 Dashboard 使用
                    stats: {
                        name: data.currentNode || '-',
                        count: data.count || 0,
                        total: totalNodes,
                        type: data.type || '-'
                    }
                });
            }
        };

        visitor.notifier.subscribe(collector);

        // 執行 Visitor (同步執行，但收集事件)
        this.root.accept(visitor);

        // 模擬動畫並通知外部 Observers
        if (buffer.length > 0) {
            // 發送系統開始訊息
            observers.forEach(o => o.update({ message: `[System] 開始執行 ${typeName}...` }));

            for (const item of buffer) {
                // 通知所有觀察者
                // Observer 現在能夠自行從 Payload 中提取所需資料
                // ConsoleObserver -> item.message
                // DashboardObserver -> item.stats 或 item
                observers.forEach(o => o.update(item));

                await new Promise(r => setTimeout(r, 60));
            }
        }
    }

    // =========================================================================
    // --- [Command Operations] ---
    // =========================================================================

    undo() {
        this.invoker.undo();
        // Log is handled by global notifier in UI
    }

    redo() {
        this.invoker.redo();
        // Log is handled by global notifier in UI
    }

    tagItem(id, labelName) {
        // 這裡簡化了邏輯：直接視為「貼標籤」，如果需要移除則可以擴充 toggle 邏輯，
        // 但原本 UI 是用按鈕直接觸發 TagCommand(attach)。
        // 這裡假設都為 attach，為了對應原本的 UI 邏輯。
        // 原本: new TagCommand(tagMediator, selectedId, lbl, forceUpdate)
        this.invoker.execute(new TagCommand(this.mediator, id, labelName));
    }

    removeTag(id, labelName) {
        this.invoker.execute(new TagCommand(this.mediator, id, labelName, false));
    }

    deleteItem(id) {
        // [Logic Encapsulation] 尋找父節點的邏輯被封裝在 Facade 內部
        // UI 不需要知道 "刪除檔案需要先找到它的父目錄" 這件事
        const parent = this.findParent(id);
        // 如果是 root 則不能刪除 (通常 UI 會擋，這裡雙重確認)
        if (parent && id !== 'root') {
            this.invoker.execute(new DeleteCommand(id, parent));
        }
    }

    copyItem(id) {
        this.invoker.execute(new CopyCommand(id, this.root, this.clipboard));
    }

    pasteItem(targetId) { // targetId 可以是當前選中的目錄 ID，或檔案 ID (則貼到其父目錄)
        const targetNode = targetId ? this.findItem(targetId) : this.root;
        let destinationDir = null;

        if (targetNode instanceof DirectoryComposite) {
            destinationDir = targetNode;
        } else {
            // 如果選中的是檔案，則貼到同一層 (父目錄)
            destinationDir = this.findParent(targetId) || this.root;
        }

        if (destinationDir && this.clipboard.hasContent()) {
            this.invoker.execute(new PasteCommand(destinationDir, this.clipboard));
        }
    }

    sortItems(attribute, currentSortState, setSortStateCallback) {
        // currentSortState: { attr: 'name', dir: 'asc' }
        const nextDir = (currentSortState.attr === attribute && currentSortState.dir === 'asc') ? 'desc' : 'asc';

        // [Strategy Factory] 根據屬性決定策略
        const getStrategy = (attr, dir) =>
            (attr === 'label' ? new LabelSortStrategy(this.mediator, dir) : new AttributeSortStrategy(attr, dir));

        const oldStrategy = getStrategy(currentSortState.attr, currentSortState.dir);
        const newStrategy = getStrategy(attribute, nextDir);

        const nextState = { attr: attribute, dir: nextDir };

        this.invoker.execute(
            new SortCommand(
                this.root,
                oldStrategy,
                newStrategy,
                setSortStateCallback, // 這裡需要 callback 來更新 React State
                currentSortState,
                nextState
            )
        );

        return nextState; // 回傳新狀態供 UI 更新 (雖然 SortCommand 也會更新，但這樣雙重確保)
    }

    // =========================================================================
    // --- [Helper / Query Methods] ---
    // =========================================================================

    /**
     * 尋找項目
     * [Refactor] 使用 Visitor 取代遞迴函式，統一遍歷邏輯
     */
    findItem(id) {
        if (!this.root) return null;
        const visitor = new FinderVisitor(id);
        this.root.accept(visitor);
        // 如果 FinderVisitor 本身也是找自己 (node.id === id)，在 accept 第一層就會設定 foundSelf
        // 但我們這裡的用法是 node.accept(visitor)，如果是 DirectoryComposite，它會遞迴下去
        // 如果是 File，visitor.visitFile 會檢查
        return visitor.foundSelf;
    }

    /**
     * 尋找父節點
     * [Refactor] 使用 Visitor 取代遞迴函式
     */
    findParent(targetId) {
        if (!this.root) return null;
        // 如果 targetId 是 root，那它沒有 parent (除非我們定義外部容器，但在這裡 root 是頂層)
        if (this.root.id === targetId) return null;

        const visitor = new FinderVisitor(targetId);
        this.root.accept(visitor);
        return visitor.foundParent;
    }

    getLabels(id) {
        return this.mediator.getLabels(id);
    }

    getClipboardStatus() {
        return this.clipboard.hasContent();
    }
}
