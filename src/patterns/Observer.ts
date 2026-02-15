// =============================================================================
// --- [Infrastructure] 設計模式介面與基礎 ---
// =============================================================================

export type EventSource = 'command' | 'clipboard' | 'visitor' | 'system';
export type EventType = 'executed' | 'undone' | 'redone' | 'set' | 'cleared' | 'progress';

export interface NotificationPayload {
    currentNode?: string;
    count?: number;
    total?: number;
    nodeType?: string;
    sortState?: any;
    [key: string]: any;
}

export interface NotificationEvent {
    source: EventSource;
    type: EventType;
    message: string;
    data?: NotificationPayload;
}

export interface IObserver {
    update(event: NotificationEvent): void;
}

/**
 * Subject (被觀察者 / 主題)
 */
export class Subject {
    private observers: IObserver[] = [];

    subscribe(obs: IObserver): void {
        this.observers.push(obs);
    }

    unsubscribe(obs: IObserver): void {
        this.observers = this.observers.filter(o => o !== obs);
    }

    notify(event: NotificationEvent): void {
        this.observers.forEach(o => o.update(event));
    }
}


// =============================================================================
// --- [Concrete Implementations] 具體實作 ---
// =============================================================================

export interface LogEntry {
    message: string;
}

/**
 * ConsoleObserver (控制台觀察者)
 */
export class ConsoleObserver implements IObserver {
    constructor(private addLogFn: (entry: LogEntry) => void) { }

    update(event: NotificationEvent): void {
        if (event.message) {
            this.addLogFn({
                message: event.message
            });
        }
    }
}
