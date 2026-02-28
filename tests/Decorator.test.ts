// =============================================================================
// --- Decorator Pattern 單元測試 ---
// =============================================================================

import { describe, it, expect } from 'vitest';
import { HighlightDecorator, IconDecorator, BoldDecorator } from '../src/patterns/Decorator';
import { IObserver, NotificationEvent } from '../src/patterns/Observer';

/** 建立簡易的收集器 Observer */
function createCollector() {
    const messages: string[] = [];
    const obs: IObserver = {
        update: (event: NotificationEvent) => messages.push(event.message)
    };
    return { obs, messages };
}

describe('HighlightDecorator', () => {
    it('符合關鍵字時加上 span 標籤', () => {
        const { obs, messages } = createCollector();
        const decorated = new HighlightDecorator(obs, '[Error]', 'text-red-500');

        decorated.update({ source: 'system', type: 'executed', message: '[Error] 發生錯誤' });

        expect(messages[0]).toContain('<span class="text-red-500">');
        expect(messages[0]).toContain('[Error] 發生錯誤');
    });

    it('不符合關鍵字時不裝飾', () => {
        const { obs, messages } = createCollector();
        const decorated = new HighlightDecorator(obs, '[Error]', 'text-red-500');

        decorated.update({ source: 'system', type: 'executed', message: '一般訊息' });

        expect(messages[0]).toBe('一般訊息');
    });

    it('支援陣列關鍵字', () => {
        const { obs, messages } = createCollector();
        const decorated = new HighlightDecorator(obs, ['[Error]', '[Warn]'], 'text-red-500');

        decorated.update({ source: 'system', type: 'executed', message: '[Warn] 注意' });

        expect(messages[0]).toContain('text-red-500');
    });
});

describe('IconDecorator', () => {
    it('符合關鍵字時加上 icon 前綴', () => {
        const { obs, messages } = createCollector();
        const decorated = new IconDecorator(obs, '刪除', '⛔');

        decorated.update({ source: 'system', type: 'executed', message: '刪除項目' });

        expect(messages[0]).toBe('⛔ 刪除項目');
    });

    it('不符合關鍵字時不加 icon', () => {
        const { obs, messages } = createCollector();
        const decorated = new IconDecorator(obs, '刪除', '⛔');

        decorated.update({ source: 'system', type: 'executed', message: '新增項目' });

        expect(messages[0]).toBe('新增項目');
    });
});

describe('BoldDecorator', () => {
    it('符合關鍵字時加上 strong 標籤', () => {
        const { obs, messages } = createCollector();
        const decorated = new BoldDecorator(obs, '[Command]');

        decorated.update({ source: 'system', type: 'executed', message: '[Command] 執行' });

        expect(messages[0]).toBe('<strong>[Command] 執行</strong>');
    });
});

describe('裝飾器鏈條組合', () => {
    it('多層裝飾器依序套用', () => {
        const { obs, messages } = createCollector();
        // 先 icon → 再 highlight → 最後 bold
        let decorated: IObserver = new BoldDecorator(obs, '[Error]');
        decorated = new HighlightDecorator(decorated, '[Error]', 'text-red-500');
        decorated = new IconDecorator(decorated, '[Error]', '❌');

        decorated.update({ source: 'system', type: 'executed', message: '[Error] 失敗' });

        // IconDecorator 最外層先加 icon
        // HighlightDecorator 加上 span
        // BoldDecorator 加上 strong
        expect(messages[0]).toContain('❌');
        expect(messages[0]).toContain('text-red-500');
        expect(messages[0]).toContain('<strong>');
    });
});
