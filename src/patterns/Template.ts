// =============================================================================
// --- [Template Pattern] ---
// =============================================================================

import { BaseVisitor } from './Visitor';
import type { FileLeaf, DirectoryComposite, EntryComponent } from './Composite';

/**
 * SafeFragment - 內部使用的安全包裝物件
 */
export class SafeFragment {
    constructor(public content: string) { }
}

/**
 * BaseExporterTemplate (Ultimate Template Method Pattern)
 */
export abstract class BaseExporterTemplate extends BaseVisitor {
    protected depth: number = 0;
    protected output: string = "";
    protected escapeMap: Record<string, string>;
    protected indentSize: number;

    constructor(escapeMap: Record<string, string>, indentSize = 2) {
        super();
        this.indentSize = indentSize;
        this.escapeMap = escapeMap;
    }

    /**
     * [關鍵重構] 標籤模板函數
     */
    format(strings: TemplateStringsArray, ...values: (string | number | SafeFragment | Record<string, any> | undefined | null)[]): SafeFragment {
        const result = strings.reduce((acc, str, i) => {
            const val = values[i];
            let processedVal = "";

            if (val !== undefined && val !== null) {
                if (val instanceof SafeFragment) {
                    processedVal = val.content;
                }
                else if (typeof val === 'object' && !Array.isArray(val)) {
                    const attrResult = this.renderAttributes(val);
                    processedVal = attrResult instanceof SafeFragment ? attrResult.content : attrResult;
                } else {
                    processedVal = this.escape(String(val));
                }
            }
            return acc + str + processedVal;
        }, "");

        return new SafeFragment(result);
    }

    /**
     * [屬性渲染 Hook] 預設為 XML/Key-Value 風格
     */
    renderAttributes(attrObj: Record<string, any>): string | SafeFragment {
        return Object.entries(attrObj)
            .map(([k, v]) => `${this.escape(k)}="${this.escape(String(v))}"`)
            .join(' ');
    }

    /**
     * [關鍵防禦] _write 現在會檢查型別
     */
    private _write(safeFragment: SafeFragment | string | undefined | null, node: EntryComponent): void {
        if (!safeFragment || (safeFragment instanceof SafeFragment && !safeFragment.content)) {
            return;
        }

        if (!(safeFragment instanceof SafeFragment)) {
            const errorMsg = `[Security Error] Subclass forgot to use 'this.format' in a rendering hook! 
            This is forbidden to ensure proper data escaping.`;
            console.error(errorMsg);
            throw new Error(errorMsg);
        }
        const indent = " ".repeat(this.depth * this.indentSize);
        this.output += `${indent}${safeFragment.content}\n`;
    }

    override visitDirectory(dir: DirectoryComposite): void {
        this._write(this.renderDirectoryStart(dir), dir);
        this.changeState(`開始目錄: ${dir.name}`, dir);
        this.depth++;
        dir.getChildren().forEach(child => child.accept(this));
        this.depth--;
        this._write(this.renderDirectoryEnd(dir), dir);
    }

    override visitFile(file: FileLeaf): void {
        this._write(this.renderFile(file), file);
        this.changeState(`處理檔案: ${file.name}`, file);
    }

    escape(text: string): string {
        if (!this.escapeMap || Object.keys(this.escapeMap).length === 0) {
            return text;
        }
        const pattern = new RegExp(`[${Object.keys(this.escapeMap).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('')}]`, 'g');
        return text.replace(pattern, (match) => this.escapeMap[match] || match);
    }

    abstract renderDirectoryStart(dir: DirectoryComposite): SafeFragment;
    abstract renderDirectoryEnd(dir: DirectoryComposite): SafeFragment;
    abstract renderFile(file: FileLeaf): SafeFragment;
    getResult(): string { return this.output; }
}

/**
 * XmlExporterTemplate
 */
export class XmlExporterTemplate extends BaseExporterTemplate {
    constructor() {
        const xmlMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        super(xmlMap, 2);
        this.output = '<?xml version="1.0" encoding="UTF-8"?>\n';
    }

    override renderDirectoryStart(dir: DirectoryComposite): SafeFragment {
        return this.format`<Directory Name="${dir.name}">`;
    }

    override renderDirectoryEnd(_dir: DirectoryComposite): SafeFragment {
        return this.format`</Directory>`;
    }

    override renderFile(file: FileLeaf): SafeFragment {
        const attrs = file.attributes ? this.format` ${file.attributes}` : this.format``;
        return this.format`<File Name="${file.name}" Size="${file.size}KB"${attrs} />`;
    }
}

/**
 * MarkdownExporterTemplate
 */
export class MarkdownExporterTemplate extends BaseExporterTemplate {
    constructor() {
        const mdMap = { '\\': '\\\\', '`': '\\`', '*': '\\*', '_': '\\_', '{': '\\{', '}': '\\}', '[': '\\[', ']': '\\]', '(': '\\(', ')': '\\)', '#': '\\#', '+': '\\+', '-': '\\-', '.': '\\.', '!': '\\!' };
        super(mdMap, 4);
        this.output = "# 檔案系統匯出報告\n\n";
    }

    override renderAttributes(attrObj: Record<string, any>): string {
        const entries = Object.entries(attrObj)
            .filter(([k]) => k !== 'iconType')
            .map(([k, v]) => `${k}: ${this.escape(String(v))}`)
            .join(', ');
        return entries ? ` [${entries}]` : "";
    }

    override renderDirectoryStart(dir: DirectoryComposite): SafeFragment {
        const hLevel = Math.min(this.depth + 2, 6);
        return this.format`${'#'.repeat(hLevel)} 📂 ${dir.name}`;
    }

    override renderDirectoryEnd(_dir: DirectoryComposite): SafeFragment {
        return this.format``;
    }

    override renderFile(file: FileLeaf): SafeFragment {
        return this.format`- 📄 ${file.name} (${file.size}KB)${file.attributes}`;
    }
}
