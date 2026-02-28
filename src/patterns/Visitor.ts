// =============================================================================
// --- [Visitor Implementation] ---
// =============================================================================

import { Subject, NotificationEvent } from './Observer';
import type { EntryComponent, FileLeaf, DirectoryComposite } from './Composite';

/**
 * BaseVisitor (訪問者介面)
 */
export abstract class BaseVisitor {
    public notifier: Subject;
    public processedCount: number;

    constructor() {
        this.notifier = new Subject();
        this.processedCount = 0;
    }

    /**
     * 發送狀態通知給訂閱者 (UI)
     */
    changeState(message: string, currentNode: EntryComponent): void {
        this.processedCount++;
        this.notifier.notify({
            source: 'visitor',
            type: 'progress',
            message: message,
            data: {
                currentNode: currentNode.name,
                count: this.processedCount,
                nodeType: currentNode.type
            }
        });
    }

    abstract visitFile(file: FileLeaf): void;
    abstract visitDirectory(dir: DirectoryComposite): void;
}

export interface Stats {
    count: number;
    totalSize: number;
    maxSize: number;
    minSize: number;
}

export interface FinalizedStats extends Stats {
    avgSize: number;
}

export interface StatisticsResults {
    totalNodes: number;
    dirCount: number;
    fileStats: FinalizedStats;
    byExtension?: Record<string, FinalizedStats>;
}

/**
 * StatisticsVisitor (綜合統計訪問者)
 */
export class StatisticsVisitor extends BaseVisitor {
    private groupByExtension: boolean;
    public totalNodes: number = 0;
    public dirCount: number = 0;
    public overall: Stats;
    public extMap: Record<string, Stats> = {};

    constructor(groupByExtension = false) {
        super();
        this.groupByExtension = groupByExtension;

        const initStats = (): Stats => ({
            count: 0,
            totalSize: 0,
            maxSize: -Infinity,
            minSize: Infinity
        });

        this.overall = initStats();
    }

    override visitFile(file: FileLeaf): void {
        this.totalNodes++;
        this._update(this.overall, file.size);

        if (this.groupByExtension) {
            const ext = file.extension ? `.${file.extension}` : 'no-ext';
            if (!this.extMap[ext]) {
                this.extMap[ext] = { count: 0, totalSize: 0, maxSize: -Infinity, minSize: Infinity };
            }
            this._update(this.extMap[ext], file.size);
        }

        this.changeState(`統計檔案: ${file.name}`, file);
    }

    override visitDirectory(dir: DirectoryComposite): void {
        this.totalNodes++;
        this.dirCount++;
        this.changeState(`分析目錄: ${dir.name}`, dir);

        dir.getChildren().forEach(child => child.accept(this));
    }

    private _update(s: Stats, size: number): void {
        s.count++;
        s.totalSize += size;
        if (size > s.maxSize) s.maxSize = size;
        if (size < s.minSize) s.minSize = size;
    }


    getResults(): StatisticsResults {
        const finalize = (s: Stats): FinalizedStats => ({
            count: s.count,
            totalSize: s.totalSize,
            maxSize: s.maxSize === -Infinity ? 0 : s.maxSize,
            minSize: s.minSize === Infinity ? 0 : s.minSize,
            avgSize: s.count > 0 ? Number((s.totalSize / s.count).toFixed(2)) : 0
        });

        const results: StatisticsResults = {
            totalNodes: this.totalNodes,
            dirCount: this.dirCount,
            fileStats: finalize(this.overall)
        };

        if (this.groupByExtension) {
            results.byExtension = {};
            Object.keys(this.extMap).forEach(ext => {
                results.byExtension![ext] = finalize(this.extMap[ext]);
            });
        }

        return results;
    }

    get total(): number { return this.totalNodes; }
    get totalSize(): number { return this.overall.totalSize; }
}

/**
 * FileSearchVisitor
 */
export class FileSearchVisitor extends BaseVisitor {
    public keyword: string;
    public foundIds: string[] = [];

    constructor(keyword: string) {
        super();
        this.keyword = keyword.toLowerCase();
    }

    override visitFile(file: FileLeaf): void {
        if (file.name.toLowerCase().includes(this.keyword)) {
            this.foundIds.push(file.id);
            this.changeState(`[符合] ${file.name}`, file);
        }
        else this.changeState(`掃描檔案: ${file.name}`, file);
    }

    override visitDirectory(dir: DirectoryComposite): void {
        this.changeState(`搜尋目錄: ${dir.name}`, dir);
        dir.getChildren().forEach(c => c.accept(this));
    }
}

/**
 * FinderVisitor
 */
export class FinderVisitor extends BaseVisitor {
    public targetId: string;
    public foundSelf: EntryComponent | null = null;
    public foundParent: DirectoryComposite | null = null;

    constructor(targetId: string) {
        super();
        this.targetId = targetId;
    }

    override visitFile(file: FileLeaf): void {
        if (file.id === this.targetId) {
            this.foundSelf = file;
        }
    }

    override visitDirectory(dir: DirectoryComposite): void {
        if (this.foundSelf && this.foundParent) return;

        if (dir.id === this.targetId) {
            this.foundSelf = dir;
        }

        for (const child of dir.getChildren()) {
            if (this.foundSelf && this.foundParent) break;

            child.accept(this);

            if (!this.foundParent && this.foundSelf && this.foundSelf.id === child.id) {
                this.foundParent = dir;
            }
        }
    }
}
