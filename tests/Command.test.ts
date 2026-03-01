// =============================================================================
// --- Command Pattern 單元測試 ---
// =============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
    DeleteCommand,
    MoveCommand,
    CopyCommand,
    PasteCommand,
    CommandInvoker,
    TagCommand,
    SortCommand,
} from '../src/patterns/Command';
import {
    DirectoryComposite,
    PlainText,
    WordDocument,
    EntryComponent,
} from '../src/patterns/Composite';
import { Clipboard } from '../src/patterns/Singleton';
import { TagMediator } from '../src/patterns/Mediator';
import { AttributeSortStrategy } from '../src/patterns/Strategy';

describe('DeleteCommand', () => {
    let parent: DirectoryComposite;
    let file: PlainText;

    beforeEach(() => {
        parent = new DirectoryComposite('d1', '目錄', '2025-01-01');
        file = new PlainText('f1', 'test.txt', 10, '2025-01-01', 'UTF-8');
        parent.add(file);
    });

    it('execute 後子項被移除', () => {
        const cmd = new DeleteCommand('f1', parent);
        cmd.execute();
        expect(parent.getChildren()).toHaveLength(0);
    });

    it('undo 後子項恢復', () => {
        const cmd = new DeleteCommand('f1', parent);
        cmd.execute();
        cmd.undo();
        expect(parent.getChildren()).toHaveLength(1);
        expect(parent.getChildren()[0].id).toBe('f1');
    });

    it('如果找不到目標項目，undo 不執行任何動作 (分支覆蓋)', () => {
        const cmd = new DeleteCommand('non-exist', parent);
        // @ts-ignore: 手動破壞私有成員測試極端分支
        cmd.targetEntry = undefined;
        expect(() => cmd.undo()).not.toThrow();
    });
});

describe('MoveCommand', () => {
    let root: DirectoryComposite;
    let dirA: DirectoryComposite;
    let dirB: DirectoryComposite;
    let file: PlainText;

    beforeEach(() => {
        root = new DirectoryComposite('root', '根', '2025-01-01');
        dirA = new DirectoryComposite('a', '目錄A', '2025-01-01');
        dirB = new DirectoryComposite('b', '目錄B', '2025-01-01');
        file = new PlainText('f1', 'test.txt', 10, '2025-01-01', 'UTF-8');
        dirA.add(file);
        root.add(dirA);
        root.add(dirB);
    });

    it('execute 後檔案從來源移到目標', () => {
        const cmd = new MoveCommand('f1', dirA, dirB);
        cmd.execute();
        expect(dirA.getChildren()).toHaveLength(0);
        expect(dirB.getChildren()).toHaveLength(1);
        expect(dirB.getChildren()[0].id).toBe('f1');
    });

    it('undo 後檔案回到來源', () => {
        const cmd = new MoveCommand('f1', dirA, dirB);
        cmd.execute();
        cmd.undo();
        expect(dirA.getChildren()).toHaveLength(1);
        expect(dirA.getChildren()[0].id).toBe('f1');
        expect(dirB.getChildren()).toHaveLength(0);
    });

    it('execute + undo + execute（模擬 redo）結果一致', () => {
        const cmd = new MoveCommand('f1', dirA, dirB);
        cmd.execute();
        cmd.undo();
        cmd.execute();
        expect(dirA.getChildren()).toHaveLength(0);
        expect(dirB.getChildren()[0].id).toBe('f1');
    });

    it('移動目錄（含子項）到另一個目錄', () => {
        const subFile = new WordDocument('w1', 'doc.docx', 50, '2025-01-01', 3);
        dirA.add(subFile);
        // dirA 現在有 [file, subFile]，把整個 dirA 移到 dirB
        const cmd = new MoveCommand('a', root, dirB);
        cmd.execute();
        expect(root.getChildren().map(c => c.id)).not.toContain('a');
        expect(dirB.getChildren().map(c => c.id)).toContain('a');
        // dirA 內容不變
        const movedDir = dirB.getChildren().find(c => c.id === 'a') as DirectoryComposite;
        expect(movedDir.getChildren()).toHaveLength(2);
    });

    it('如果找不到移動目標，execute 與 undo 均不報錯', () => {
        const cmd = new MoveCommand('non-exist', dirA, dirB);
        expect(() => cmd.execute()).not.toThrow();
        expect(() => cmd.undo()).not.toThrow();
    });
});

