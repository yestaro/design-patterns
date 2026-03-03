import { ICodeFetcher } from './CodeFetcher';
import { GitCodeFetcher } from './GitCodeFetcher';

// Vite ?raw 靜態匯入：build 時將檔案內容嵌入為字串
import rawAdapter from '../patterns/Adapter.ts?raw';
import rawCommand from '../patterns/Command.ts?raw';
import rawComposite from '../patterns/Composite.ts?raw';
import rawDecorator from '../patterns/Decorator.ts?raw';
import rawFacade from '../patterns/Facade.ts?raw';
import rawFlyweight from '../patterns/Flyweight.ts?raw';
import rawMediator from '../patterns/Mediator.ts?raw';
import rawObserver from '../patterns/Observer.ts?raw';
import rawSingleton from '../patterns/Singleton.ts?raw';
import rawStrategy from '../patterns/Strategy.ts?raw';
import rawTemplate from '../patterns/Template.ts?raw';
import rawVisitor from '../patterns/Visitor.ts?raw';

/** 檔名 → 原始碼的靜態映射表 */
const rawModules: Record<string, string> = {
    'Adapter.ts': rawAdapter,
    'Command.ts': rawCommand,
    'Composite.ts': rawComposite,
    'Decorator.ts': rawDecorator,
    'Facade.ts': rawFacade,
    'Flyweight.ts': rawFlyweight,
    'Mediator.ts': rawMediator,
    'Observer.ts': rawObserver,
    'Singleton.ts': rawSingleton,
    'Strategy.ts': rawStrategy,
    'Template.ts': rawTemplate,
    'Visitor.ts': rawVisitor,
};

/**
 * 本地 Vite Raw Code Fetcher
 * 使用 Vite 的 ?raw 語法，在編譯期就將程式碼作為字串包入 bundle
 * 優點：無網路請求延遲、離線可用、無 CORS 問題
 */
export class ViteRawCodeFetcher implements ICodeFetcher {
    // 也可組合 GitCodeFetcher 作為 fallback，這裡我們注入它
    constructor(private fallbackFetcher?: ICodeFetcher) {
        if (!this.fallbackFetcher) {
            this.fallbackFetcher = new GitCodeFetcher();
        }
    }

    private resolveFromRaw(url: string): string | null {
        const fileName = url.split('/').pop();
        if (fileName && rawModules[fileName]) {
            return rawModules[fileName];
        }
        return null;
    }

    public async fetchOne(url: string): Promise<string> {
        const rawContent = this.resolveFromRaw(url);
        if (rawContent) return rawContent;

        // 若找不到本地檔案對應，才委派給 fallback 去遠端抓
        return this.fallbackFetcher!.fetchOne(url);
    }

    public async fetchMany(urls: string[]): Promise<string[]> {
        return Promise.all(urls.map(url => this.fetchOne(url)));
    }
}
