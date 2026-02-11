// =============================================================================
// --- [Infrastructure] 設計模式介面與基礎 ---
// =============================================================================

import { DirectoryComposite } from './Composite';

/**
 * BaseStrategy (策略介面)
 *
 * 定義演算法家族的共同介面。
 * [為什麼?] 符合這介面的任何新演算法 (如用修改日期排序)，
 * 都可以直接抽換進入系統，而不需修改使用它的 Client (DirectoryComposite)。
 */
export class BaseStrategy {
    constructor(direction = 'asc') {
        this.direction = direction;
    }
    sort(entries) { throw new Error("必須實作 sort 方法"); }
}

// =============================================================================
// --- [Concrete Implementations] 具體實作 ---
// =============================================================================

/**
 * AttributeSortStrategy (屬性排序策略)
 * 根據名稱、大小或副檔名進行排序。
 */
export class AttributeSortStrategy extends BaseStrategy {
    constructor(attribute, direction = 'asc') {
        super(direction);
        this.attribute = attribute;
    }

    sort(entries) {
        entries.sort((a, b) => {
            let valA = a[this.attribute], valB = b[this.attribute];

            // 特別處理副檔名 (extension)
            if (this.attribute === 'extension') {
                valA = (a instanceof DirectoryComposite) ? "" : a.name.split('.').pop().toLowerCase();
                valB = (b instanceof DirectoryComposite) ? "" : b.name.split('.').pop().toLowerCase();
            }

            if (valA < valB) return this.direction === 'asc' ? -1 : 1;
            if (valA > valB) return this.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
}

/**
 * LabelSortStrategy (標籤排序策略)
 *
 * 這是較複雜的策略，它需要依賴 TagMediator 來查詢資料。
 * [靈活性] 策略物件可以攜帶自己的依賴與參數 (如 tagMediator)，
 * 這些細節對 Client (DirectoryComposite) 是隱藏的。
 */
export class LabelSortStrategy extends BaseStrategy {
    constructor(tagMediator, direction = 'asc') {
        super(direction);
        this.tagMediator = tagMediator;
    }

    sort(entries) {
        entries.sort((a, b) => {
            const labelsA = this.tagMediator.getLabels(a.id);
            const labelsB = this.tagMediator.getLabels(b.id);
            // 簡化邏輯：取第一個標籤名稱來比較，無標籤者排最後
            const valA = labelsA.length > 0 ? labelsA[0].name : "zzzzzzzz";
            const valB = labelsB.length > 0 ? labelsB[0].name : "zzzzzzzz";

            if (valA < valB) return this.direction === 'asc' ? -1 : 1;
            if (valA > valB) return this.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
}
