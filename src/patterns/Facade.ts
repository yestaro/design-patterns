// =============================================================================
// --- [Facade Pattern] Complexity Hider ---
// =============================================================================

import {
    TagCommand, DeleteCommand, SortCommand,
    CopyCommand, PasteCommand, MoveCommand, commandInvokerInstance,
    CommandInvoker, SortState
} from './Command';
import { LabelSortStrategy, AttributeSortStrategy } from './Strategy';
import { DirectoryComposite, EntryComponent, WordDocument, ImageFile, PlainText } from './Composite';
import { tagMediator, TagMediator } from './Mediator';
import { StatisticsVisitor, FileSearchVisitor, FinderVisitor, BaseVisitor, StatisticsResults } from './Visitor';
import { XmlExporterTemplate } from './Template';
import { Clipboard } from './Singleton';
import { IObserver, NotificationEvent } from './Observer';
import { Label } from './Flyweight';

export class FileSystemFacade {
    private invoker: CommandInvoker;
    private clipboard: Clipboard;
    public mediator: TagMediator;

    constructor(public root: EntryComponent) {
        this.invoker = commandInvokerInstance;
        this.clipboard = Clipboard.getInstance();
        this.mediator = tagMediator;
    }

    /**
     * 獲取樣本根目錄
     */
    public static getSampleRoot(): EntryComponent {
        const root = new DirectoryComposite('root', '我的根目錄', '2025-01-01');
        const d1 = new DirectoryComposite('d1', '專案文件', '2025-01-10');

        d1.add(new WordDocument('f1', '產品開發規畫.docx', 500, '2025-01-10', 35));
        d1.add(new WordDocument('f_api', 'API介面定義書.docx', 120, '2025-01-12', 12));
        d1.add(new ImageFile('f2', '架構設計圖.png', 2048, '2025-01-10', 1920, 1080));

        const d2 = new DirectoryComposite('d2', '個人備份', '2025-01-15');
        d2.add(new PlainText('f3', '密碼記事.txt', 1, '2025-01-15', 'UTF-8'));

        const d2_1 = new DirectoryComposite('d2_1', '2025旅遊', '2025-01-20');
        d2_1.add(new WordDocument('f4', '行程規劃.docx', 200, '2025-01-20', 5));
        d2.add(d2_1);

        root.add(d1);
        root.add(d2);
        root.add(new PlainText('f5', 'README.txt', 0.5, '2025-01-01', 'ASCII'));

        return root;
    }

    /**
     * 計算總項目數 (Helper for UI to init DashboardObserver)
     */
    totalItems(): number {
        const visitor = new StatisticsVisitor();
        this.root.accept(visitor);
        return visitor.totalNodes;
    }

    /**
     * 計算檔案大小
     * @returns {Promise<number>} 總大小 (KB)
     */
    async calculateSize(observers: IObserver[] = []): Promise<number> {
        const visitor = new StatisticsVisitor();
        await this._runVisitor(visitor, 'SIZE', observers);
        return visitor.totalSize;
    }

    /**
     * 取得進階統計資訊
     */
    async getDetailedStats(groupByExt = true, observers: IObserver[] = []): Promise<StatisticsResults> {
        const visitor = new StatisticsVisitor(groupByExt);
        await this._runVisitor(visitor, 'STATS', observers);
        return visitor.getResults();
    }

    /**
     * 搜尋檔案
     * @returns {Promise<string[]>} 符合的檔案 ID 列表
     */
    async searchFiles(keyword: string, observers: IObserver[] = []): Promise<string[]> {
        const visitor = new FileSearchVisitor(keyword);
        await this._runVisitor(visitor, 'SEARCH', observers);
        return visitor.foundIds;
    }

    /**
     * 匯出 XML
     * @returns {Promise<string>} XML 字串
     */
    async exportXml(observers: IObserver[] = []): Promise<string> {
        const visitor = new XmlExporterTemplate();
        await this._runVisitor(visitor, 'XML', observers);
        return visitor.getResult();
    }