describe('CopyCommand + PasteCommand', () => {
    let root: DirectoryComposite;
    let file: PlainText;

    beforeEach(() => {
        root = new DirectoryComposite('root', '根', '2025-01-01');
        file = new PlainText('f1', 'test.txt', 10, '2025-01-01', 'UTF-8');
        root.add(file);
        // 清空剪貼簿
        Clipboard.getInstance().clear();
    });

    it('CopyCommand 將項目存入 Clipboard', () => {
        const cmd = new CopyCommand('f1', root);
        cmd.execute();
        expect(Clipboard.getInstance().hasContent()).toBe(true);
    });

    it('PasteCommand 將 clone 項目加入目標目錄', () => {
        const copyCmd = new CopyCommand('f1', root);
        copyCmd.execute();

        const targetDir = new DirectoryComposite('d1', '目標', '2025-01-01');
        const pasteCmd = new PasteCommand(targetDir);
        pasteCmd.execute();

        expect(targetDir.getChildren()).toHaveLength(1);
        // clone 的 id 應不同於原始
        expect(targetDir.getChildren()[0].id).not.toBe('f1');
    });

    it('PasteCommand undo 移除貼上的項目', () => {
        const copyCmd = new CopyCommand('f1', root);
        copyCmd.execute();

        const targetDir = new DirectoryComposite('d1', '目標', '2025-01-01');
        const pasteCmd = new PasteCommand(targetDir);
        pasteCmd.execute();
        pasteCmd.undo();

        expect(targetDir.getChildren()).toHaveLength(0);
    });

    it('PasteCommand 支援 redo (再次 execute 時使用已存在的物件)', () => {
        const copyCmd = new CopyCommand('f1', root);
        copyCmd.execute();

        const targetDir = new DirectoryComposite('d1', '目標', '2025-01-01');
        const pasteCmd = new PasteCommand(targetDir);
        pasteCmd.execute(); // 第一次執行，存入 pastedComponent
        const pastedId = targetDir.getChildren()[0].id;

        pasteCmd.undo();
        pasteCmd.execute(); // 第二次執行 (redo)，應使用同一個物件
        expect(targetDir.getChildren()[0].id).toBe(pastedId);
    });

    it('PasteCommand 當剪貼簿為空時不執行任何操作', () => {
        const targetDir = new DirectoryComposite('d1', '目標', '2025-01-01');
        const pasteCmd = new PasteCommand(targetDir);
        pasteCmd.execute();
        expect(targetDir.getChildren()).toHaveLength(0);
    });

    it('PasteCommand undo 在無貼上項目時不報錯', () => {
        const targetDir = new DirectoryComposite('d1', '目標', '2025-01-01');
        const pasteCmd = new PasteCommand(targetDir);
        expect(() => pasteCmd.undo()).not.toThrow();
    });
});

