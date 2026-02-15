// =============================================================================
// --- [Infrastructure] 設計模式介面與基礎 ---
// =============================================================================

import { EntryComponent, ISortStrategy } from './Composite';
import type { TagMediator } from './Mediator';

/**
 * BaseStrategy (策略基底)
 */
export abstract class BaseStrategy implements ISortStrategy {
    constructor(public direction: 'asc' | 'desc' = 'asc') { }
    abstract sort(entries: EntryComponent[]): void;
}

// =============================================================================
// --- [Concrete Implementations] 具體實作 ---
// =============================================================================

/**
 * AttributeSortStrategy (屬性排序策略)
 */
export class AttributeSortStrategy extends BaseStrategy {
    constructor(public attribute: string, direction: 'asc' | 'desc' = 'asc') {
        super(direction);
    }

    override sort(entries: EntryComponent[]): void {
        entries.sort((a, b) => {
            let valA: string | number = '';
            let valB: string | number = '';

            // 優先使用擴充後的內部屬性
            if (this.attribute === 'extension') {
                valA = a.extension;
                valB = b.extension;
            } else if (this.attribute === 'name' || this.attribute === 'size' || this.attribute === 'created' || this.attribute === 'type') {
                valA = a[this.attribute as keyof EntryComponent] as string | number;
                valB = b[this.attribute as keyof EntryComponent] as string | number;
            }

            if (valA < valB) return this.direction === 'asc' ? -1 : 1;
            if (valA > valB) return this.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
}

/**
 * LabelSortStrategy (標籤排序策略)
 */
export class LabelSortStrategy extends BaseStrategy {
    constructor(private tagMediator: TagMediator, direction: 'asc' | 'desc' = 'asc') {
        super(direction);
    }

    override sort(entries: EntryComponent[]): void {
        entries.sort((a, b) => {
            const labelsA = this.tagMediator.getLabels(a.id);
            const labelsB = this.tagMediator.getLabels(b.id);

            const valA = labelsA.length > 0 ? labelsA[0].name : "zzzzzzzz";
            const valB = labelsB.length > 0 ? labelsB[0].name : "zzzzzzzz";

            if (valA < valB) return this.direction === 'asc' ? -1 : 1;
            if (valA > valB) return this.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
}
