// =============================================================================
// --- [Facade Pattern] Complexity Hider ---
// =============================================================================

import {
    TagCommand, DeleteCommand, SortCommand,
    CopyCommand, PasteCommand, commandInvokerInstance,
    CommandInvoker, SortState
} from './Command';
import { LabelSortStrategy, AttributeSortStrategy } from './Strategy';
import { DirectoryComposite, EntryComponent } from './Composite';
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
        } else {
            // Implicit Root
            destinationDir = this.root as DirectoryComposite;
        }

        if (destinationDir && this.clipboard.hasContent()) {
            this.invoker.execute(new PasteCommand(destinationDir));
        }
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
