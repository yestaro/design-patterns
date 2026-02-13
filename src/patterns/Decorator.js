// =============================================================================
// --- [Decorator Implementation] ---
// =============================================================================

import { BaseObserver } from './Observer';

/**
 * HighlightDecorator (顏色裝飾器)
 *
 * 包裝一個 BaseObserver，為符合關鍵字的訊息附加 CSS 顏色樣式。
 * 同一維度內先到先贏（一條訊息只有一種顏色）。
 *
 * [為什麼繼承 BaseObserver?]
 * JavaScript 的 duck typing 讓「只要有 update() 就行」，但繼承 BaseObserver 有兩個好處：
 * 1. 明確表達 Decorator 與被裝飾者實作「相同介面」— 這是 Decorator Pattern 的核心。
 * 2. 保證 LSP (Liskov Substitution): 任何接受 BaseObserver 的地方，都能無縫使用 Decorator。
 */
export class HighlightDecorator extends BaseObserver {
    constructor(wrapped, keyword, style) {
        super();
        this.wrapped = wrapped;
        this.keyword = keyword;
        this.style = style;
    }

    update(event) {
        if (event.message?.includes(this.keyword)) {
            this.wrapped.update({ ...event, highlight: this.style });
        } else {
            this.wrapped.update(event);
        }
    }
}

/**
 * IconDecorator (圖標裝飾器)
 *
 * 為符合關鍵字的訊息附加 emoji 圖標前綴。
 * 與 HighlightDecorator 屬於不同維度，兩者可同時生效（真正的 Decorator 疊加）。
 */
export class IconDecorator extends BaseObserver {
    constructor(wrapped, keyword, icon) {
        super();
        this.wrapped = wrapped;
        this.keyword = keyword;
        this.icon = icon;
    }

    update(event) {
        if (event.message?.includes(this.keyword)) {
            this.wrapped.update({ ...event, icon: this.icon });
        } else {
            this.wrapped.update(event);
        }
    }
}

/**
 * BoldDecorator (粗體裝飾器)
 *
 * 為符合任一關鍵字的訊息加上粗體標記。
 * 接受關鍵字陣列，因為粗體是二元的（開/關），不需要每個關鍵字對應不同值。
 */
export class BoldDecorator extends BaseObserver {
    constructor(wrapped, keywords) {
        super();
        this.wrapped = wrapped;
        this.keywords = keywords;
    }

    update(event) {
        if (this.keywords.some(kw => event.message?.includes(kw))) {
            this.wrapped.update({ ...event, bold: true });
        } else {
            this.wrapped.update(event);
        }
    }
}