    /**
     * 通用 Visitor 執行邏輯 (Internal Helper)
     */
    private async _runVisitor(visitor: BaseVisitor, typeName: string, observers: IObserver[]): Promise<void> {
        const totalNodes = this.totalItems();
        const buffer: NotificationEvent[] = [];

        const collector: IObserver = {
            update: (event: NotificationEvent) => {
                buffer.push({
                    source: event.source,
                    type: event.type,
                    message: event.message,
                    data: {
                        currentNode: event.data?.currentNode || '-',
                        count: event.data?.count || 0,
                        total: totalNodes,
                        nodeType: event.data?.nodeType || '-'
                    }
                });
            }
        };

        visitor.notifier.subscribe(collector);
        this.root.accept(visitor);

        if (buffer.length > 0) {
            const startEvent: NotificationEvent = {
                source: 'system',
                type: 'progress',
                message: `[System] 開始執行 ${typeName}...`
            };
            observers.forEach(o => o.update(startEvent));

            for (const item of buffer) {
                observers.forEach(o => o.update(item));
                await new Promise(r => setTimeout(r, 60));
            }
        }
    }

    // =========================================================================
    // --- [Command Operations] ---
    // =========================================================================

    undo(): void {
        this.invoker.undo();
    }

    redo(): void {
        this.invoker.redo();
    }

    tagItem(id: string, labelName: string): void {
        this.invoker.execute(new TagCommand(this.mediator, id, labelName));
    }

    removeTag(id: string, labelName: string): void {
        this.invoker.execute(new TagCommand(this.mediator, id, labelName, false));
    }

    deleteItem(id: string): void {
        const parent = this.findParent(id);
        if (parent && id !== 'root') {
            this.invoker.execute(new DeleteCommand(id, parent));
        }
    }

    copyItem(id: string): void {
        this.invoker.execute(new CopyCommand(id, this.root));
    }

    pasteItem(targetId: string | null): void {
        const targetNode = targetId ? this.findItem(targetId) : this.root;
        let destinationDir: DirectoryComposite | null = null;

        if (targetNode instanceof DirectoryComposite) {
            destinationDir = targetNode;
        } else if (targetId) {
            destinationDir = this.findParent(targetId);
        }

        if (destinationDir && this.clipboard.hasContent()) {
            this.invoker.execute(new PasteCommand(destinationDir));
        }
    }

    /**
     * 移動項目到目標目錄
     * @param sourceId 來源項目 ID
     * @param destinationId 目標目錄 ID
     * @returns 是否成功移動
     */
    moveItem(sourceId: string, destinationId: string): boolean {
        // 不可移動到自身
        if (sourceId === destinationId) return false;
        // 不可移動根節點
        if (sourceId === 'root') return false;

        const sourceEntry = this.findItem(sourceId);
        const sourceParent = this.findParent(sourceId);
        const destEntry = this.findItem(destinationId);

        if (!sourceEntry || !sourceParent || !destEntry) return false;
        // 目標必須是目錄
        if (!(destEntry instanceof DirectoryComposite)) return false;
        // 已在同一目錄中則跳過
        if (sourceParent.id === destEntry.id) return false;

        // 循環檢查：不可將目錄移動到自己的子節點中
        if (sourceEntry instanceof DirectoryComposite) {
            const finder = new FinderVisitor(destinationId);
            sourceEntry.accept(finder);
            if (finder.foundSelf) return false;
        }

        this.invoker.execute(new MoveCommand(sourceId, sourceParent, destEntry));
        return true;
    }

    sortItems(attribute: string, currentSortState: SortState): SortState {
        const nextDir: 'asc' | 'desc' = (currentSortState.attr === attribute && currentSortState.dir === 'asc') ? 'desc' : 'asc';

        const getStrategy = (attr: string, dir: 'asc' | 'desc') =>
            (attr === 'label' ? new LabelSortStrategy(this.mediator, dir) : new AttributeSortStrategy(attr, dir));

        const oldStrategy = getStrategy(currentSortState.attr, currentSortState.dir);
        const newStrategy = getStrategy(attribute, nextDir);
        const nextState: SortState = { attr: attribute, dir: nextDir };

        this.invoker.execute(
            new SortCommand(this.root, oldStrategy, newStrategy, currentSortState, nextState)
        );

        return nextState;
    }

    // =========================================================================
    // --- [Helper / Query Methods] ---
    // =========================================================================

    findItem(id: string): EntryComponent | null {
        if (!this.root) return null;
        const visitor = new FinderVisitor(id);
        this.root.accept(visitor);
        return visitor.foundSelf;
    }

    findParent(targetId: string): DirectoryComposite | null {
        if (!this.root || this.root.id === targetId) return null;
        const visitor = new FinderVisitor(targetId);
        this.root.accept(visitor);
        return visitor.foundParent;
    }

    getLabels(id: string): Label[] {
        return this.mediator.getLabels(id);
    }

    getClipboardStatus(): boolean {
        return this.clipboard.hasContent();
    }
}
