// =============================================================================
// --- Strategy Pattern 單元測試 ---
// =============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { AttributeSortStrategy, LabelSortStrategy } from '../src/patterns/Strategy';
import { PlainText, WordDocument, EntryComponent } from '../src/patterns/Composite';
import { TagMediator } from '../src/patterns/Mediator';

describe('AttributeSortStrategy', () => {
    let entries: EntryComponent[];

    beforeEach(() => {
        entries = [
            new PlainText('f3', 'charlie.txt', 300, '2025-03-01', 'UTF-8'),
            new PlainText('f1', 'alpha.txt', 100, '2025-01-01', 'UTF-8'),
            new WordDocument('f2', 'bravo.docx', 200, '2025-02-01', 5),
        ];
    });

    it('依名稱升冪排序', () => {
        const strategy = new AttributeSortStrategy('name', 'asc');
        strategy.sort(entries);
        expect(entries.map(e => e.name)).toEqual(['alpha.txt', 'bravo.docx', 'charlie.txt']);
    });

    it('依名稱降冪排序', () => {
        const strategy = new AttributeSortStrategy('name', 'desc');
        strategy.sort(entries);
        expect(entries.map(e => e.name)).toEqual(['charlie.txt', 'bravo.docx', 'alpha.txt']);
    });

    it('依大小升冪排序', () => {
        const strategy = new AttributeSortStrategy('size', 'asc');
        strategy.sort(entries);
        expect(entries.map(e => e.size)).toEqual([100, 200, 300]);
    });

    it('依副檔名排序', () => {
        const strategy = new AttributeSortStrategy('extension', 'asc');
        strategy.sort(entries);
        // docx < txt
        expect(entries[0].extension).toBe('docx');
    });
});

describe('LabelSortStrategy', () => {
    let entries: EntryComponent[];
    let mediator: TagMediator;

    beforeEach(() => {
        mediator = new TagMediator();
        entries = [
            new PlainText('f1', 'a.txt', 10, '2025-01-01', 'UTF-8'),
            new PlainText('f2', 'b.txt', 20, '2025-01-01', 'UTF-8'),
            new PlainText('f3', 'c.txt', 30, '2025-01-01', 'UTF-8'),
        ];
        // f2 有 Personal, f1 有 Work, f3 無標籤
        mediator.attach('f2', 'Personal');
        mediator.attach('f1', 'Work');
    });

    it('有標籤的排在前面（升冪）', () => {
        const strategy = new LabelSortStrategy(mediator, 'asc');
        strategy.sort(entries);
        // Personal < Work < zzzzzzzz（無標籤）
        expect(entries[0].id).toBe('f2'); // Personal
        expect(entries[1].id).toBe('f1'); // Work
        expect(entries[2].id).toBe('f3'); // 無標籤
    });

    it('降冪排序：無標籤排前面', () => {
        const strategy = new LabelSortStrategy(mediator, 'desc');
        strategy.sort(entries);
        expect(entries[0].id).toBe('f3'); // 無標籤 (zzzzzzzz 最大)
    });

    it('所有項目都沒有標籤時的排序', () => {
        const emptyMediator = new TagMediator();
        const strategy = new LabelSortStrategy(emptyMediator, 'asc');
        strategy.sort(entries);
        // 應穩定排序或不崩潰
        expect(entries).toHaveLength(3);
    });
});
