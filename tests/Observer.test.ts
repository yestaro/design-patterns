// =============================================================================
// --- Observer Pattern 單元測試 ---
// =============================================================================

import { describe, it, expect } from 'vitest';
import { Subject, ConsoleObserver, LogEntry, NotificationEvent, IObserver } from '../src/patterns/Observer';

describe('Subject', () => {
    it('subscribe 後 notify 能收到事件', () => {
        const subject = new Subject();
        const received: NotificationEvent[] = [];
        const obs: IObserver = { update: (e) => received.push(e) };

        subject.subscribe(obs);
        subject.notify({ source: 'system', type: 'executed', message: 'test' });

        expect(received).toHaveLength(1);
        expect(received[0].message).toBe('test');
    });

    it('unsubscribe 後不再收到事件', () => {
        const subject = new Subject();
        const received: NotificationEvent[] = [];
        const obs: IObserver = { update: (e) => received.push(e) };

        subject.subscribe(obs);
        subject.unsubscribe(obs);
        subject.notify({ source: 'system', type: 'executed', message: 'test' });

        expect(received).toHaveLength(0);
    });

    it('多個訂閱者都能收到通知', () => {
        const subject = new Subject();
        let count = 0;
        const obs1: IObserver = { update: () => count++ };
        const obs2: IObserver = { update: () => count++ };

        subject.subscribe(obs1);
        subject.subscribe(obs2);
        subject.notify({ source: 'system', type: 'executed', message: 'test' });

        expect(count).toBe(2);
    });
});

describe('ConsoleObserver', () => {
    it('收到有 message 的事件時呼叫 addLogFn', () => {
        const logs: LogEntry[] = [];
        const obs = new ConsoleObserver((entry) => logs.push(entry));

        obs.update({ source: 'command', type: 'executed', message: '刪除成功' });

        expect(logs).toHaveLength(1);
        expect(logs[0].message).toBe('刪除成功');
    });

    it('message 為空字串時不呼叫 addLogFn', () => {
        const logs: LogEntry[] = [];
        const obs = new ConsoleObserver((entry) => logs.push(entry));

        obs.update({ source: 'command', type: 'executed', message: '' });

        expect(logs).toHaveLength(0);
    });
});
