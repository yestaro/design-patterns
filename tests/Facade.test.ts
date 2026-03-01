// =============================================================================
// --- Facade Pattern 整合測試 ---
// =============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { FileSystemFacade } from '../src/patterns/Facade';
import {
    DirectoryComposite,
    PlainText,
} from '../src/patterns/Composite';
import { commandInvokerInstance } from '../src/patterns/Command';
import { Clipboard } from '../src/patterns/Singleton';
import { tagMediator } from '../src/patterns/Mediator';

/**
 * 建立測試用的檔案樹狀結構
 * root/
 * ├── dirA/
 * │   ├── file1.txt
 * │   └── subDir/
 * │       └── deep.txt
 * ├── dirB/
 * └── readme.txt
 */
function createTestTree() {
    const root = new DirectoryComposite('root', '根目錄', '2025-01-01');
    const dirA = new DirectoryComposite('a', '目錄A', '2025-01-01');
    const dirB = new DirectoryComposite('b', '目錄B', '2025-01-01');
    const subDir = new DirectoryComposite('sub', '子目錄', '2025-01-01');
    const file1 = new PlainText('f1', 'file1.txt', 10, '2025-01-01', 'UTF-8');
    const deep = new PlainText('deep', 'deep.txt', 5, '2025-01-01', 'UTF-8');
    const readme = new PlainText('readme', 'readme.txt', 1, '2025-01-01', 'UTF-8');

    subDir.add(deep);
    dirA.add(file1);
    dirA.add(subDir);
    root.add(dirA);
    root.add(dirB);
    root.add(readme);

    return { root, dirA, dirB, subDir, file1, deep, readme };
}

describe('Facade.moveItem', () => {
    let facade: FileSystemFacade;
    let tree: ReturnType<typeof createTestTree>;

    beforeEach(() => {
        // 重置全域狀態防止測試污染
        commandInvokerInstance.undoStack = [];
        commandInvokerInstance.redoStack = [];
        Clipboard.getInstance().clear();
        tagMediator.clear();

        tree = createTestTree();
        facade = new FileSystemFacade(tree.root);
    });

    it('正常移動檔案到另一個目錄', () => {
        const result = facade.moveItem('f1', 'b');
        expect(result).toBe(true);
        // f1 不在 dirA 中
        expect(tree.dirA.getChildren().map(c => c.id)).not.toContain('f1');
        // f1 在 dirB 中
        expect(tree.dirB.getChildren().map(c => c.id)).toContain('f1');
    });

    it('不可移動到自身', () => {
        const result = facade.moveItem('a', 'a');
        expect(result).toBe(false);
    });

    it('不可移動根節點', () => {
        const result = facade.moveItem('root', 'a');
        expect(result).toBe(false);
    });

    it('目標不是目錄時回傳 false', () => {
        // f1 是檔案，不是目錄
        const result = facade.moveItem('readme', 'f1');
        expect(result).toBe(false);
    });

    it('已在同一目錄中回傳 false', () => {
        // f1 已經在 dirA 中，移動到 dirA
        const result = facade.moveItem('f1', 'a');
        expect(result).toBe(false);
    });

    it('循環檢查：不可將目錄移動到自己的子目錄中', () => {
        // 嘗試將 dirA 移動到它自己的子目錄 subDir
        const result = facade.moveItem('a', 'sub');
        expect(result).toBe(false);
    });

    it('移動後支援 undo', () => {
        facade.moveItem('f1', 'b');
        facade.undo();
        // f1 回到 dirA
        expect(tree.dirA.getChildren().map(c => c.id)).toContain('f1');
        expect(tree.dirB.getChildren()).toHaveLength(0);
    });

    it('undo 後支援 redo', () => {
        facade.moveItem('f1', 'b');
        facade.undo();
        facade.redo();
        // f1 又回到 dirB
        expect(tree.dirA.getChildren().map(c => c.id)).not.toContain('f1');
        expect(tree.dirB.getChildren().map(c => c.id)).toContain('f1');
    });
});

describe('Facade.deleteItem', () => {
    let facade: FileSystemFacade;
    let tree: ReturnType<typeof createTestTree>;

    beforeEach(() => {
        commandInvokerInstance.undoStack = [];
        commandInvokerInstance.redoStack = [];
        tagMediator.clear();
        tree = createTestTree();
        facade = new FileSystemFacade(tree.root);
    });

    it('刪除檔案後該檔案不再存在', () => {
        facade.deleteItem('f1');
        expect(facade.findItem('f1')).toBeNull();
    });

    it('刪除後 undo 恢復', () => {
        facade.deleteItem('f1');
        facade.undo();
        expect(facade.findItem('f1')).not.toBeNull();
    });

    it('不可刪除根節點', () => {
        facade.deleteItem('root');
        expect(facade.findItem('root')).not.toBeNull();
    });
});

