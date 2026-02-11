// =============================================================================
// --- [Command Implementation] ---
// =============================================================================

import { Subject } from './Observer';
import { FinderVisitor } from './Visitor';

/**
 * BaseCommand (命令介面)
 *
 * 定義所有命令必須實作的方法：執行 (execute) 與 復原 (undo)。
 * [為什麼?] Command Pattern 將「請求」封裝成物件，使得我們可以用
 * 統一的方式來參數化、佇列化、記錄請求，並支援可復原的操作。
 */
export class BaseCommand {
    constructor(name) { this.name = name; }
    execute() { throw new Error("Method not implemented"); }
    undo() { throw new Error("Method not implemented"); }
}

/**
 * DeleteCommand (刪除命令)
 *
 * 實作刪除檔案的邏輯，並支援復原。
 * Undo 原理: 在 execute 前，雖然沒有做深拷貝備份整棵樹 (效能考量)，
 * 但我們保留了被刪除物件的引用 (this.targetEntry)。
 * Undo 時只需將該物件 add 回父目錄即可。
 */
export class DeleteCommand extends BaseCommand {
    constructor(targetId, parentDir, forceUpdate) {
        super("刪除項目"); this.targetId = targetId; this.parentDir = parentDir;
        this.targetEntry = parentDir.getChildren().find(c => c.id === targetId); this.forceUpdate = forceUpdate;
    }
    execute() { this.parentDir.remove(this.targetId); this.forceUpdate(); }
    undo() { this.parentDir.add(this.targetEntry); this.forceUpdate(); }
}

/**
 * TagCommand (標籤命令)
 *
 * 負責透過 Mediator (TagMediator) 來貼標籤或移除標籤。
 * [彈性設計] 透過 isAttach 參數控制是新增還是移除標籤。
 * 它的存在讓「貼標籤」和「移除標籤」這些動作變成可被記錄和復原的物件。
 */
export class TagCommand extends BaseCommand {
    constructor(tagMediator, fileId, labelName, forceUpdate, isAttach = true) {
        super(isAttach ? `貼上標籤(${labelName})` : `移除標籤(${labelName})`);
        this.tagMediator = tagMediator;
        this.fileId = fileId;
        this.labelName = labelName;
        this.forceUpdate = forceUpdate;
        this.isAttach = isAttach;
    }
    execute() {
        if (this.isAttach) {
            this.tagMediator.attach(this.fileId, this.labelName);
        } else {
            this.tagMediator.detach(this.fileId, this.labelName);
        }
        this.forceUpdate();
    }
    undo() {
        if (this.isAttach) {
            this.tagMediator.detach(this.fileId, this.labelName);
        } else {
            this.tagMediator.attach(this.fileId, this.labelName);
        }
        this.forceUpdate();
    }
}

/**
 * SortCommand (排序命令)
 *
 * 封裝了排序的操作。
 * [特色]
 * 1. 支援 Undo: 記住了舊的策略 (oldStrategy) 與舊的 UI 狀態。
 * 2. 狀態同步: 執行後會更新 UI (setUIState) 並觸發 forceUpdate。
 */
export class SortCommand extends BaseCommand {
    constructor(root, oldStrategy, newStrategy, forceUpdate, setUIState, oldUIState, newUIState) {
        super(`${newUIState.attr} 排序策略`);
        this.root = root; this.oldStrategy = oldStrategy; this.newStrategy = newStrategy;
        this.forceUpdate = forceUpdate; this.setUIState = setUIState;
        this.oldUIState = oldUIState; this.newUIState = newUIState;
    }
    applyToTree(strategy) {
        const visitor = {
            visitFile: () => { },
            visitDirectory: (dir) => { dir.sort(strategy); dir.getChildren().forEach(c => c.accept(visitor)); }
        };
        this.root.accept(visitor);
    }
    execute() { this.applyToTree(this.newStrategy); this.setUIState(this.newUIState); this.forceUpdate(); }
    undo() { this.applyToTree(this.oldStrategy); this.setUIState(this.oldUIState); this.forceUpdate(); }
}

export class CopyCommand extends BaseCommand {
    constructor(targetId, root, clipboard) {
        super("複製項目");
        this.clipboard = clipboard;

        // 使用 Visitor Pattern 尋找物件，取代 ad-hoc 遞迴
        const finder = new FinderVisitor(targetId);
        root.accept(finder);
        this.component = finder.foundNode;
    }

    execute() {
        if (this.component) {
            this.clipboard.set(this.component);
        }
    }

    // Copy 操作本身不改變檔案系統狀態，所以 undo 沒事做，或者說 undo 是清空剪貼簿？
    // 通常 Copy 的 Undo 是不支援的，或是無意義的。
    // 但為了 Command 介面完整性，我們留空。
    undo() { }
}

export class PasteCommand extends BaseCommand {
    constructor(destinationDir, clipboard, forceUpdate) {
        super("貼上項目");
        this.destinationDir = destinationDir;
        this.clipboard = clipboard;
        this.forceUpdate = forceUpdate;
        this.pastedComponent = null;
    }

    execute() {
        // 1. 從剪貼簿取得"副本" (Prototype Pattern)
        const component = this.clipboard.get();
        if (component) {
            // 2. 加入目的地
            this.destinationDir.add(component);
            this.pastedComponent = component; // 記住它以便 Undo
            this.forceUpdate();
        }
    }

    undo() {
        if (this.pastedComponent) {
            this.destinationDir.remove(this.pastedComponent.id);
            this.forceUpdate();
        }
    }
}

/**
 * CommandInvoker (命令請求者)
 *
 * 負責管理命令的堆疊 (Stack)。
 * [為什麼?] 這是實作無限 Undo/Redo 的核心。 Client 不直接執行命令，
 * 而是交給 Invoker，Invoker 負責執行並將其存入 history。
 */
export class CommandInvoker {
    constructor() { this.undoStack = []; this.redoStack = []; this.notifier = new Subject(); }

    /**
     * 執行新命令
     * 注意：執行新動作時，Redo Stack 必須清空，因為歷史分支已改變。
     */
    execute(command) {
        command.execute();
        // 只有會改變狀態的命令才入堆疊 (CopyCommand 不改變檔案系統狀態，這裡視需求而定)
        // 但如果希望 Undo 能"復原貼上"，那 Paste 必須入堆疊。
        // CopyCommand 通常不入 Undo Stack。
        if (!(command instanceof CopyCommand)) {
            this.undoStack.push(command);
            this.redoStack = [];
        }

        this.notifier.notify({
            type: 'command_executed',
            name: command.name,
            message: `[Command] 執行 ${command.name}` // for logging
        });
    }

    undo() {
        if (this.undoStack.length === 0) return null;
        const cmd = this.undoStack.pop(); cmd.undo(); this.redoStack.push(cmd);

        this.notifier.notify({
            type: 'command_undone',
            name: cmd.name,
            message: `[Undo] 恢復 ${cmd.name}`
        });
        return cmd;
    }

    redo() {
        if (this.redoStack.length === 0) return null;
        const cmd = this.redoStack.pop(); cmd.execute(); this.undoStack.push(cmd);

        this.notifier.notify({
            type: 'command_redone',
            name: cmd.name,
            message: `[Redo] 執行 ${cmd.name}`
        });
        return cmd;
    }
}
export const commandInvokerInstance = new CommandInvoker();