describe('CommandInvoker', () => {
    let invoker: CommandInvoker;
    let parent: DirectoryComposite;
    let file: PlainText;

    beforeEach(() => {
        invoker = new CommandInvoker();
        parent = new DirectoryComposite('d1', '目錄', '2025-01-01');
        file = new PlainText('f1', 'test.txt', 10, '2025-01-01', 'UTF-8');
        parent.add(file);
    });

    it('execute 後可 undo', () => {
        invoker.execute(new DeleteCommand('f1', parent));
        expect(parent.getChildren()).toHaveLength(0);

        invoker.undo();
        expect(parent.getChildren()).toHaveLength(1);
    });

    it('undo 後可 redo', () => {
        invoker.execute(new DeleteCommand('f1', parent));
        invoker.undo();
        invoker.redo();
        expect(parent.getChildren()).toHaveLength(0);
    });

    it('execute 新指令後 redoStack 清空', () => {
        const file2 = new PlainText('f2', 'b.txt', 5, '2025-01-01', 'UTF-8');
        parent.add(file2);

        invoker.execute(new DeleteCommand('f1', parent));
        invoker.undo(); // redoStack = [DeleteCommand]

        invoker.execute(new DeleteCommand('f2', parent)); // 應清空 redo
        expect(invoker.redoStack).toHaveLength(0);
    });

    it('不可 undo 的命令（如 CopyCommand）不進 undoStack', () => {
        const root = new DirectoryComposite('root', '根', '2025-01-01');
        root.add(file);
        invoker.execute(new CopyCommand('f1', root));
        expect(invoker.undoStack).toHaveLength(0);
    });

    it('空堆疊時呼叫 undo 或 redo 回傳 null 且不報錯', () => {
        expect(invoker.undo()).toBeNull();
        expect(invoker.redo()).toBeNull();
    });
});

describe('TagCommand', () => {
    let mediator: TagMediator;
    const fileId = 'f1';

    beforeEach(() => {
        mediator = new TagMediator();
    });

    it('execute 加入標籤, undo 移除標籤', () => {
        const cmd = new TagCommand(mediator, fileId, 'Urgent');
        cmd.execute();
        expect(mediator.getLabels(fileId)[0].name).toBe('Urgent');

        cmd.undo();
        expect(mediator.getLabels(fileId)).toHaveLength(0);
    });

    it('isBinary 為 false 時 execute 移除標籤', () => {
        mediator.attach(fileId, 'Work');
        const cmd = new TagCommand(mediator, fileId, 'Work', false);
        cmd.execute();
        expect(mediator.getLabels(fileId)).toHaveLength(0);

        cmd.undo();
        expect(mediator.getLabels(fileId)[0].name).toBe('Work');
    });
});

describe('SortCommand', () => {
    let root: DirectoryComposite;
    let entries: EntryComponent[];

    beforeEach(() => {
        root = new DirectoryComposite('root', '根', '2025-01-01');
        entries = [
            new PlainText('f2', 'bravo.txt', 10, '2025-01-01', 'UTF-8'),
            new PlainText('f1', 'alpha.txt', 10, '2025-01-01', 'UTF-8'),
        ];
        entries.forEach(e => root.add(e));
    });

    it('execute 切換排序方式, undo 恢復舊排序', () => {
        const oldStrategy = new AttributeSortStrategy('name', 'asc');
        const newStrategy = new AttributeSortStrategy('name', 'desc');
        const oldState = { attr: 'name', dir: 'asc' as const };
        const newState = { attr: 'name', dir: 'desc' as const };

        const cmd = new SortCommand(root, oldStrategy, newStrategy, oldState, newState);

        // 初始狀態 alpha < bravo (asc)
        root.sort(oldStrategy);
        expect(root.getChildren()[0].id).toBe('f1');

        cmd.execute();
        expect(root.getChildren()[0].id).toBe('f2'); // bravo (desc)

        cmd.undo();
        expect(root.getChildren()[0].id).toBe('f1'); // alpha (asc)
    });

    it('SortCommand 當新舊狀態相同時不執行排序', () => {
        const strategy = new AttributeSortStrategy('name', 'asc');
        const state = { attr: 'name', dir: 'asc' as const };

        // 此處我們模擬內部邏輯：當狀態相同時，不應該重新排 (雖然結果一樣，但覆蓋了 return 分支)
        const cmd = new SortCommand(root, strategy, strategy, state, state);
        cmd.execute();
        expect(root.getChildren()[0].id).toBe('f1');
    });
});