describe('Facade.copyItem + pasteItem', () => {
    let facade: FileSystemFacade;
    let tree: ReturnType<typeof createTestTree>;

    beforeEach(() => {
        commandInvokerInstance.undoStack = [];
        commandInvokerInstance.redoStack = [];
        Clipboard.getInstance().clear();
        tagMediator.clear();
        tree = createTestTree();
        facade = new FileSystemFacade(tree.root);
    });

    it('複製並貼上到目標目錄', () => {
        facade.copyItem('f1');
        facade.pasteItem('b');
        expect(tree.dirB.getChildren()).toHaveLength(1);
        // 貼上的是 clone，id 不同
        expect(tree.dirB.getChildren()[0].id).not.toBe('f1');
    });

    it('貼上後 undo 移除貼上的項目', () => {
        facade.copyItem('f1');
        facade.pasteItem('b');
        facade.undo();
        expect(tree.dirB.getChildren()).toHaveLength(0);
    });
});

describe('Facade.findItem / findParent', () => {
    let facade: FileSystemFacade;
    let tree: ReturnType<typeof createTestTree>;

    beforeEach(() => {
        tagMediator.clear();
        tree = createTestTree();
        facade = new FileSystemFacade(tree.root);
    });

    it('findItem 找到存在的項目', () => {
        const item = facade.findItem('deep');
        expect(item).not.toBeNull();
        expect(item!.name).toBe('deep.txt');
    });

    it('findItem 找不到不存在的項目回傳 null', () => {
        expect(facade.findItem('nonexistent')).toBeNull();
    });

    it('findParent 回傳正確的父目錄', () => {
        const parent = facade.findParent('f1');
        expect(parent).not.toBeNull();
        expect(parent!.id).toBe('a');
    });

    it('findParent 對 root 回傳 null', () => {
        expect(facade.findParent('root')).toBeNull();
    });
});

describe('Facade Async & Progress (Visitor Logic)', () => {
    let facade: FileSystemFacade;
    let tree: any;

    beforeEach(() => {
        tagMediator.clear();
        tree = createTestTree();
        facade = new FileSystemFacade(tree.root);
    });

    it('calculateSize 回傳正確總大小', async () => {
        const size = await facade.calculateSize();
        expect(size).toBe(10 + 5 + 1); // f1 + deep + readme
    });

    it('searchFiles 找到正確項目', async () => {
        const results = await facade.searchFiles('file1');
        expect(results).toContain('f1');
    });

    it('exportXml 產出非空字串', async () => {
        const xml = await facade.exportXml();
        expect(xml).toContain('<?xml');
        expect(xml).toContain('file1.txt');
    });

    it('getDetailedStats 包含分組資訊', async () => {
        const stats = await facade.getDetailedStats(true);
        expect(stats.totalNodes).toBe(7);
        expect(stats.byExtension).toBeDefined();
    });

    it('_runVisitor 應觸發 observers 通知', async () => {
        const messages: string[] = [];
        const obs = { update: (e: any) => messages.push(e.message) };
        await facade.calculateSize([obs]);
        expect(messages.length).toBeGreaterThan(0);
        expect(messages[0]).toContain('開始執行 SIZE');
    });
});

describe('Facade Command Shortcuts', () => {
    let facade: FileSystemFacade;
    let tree: any;

    beforeEach(() => {
        commandInvokerInstance.undoStack = [];
        commandInvokerInstance.redoStack = [];
        Clipboard.getInstance().clear();
        tagMediator.clear();
        tree = createTestTree();
        facade = new FileSystemFacade(tree.root);
    });

    it('tagItem 與 getLabels 運作正常', () => {
        facade.tagItem('f1', 'Urgent');
        const labels = facade.getLabels('f1');
        expect(labels[0].name).toBe('Urgent');
    });

    it('sortItems 改變排序並回傳新狀態', () => {
        const state = { attr: 'name', dir: 'asc' as const };
        const newState = facade.sortItems('name', state);
        expect(newState.dir).toBe('desc'); // 同屬性點擊切換為 desc
    });

    it('pasteItem 在無 targetId 時貼到 root', () => {
        facade.copyItem('f1');
        facade.pasteItem(null);
        // 檢查 root 的 children 多了一個 (原本 3 個變 4 個)
        expect(tree.root.getChildren()).toHaveLength(4);
    });

    it('removeTag 運作正常', () => {
        facade.tagItem('f1', 'Work');
        facade.removeTag('f1', 'Work');
        expect(facade.getLabels('f1')).toHaveLength(0);
    });

    it('pasteItem 在目標是檔案時貼到其父目錄', () => {
        facade.copyItem('deep'); // deep 在 sub 下
        facade.pasteItem('readme'); // readme 在 root 下
        // 應貼在 readme 的父目錄 (root)，所以 root children 從 3 變 4
        expect(tree.root.getChildren()).toHaveLength(4);
    });

    it('getClipboardStatus 運作正常', () => {
        facade.copyItem('f1');
        expect(facade.getClipboardStatus()).toBe(true);
    });
});
