// =============================================================================
// --- Template Method Pattern 單元測試 ---
// =============================================================================

import { describe, it, expect } from 'vitest';
import { XmlExporterTemplate, MarkdownExporterTemplate } from '../src/patterns/Template';
import { DirectoryComposite, PlainText, WordDocument } from '../src/patterns/Composite';

/** 建立簡易測試樹 */
function createTree() {
    const root = new DirectoryComposite('root', '根目錄', '2025-01-01');
    root.add(new PlainText('f1', 'readme.txt', 1, '2025-01-01', 'UTF-8'));
    root.add(new WordDocument('f2', 'spec.docx', 50, '2025-01-01', 10));
    return root;
}

describe('XmlExporterTemplate', () => {
    it('輸出包含 XML 宣告', () => {
        const root = createTree();
        const exporter = new XmlExporterTemplate();
        root.accept(exporter);
        const result = exporter.getResult();
        expect(result).toContain('<?xml version="1.0"');
    });

    it('輸出包含目錄與檔案標籤', () => {
        const root = createTree();
        const exporter = new XmlExporterTemplate();
        root.accept(exporter);
        const result = exporter.getResult();
        expect(result).toContain('<Directory');
        expect(result).toContain('</Directory>');
        expect(result).toContain('<File');
    });

    it('正確 escape 特殊字元', () => {
        const exporter = new XmlExporterTemplate();
        expect(exporter.escape('a<b>c&d')).toBe('a&lt;b&gt;c&amp;d');
    });

    it('檔案名稱出現在輸出中', () => {
        const root = createTree();
        const exporter = new XmlExporterTemplate();
        root.accept(exporter);
        const result = exporter.getResult();
        expect(result).toContain('readme');
        expect(result).toContain('spec');
    });

    it('Security Error: 沒用 format 時應拋出 Error', () => {
        const exporter = new XmlExporterTemplate();
        const dir = new DirectoryComposite('d', 'd', '2025');
        // @ts-ignore: 測試私有邏輯防禦
        expect(() => exporter._write("not a fragment", dir)).toThrow('[Security Error]');
    });
});

describe('MarkdownExporterTemplate', () => {
    it('輸出包含標題', () => {
        const root = createTree();
        const exporter = new MarkdownExporterTemplate();
        root.accept(exporter);
        const result = exporter.getResult();
        expect(result).toContain('# 檔案系統匯出報告');
    });

    it('輸出包含目錄的 📂 標記', () => {
        const root = createTree();
        const exporter = new MarkdownExporterTemplate();
        root.accept(exporter);
        const result = exporter.getResult();
        expect(result).toContain('📂');
    });

    it('輸出包含檔案的 📄 標記', () => {
        const root = createTree();
        const exporter = new MarkdownExporterTemplate();
        root.accept(exporter);
        const result = exporter.getResult();
        expect(result).toContain('📄');
    });
});
