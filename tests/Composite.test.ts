// =============================================================================
// --- Composite Pattern 單元測試 ---
// =============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
    DirectoryComposite,
    WordDocument,
    ImageFile,
    PlainText,
} from '../src/patterns/Composite';

describe('DirectoryComposite', () => {
    let root: DirectoryComposite;
    let dir: DirectoryComposite;
    let file: PlainText;

    beforeEach(() => {
        root = new DirectoryComposite('root', '根目錄', '2025-01-01');
        dir = new DirectoryComposite('d1', '子目錄', '2025-01-01');
        file = new PlainText('f1', 'test.txt', 10, '2025-01-01', 'UTF-8');
    });

    it('add 後 getChildren 應包含該子項', () => {
        root.add(file);
        const children = root.getChildren();
        expect(children).toHaveLength(1);
        expect(children[0].id).toBe('f1');
    });

    it('remove 後 getChildren 不再包含該子項', () => {
        root.add(file);
        root.remove('f1');
        expect(root.getChildren()).toHaveLength(0);
    });

    it('巢狀結構：目錄可包含目錄與檔案', () => {
        dir.add(file);
        root.add(dir);
        expect(root.getChildren()).toHaveLength(1);
        expect((root.getChildren()[0] as DirectoryComposite).getChildren()[0].id).toBe('f1');
    });

    it('getChildren 回傳副本，不影響內部結構', () => {
        root.add(file);
        const children = root.getChildren();
        children.pop(); // 修改副本
        expect(root.getChildren()).toHaveLength(1); // 原始不受影響
    });
});

describe('EntryComponent clone', () => {
    it('PlainText clone 產生不同 id 的副本', () => {
        const original = new PlainText('f1', 'readme.txt', 5, '2025-01-01', 'UTF-8');
        const cloned = original.clone();
        expect(cloned.id).not.toBe(original.id);
        expect(cloned.name).toContain('Copy of');
        expect(cloned.size).toBe(original.size);
    });

    it('WordDocument clone 保留 pageCount', () => {
        const original = new WordDocument('w1', 'spec.docx', 100, '2025-01-01', 20);
        const cloned = original.clone();
        expect(cloned.pageCount).toBe(20);
    });

    it('ImageFile clone 保留解析度', () => {
        const original = new ImageFile('i1', 'photo.png', 2048, '2025-01-01', 1920, 1080);
        const cloned = original.clone();
        expect(cloned.width).toBe(1920);
        expect(cloned.height).toBe(1080);
    });

    it('DirectoryComposite clone 深拷貝子項', () => {
        const dir = new DirectoryComposite('d1', '文件', '2025-01-01');
        dir.add(new PlainText('f1', 'a.txt', 1, '2025-01-01', 'UTF-8'));
        dir.add(new PlainText('f2', 'b.txt', 2, '2025-01-01', 'UTF-8'));
        const cloned = dir.clone();

        expect(cloned.id).not.toBe(dir.id);
        expect(cloned.getChildren()).toHaveLength(2);
        // 子項 id 也應不同（深拷貝）
        expect(cloned.getChildren()[0].id).not.toBe(dir.getChildren()[0].id);
    });
});

describe('FileLeaf extension', () => {
    it('有副檔名的檔案回傳正確的 extension', () => {
        const file = new PlainText('f1', 'readme.txt', 1, '2025-01-01', 'UTF-8');
        expect(file.extension).toBe('txt');
    });

    it('多層副檔名取最後一個', () => {
        const file = new WordDocument('f1', 'backup.2025.docx', 1, '2025-01-01', 1);
        expect(file.extension).toBe('docx');
    });

    it('目錄的 extension 為空字串', () => {
        const dir = new DirectoryComposite('d1', 'folder', '2025-01-01');
        expect(dir.extension).toBe('');
    });
});
describe('File Attributes', () => {
    it('WordDocument 應包含頁數屬性', () => {
        const file = new WordDocument('w1', 'test.docx', 10, '2025', 15);
        expect(file.attributes.pages).toBe(15);
    });

    it('ImageFile 應包含尺寸屬性', () => {
        const file = new ImageFile('i1', 'test.jpg', 10, '2025', 1024, 768);
        expect(file.attributes.res).toBe('1024x768');
    });

    it('PlainText 應包含編碼屬性', () => {
        const file = new PlainText('f1', 'test.txt', 10, '2025', 'UTF-16');
        expect(file.attributes.enc).toBe('UTF-16');
    });
});
