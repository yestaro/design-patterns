// =============================================================================
// --- Singleton / Flyweight / Adapter / Mediator 單元測試 ---
// =============================================================================

import { beforeEach, describe, expect, it } from 'vitest';
import { DashboardAdapter } from '../src/patterns/Adapter';
import { PlainText } from '../src/patterns/Composite';
import { LabelFactory } from '../src/patterns/Flyweight';
import { TagMediator } from '../src/patterns/Mediator';
import { NotificationEvent } from '../src/patterns/Observer';
import { Clipboard } from '../src/patterns/Singleton';

// ======================== Singleton ========================

describe('Clipboard (Singleton)', () => {
    beforeEach(() => {
        Clipboard.getInstance().clear();
    });

    it('getInstance 回傳同一個實例', () => {
        const a = Clipboard.getInstance();
        const b = Clipboard.getInstance();
        expect(a).toBe(b);
    });

    it('set 後 hasContent 為 true', () => {
        const cb = Clipboard.getInstance();
        const file = new PlainText('f1', 'test.txt', 10, '2025-01-01', 'UTF-8');
        cb.set(file);
        expect(cb.hasContent()).toBe(true);
    });

    it('get 回傳 clone 而非原始物件', () => {
        const cb = Clipboard.getInstance();
        const file = new PlainText('f1', 'test.txt', 10, '2025-01-01', 'UTF-8');
        cb.set(file);
        const result = cb.get();
        expect(result).not.toBeNull();
        expect(result!.id).not.toBe('f1'); // clone 後 id 不同
        expect(result!.name).toContain('Copy of');
    });

    it('clear 後 hasContent 為 false', () => {
        const cb = Clipboard.getInstance();
        cb.set(new PlainText('f1', 'test.txt', 10, '2025-01-01', 'UTF-8'));
        cb.clear();
        expect(cb.hasContent()).toBe(false);
        expect(cb.get()).toBeNull();
    });
});

// ======================== Flyweight ========================

describe('LabelFactory (Flyweight)', () => {
    it('同名標籤回傳同一個 reference', () => {
        const factory = new LabelFactory();
        const a = factory.getLabel('Urgent');
        const b = factory.getLabel('Urgent');
        expect(a).toBe(b); // 同一個記憶體位址
    });

    it('不同名標籤回傳不同實例', () => {
        const factory = new LabelFactory();
        const a = factory.getLabel('Urgent');
        const b = factory.getLabel('Work');
        expect(a).not.toBe(b);
    });

    it('預設色票正確套用', () => {
        const factory = new LabelFactory();
        expect(factory.getLabel('Urgent').color).toBe('bg-red-500');
        expect(factory.getLabel('Work').color).toBe('bg-blue-500');
        expect(factory.getLabel('Personal').color).toBe('bg-green-500');
    });

    it('未定義的標籤使用預設顏色', () => {
        const factory = new LabelFactory();
        expect(factory.getLabel('Custom').color).toBe('bg-slate-500');
    });
});

describe('DashboardAdapter', () => {
    it('update 時正確過濾資料並呼叫 updateStatsFn', () => {
        let result: any = null;
        const adapter = new DashboardAdapter((stats) => { result = stats; }, 10);

        const event: NotificationEvent = {
            source: 'visitor',
            type: 'progress',
            message: 'test',
            data: { currentNode: 'readme.txt', count: 3, nodeType: 'Text' }
        };

        adapter.update(event);

        expect(result).not.toBeNull();
        expect(result.name).toBe('readme.txt');
        expect(result.count).toBe(3);
        expect(result.total).toBe(10);
        expect(result.type).toBe('Text');
    });

    it('data 為空時使用預設值', () => {
        let result: any = null;
        const adapter = new DashboardAdapter((stats) => { result = stats; }, 5);

        const event: NotificationEvent = {
            source: 'system',
            type: 'executed',
            message: 'test'
        };

        adapter.update(event);

        expect(result).not.toBeNull();
        expect(result.name).toBe('-');
        expect(result.count).toBe(0);
        expect(result.total).toBe(5);
        expect(result.type).toBe('-');
    });
});

// ======================== Mediator ========================

describe('TagMediator', () => {
    let mediator: TagMediator;

    beforeEach(() => {
        mediator = new TagMediator();
    });

    it('attach 後 getLabels 能取得標籤', () => {
        mediator.attach('f1', 'Urgent');
        const labels = mediator.getLabels('f1');
        expect(labels).toHaveLength(1);
        expect(labels[0].name).toBe('Urgent');
    });

    it('attach 多個標籤', () => {
        mediator.attach('f1', 'Urgent');
        mediator.attach('f1', 'Work');
        expect(mediator.getLabels('f1')).toHaveLength(2);
    });

    it('detach 後標籤被移除', () => {
        mediator.attach('f1', 'Urgent');
        mediator.detach('f1', 'Urgent');
        expect(mediator.getLabels('f1')).toHaveLength(0);
    });

    it('反向查詢：getFiles 回傳正確的檔案 ID', () => {
        mediator.attach('f1', 'Work');
        mediator.attach('f2', 'Work');
        mediator.attach('f3', 'Personal');
        const workFiles = mediator.getFiles('Work');
        expect(workFiles).toHaveLength(2);
        expect(workFiles).toContain('f1');
        expect(workFiles).toContain('f2');
    });

    it('getLabels 對不存在的 ID 回傳空陣列', () => {
        expect(mediator.getLabels('nonexistent')).toEqual([]);
    });

    it('getFiles 對不存在的標籤回傳空陣列', () => {
        expect(mediator.getFiles('NonExistent')).toEqual([]);
    });

    it('重複 attach 同一標籤不會重複（Set）', () => {
        mediator.attach('f1', 'Urgent');
        mediator.attach('f1', 'Urgent');
        expect(mediator.getLabels('f1')).toHaveLength(1);
        expect(mediator.getFiles('Urgent')).toHaveLength(1);
    });
});
