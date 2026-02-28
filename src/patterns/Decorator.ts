// =============================================================================
// --- [Decorator Implementation] ---
// =============================================================================

import { IObserver, NotificationEvent } from './Observer';

/**
 * BaseDecorator (裝飾器基底)
 * 封裝了被包裝的物件 (wrapped) 以及通用的關鍵字比對邏輯。
 */
export abstract class BaseDecorator implements IObserver {
    constructor(protected wrapped: IObserver) { }

    abstract update(event: NotificationEvent): void;

    /**
     * [通用輔助方法] 判斷訊息是否符合指定的關鍵字 (支援單一字串或陣列)
     */
    protected isMatch(message: string, keyword: string | string[]): boolean {
        if (Array.isArray(keyword)) {
            return keyword.some(kw => message.includes(kw));
        }
        return message.includes(keyword);
    }
}

/**
 * HighlightDecorator (顏色裝飾器)
 */
export class HighlightDecorator extends BaseDecorator {
    constructor(
        wrapped: IObserver,
        private keyword: string | string[],
        private style: string
    ) {
        super(wrapped);
    }

    update(event: NotificationEvent): void {
        if (this.isMatch(event.message, this.keyword)) {
            event.message = `<span class="${this.style}">${event.message}</span>`
        }
        this.wrapped.update(event);
    }
}

/**
 * IconDecorator (圖標裝飾器)
 */
export class IconDecorator extends BaseDecorator {
    constructor(
        wrapped: IObserver,
        private keyword: string | string[],
        private icon: string
    ) {
        super(wrapped);
    }

    update(event: NotificationEvent): void {
        if (this.isMatch(event.message, this.keyword)) {
            event.message = `${this.icon} ${event.message}`
        }
        this.wrapped.update(event);
    }
}

/**
 * BoldDecorator (粗體裝飾器)
 */
export class BoldDecorator extends BaseDecorator {
    constructor(
        wrapped: IObserver,
        private keyword: string | string[]
    ) {
        super(wrapped);
    }

    update(event: NotificationEvent): void {
        if (this.isMatch(event.message, this.keyword)) {
            event.message = `<strong>${event.message}</strong>`
        }
        this.wrapped.update(event);
    }
}
