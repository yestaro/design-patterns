// =============================================================================
// --- Visitor Pattern 單元測試 ---
// =============================================================================

import { describe, it, expect } from 'vitest';
import { StatisticsVisitor, FileSearchVisitor, FinderVisitor } from '../src/patterns/Visitor';
import { DirectoryComposite, PlainText, WordDocument, ImageFile } from '../src/patterns/Composite';

/** 建立測試用樹狀結構 */
function createTree() {
    const root = new DirectoryComposite('root', '根', '2025-01-01');
    const dir = new DirectoryComposite('d1', '文件', '2025-01-01');
    const f1 = new PlainText('f1', 'config.txt', 10, '2025-01-01', 'UTF-8');
    const f2 = new WordDocument('f2', 'report.docx', 200, '2025-01-01', 15);
    const f3 = new ImageFile('f3', 'photo.png', 3000, '2025-01-01', 1920, 1080);
    dir.add(f1);
    dir.add(f2);
    root.add(dir);
    root.add(f3);
    return { root, dir, f1, f2, f3 };
}

describe('StatisticsVisitor', () => {
    it('計算正確的總節點數', () => {
        const { root } = createTree();
        const visitor = new StatisticsVisitor();
        root.accept(visitor);
        // root(1) + dir(1) + f1(1) + f2(1) + f3(1) = 5
        expect(visitor.totalNodes).toBe(5);
    });

    it('計算正確的目錄數', () => {
        const { root } = createTree();
        const visitor = new StatisticsVisitor();
        root.accept(visitor);
        expect(visitor.dirCount).toBe(2); // root + dir
    });

    it('計算正確的總大小', () => {
        const { root } = createTree();
        const visitor = new StatisticsVisitor();
        root.accept(visitor);
        expect(visitor.totalSize).toBe(10 + 200 + 3000);
    });

    it('groupByExtension 正確分組', () => {
        const { root } = createTree();
        const visitor = new StatisticsVisitor(true);
        root.accept(visitor);
        const results = visitor.getResults();
        expect(results.byExtension).toBeDefined();
        expect(results.byExtension!['.txt']).toBeDefined();
        expect(results.byExtension!['.docx']).toBeDefined();
        expect(results.byExtension!['.png']).toBeDefined();
        expect(results.byExtension!['.txt'].count).toBe(1);
    });

    it('getResults 回傳正確的 avgSize', () => {
        const { root } = createTree();
        const visitor = new StatisticsVisitor();
        root.accept(visitor);
        const results = visitor.getResults();
        const expectedAvg = Number(((10 + 200 + 3000) / 3).toFixed(2));
        expect(results.fileStats.avgSize).toBe(expectedAvg);
    });
});

describe('FileSearchVisitor', () => {
    it('搜尋到符合的檔案', () => {
        const { root } = createTree();
        const visitor = new FileSearchVisitor('config');
        root.accept(visitor);
        expect(visitor.foundIds).toEqual(['f1']);
    });

    it('搜尋不區分大小寫', () => {
        const { root } = createTree();
        const visitor = new FileSearchVisitor('CONFIG');
        root.accept(visitor);
        expect(visitor.foundIds).toEqual(['f1']);
    });

    it('無符合結果回傳空陣列', () => {
        const { root } = createTree();
        const visitor = new FileSearchVisitor('nonexistent');
        root.accept(visitor);
        expect(visitor.foundIds).toEqual([]);
    });

    it('多個符合結果都回傳', () => {
        const { root } = createTree();
        // 搜尋包含副檔名的共同字串
        const visitor = new FileSearchVisitor('.'); // 所有有副檔名的檔案
        root.accept(visitor);
        expect(visitor.foundIds).toHaveLength(3);
    });
});

describe('FinderVisitor', () => {
    it('找到存在的檔案', () => {
        const { root } = createTree();
        const visitor = new FinderVisitor('f2');
        root.accept(visitor);
        expect(visitor.foundSelf).not.toBeNull();
        expect(visitor.foundSelf!.name).toBe('report.docx');
    });

    it('找到正確的父目錄', () => {
        const { root } = createTree();
        const visitor = new FinderVisitor('f1');
        root.accept(visitor);
        expect(visitor.foundParent).not.toBeNull();
        expect(visitor.foundParent!.id).toBe('d1');
    });

    it('找不到不存在的項目', () => {
        const { root } = createTree();
        const visitor = new FinderVisitor('xyz');
        root.accept(visitor);
        expect(visitor.foundSelf).toBeNull();
    });

    it('根節點的 foundParent 為 null', () => {
        const { root } = createTree();
        const visitor = new FinderVisitor('root');
        root.accept(visitor);
        expect(visitor.foundSelf).not.toBeNull();
        expect(visitor.foundParent).toBeNull();
    });

    it('BaseVisitor getters 運作正常', () => {
        const { root } = createTree();
        const visitor = new StatisticsVisitor();
        root.accept(visitor);
        expect(visitor.total).toBe(5);
    });
});
