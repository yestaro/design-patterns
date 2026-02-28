// =============================================================================
// --- [Command Implementation] ---
// =============================================================================

import { Subject, NotificationEvent } from './Observer';
import { FinderVisitor, BaseVisitor } from './Visitor';
import { Clipboard } from './Singleton';
import { DirectoryComposite, EntryComponent, FileLeaf, ISortStrategy } from './Composite';
import type { TagMediator } from './Mediator';

export interface SortState {
    attr: string;
    dir: 'asc' | 'desc';
}

/**
 * BaseCommand (命令介面)
 */
export abstract class BaseCommand {
    public isUndoable: boolean = true;
    public newSortState?: SortState;
    public oldSortState?: SortState;

    constructor(public name: string) { }
    abstract execute(): void;
    abstract undo(): void;
}

/**
 * DeleteCommand (刪除命令)
 */
export class DeleteCommand extends BaseCommand {
    private targetEntry: EntryComponent | undefined;

    constructor(private targetId: string, private parentDir: DirectoryComposite) {
        super("刪除項目");
        this.targetEntry = parentDir.getChildren().find(c => c.id === targetId);
    }

    override execute(): void {
        this.parentDir.remove(this.targetId);
    }

    override undo(): void {
        if (this.targetEntry) {
            this.parentDir.add(this.targetEntry);
        }
    }
}

/**
 * TagCommand (標籤命令)
 */
export class TagCommand extends BaseCommand {
    constructor(
        private tagMediator: TagMediator,
        private fileId: string,
        private labelName: string,
        private isAttach = true
    ) {
        super(isAttach ? `貼上標籤(${labelName})` : `移除標籤(${labelName})`);
    }

    override execute(): void {
        if (this.isAttach) {
            this.tagMediator.attach(this.fileId, this.labelName);
        } else {
            this.tagMediator.detach(this.fileId, this.labelName);
        }
    }

    override undo(): void {
        if (this.isAttach) {
            this.tagMediator.detach(this.fileId, this.labelName);
        } else {
            this.tagMediator.attach(this.fileId, this.labelName);
        }
    }
}

/**
 * SortCommand (排序命令)
 */
export class SortCommand extends BaseCommand {
    constructor(
        private root: EntryComponent,
        private oldStrategy: ISortStrategy,
        private newStrategy: ISortStrategy,
        public override oldSortState: SortState,
        public override newSortState: SortState
    ) {
        super(`${newSortState.attr} 排序策略 ${newSortState.dir}`);
    }

    private applyToTree(strategy: ISortStrategy): void {
        const recursionVisitor = new class extends BaseVisitor {
            override visitFile(file: FileLeaf): void { }
            override visitDirectory(dir: DirectoryComposite): void {
                dir.sort(strategy);
                dir.getChildren().forEach(c => c.accept(this));
            }
        }();
        this.root.accept(recursionVisitor);
    }

    override execute(): void {
        this.applyToTree(this.newStrategy);
    }

    override undo(): void {
        this.applyToTree(this.oldStrategy);
    }
}

/**
 * CopyCommand
 */
export class CopyCommand extends BaseCommand {
    private component: EntryComponent | null = null;

    constructor(targetId: string, root: EntryComponent) {
        super("複製項目");
        this.isUndoable = false;
        const finder = new FinderVisitor(targetId);
        root.accept(finder);
        this.component = finder.foundSelf;
    }

    override execute(): void {
        if (this.component) {
            Clipboard.getInstance().set(this.component);
        }
    }

    override undo(): void { }
}

/**
 * PasteCommand
 */
export class PasteCommand extends BaseCommand {
    private pastedComponent: EntryComponent | null = null;

    constructor(private destinationDir: DirectoryComposite) {
        super("貼上項目");
    }

    override execute(): void {
        // [Redo] 如果已經有貼上的物件參照，直接加回去 (不依賴當前剪貼簿)
        if (this.pastedComponent) {
            this.destinationDir.add(this.pastedComponent);
            return;
        }

        // [Execute] 第一次執行，從剪貼簿取得
        const component = Clipboard.getInstance().get();
        if (component) {
            this.destinationDir.add(component);
            this.pastedComponent = component;
        }
    }

    override undo(): void {
        if (this.pastedComponent) {
            this.destinationDir.remove(this.pastedComponent.id);
        }
    }
}

/**
 * MoveCommand (移動命令)
 * 將項目從來源目錄移動到目標目錄，支援 Undo/Redo
 */
export class MoveCommand extends BaseCommand {
    private targetEntry: EntryComponent | undefined;

    constructor(
        private sourceId: string,
        private sourceParentDir: DirectoryComposite,
        private destinationDir: DirectoryComposite
    ) {
        super("移動項目");
        this.targetEntry = sourceParentDir.getChildren().find(c => c.id === sourceId);
    }

    /** 執行移動：從來源目錄移除，加入目標目錄 */
    override execute(): void {
        if (this.targetEntry) {
            this.sourceParentDir.remove(this.sourceId);
            this.destinationDir.add(this.targetEntry);
        }
    }

    /** 復原移動：從目標目錄移除，加回來源目錄 */
    override undo(): void {
        if (this.targetEntry) {
            this.destinationDir.remove(this.sourceId);
            this.sourceParentDir.add(this.targetEntry);
        }
    }
}

/**
 * CommandInvoker (命令請求者)
 */
export class CommandInvoker {
    public undoStack: BaseCommand[] = [];
    public redoStack: BaseCommand[] = [];
    public notifier = new Subject();

    execute(command: BaseCommand): void {
        command.execute();
        if (command.isUndoable) {
            this.undoStack.push(command);
            this.redoStack = [];
        }

        this.notifier.notify({
            source: 'command',
            type: 'executed',
            message: `[Command] 執行 ${command.name}`,
            data: { name: command.name, sortState: command.newSortState || undefined }
        });
    }

    undo(): BaseCommand | null {
        if (this.undoStack.length === 0) return null;
        const cmd = this.undoStack.pop()!;
        cmd.undo();
        this.redoStack.push(cmd);

        this.notifier.notify({
            source: 'command',
            type: 'undone',
            message: `[Undo] 恢復 ${cmd.name}`,
            data: { name: cmd.name, sortState: cmd.oldSortState || undefined }
        });
        return cmd;
    }

    redo(): BaseCommand | null {
        if (this.redoStack.length === 0) return null;
        const cmd = this.redoStack.pop()!;
        cmd.execute();
        this.undoStack.push(cmd);

        this.notifier.notify({
            source: 'command',
            type: 'redone',
            message: `[Redo] 執行 ${cmd.name}`,
            data: { name: cmd.name, sortState: cmd.newSortState || undefined }
        });
        return cmd;
    }
}

export const commandInvokerInstance = new CommandInvoker();
