import { ICodeFetcher } from './CodeFetcher';

/**
 * 遠端 GitHub Code Fetcher
 * 從 GitHub 遠端動態抓取原始碼
 */
export class GitCodeFetcher implements ICodeFetcher {
    private cache: Map<string, string> = new Map();

    private baseUrl = 'https://raw.githubusercontent.com/yestaro/design-patterns/master/src/patterns/';

    private convertToRawUrl(urlOrFile: string): string {
        // 如果傳入的已經是 http 原生路徑，則嘗試替換 url
        if (urlOrFile.startsWith('http')) {
            if (urlOrFile.includes('raw.githubusercontent.com')) return urlOrFile;
            return urlOrFile
                .replace('github.com', 'raw.githubusercontent.com')
                .replace('/blob/', '/');
        }

        // 否則視為純檔名，拼接 baseUrl
        return `${this.baseUrl}${urlOrFile}`;
    }

    public async fetchOne(url: string): Promise<string> {
        const rawUrl = this.convertToRawUrl(url);

        if (this.cache.has(rawUrl)) {
            return this.cache.get(rawUrl)!;
        }

        try {
            const response = await fetch(rawUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch code from ${rawUrl}: ${response.statusText}`);
            }
            const content = await response.text();
            this.cache.set(rawUrl, content);
            return content;
        } catch (error) {
            console.error('GitCodeFetcher Error:', error);
            return `// 無法讀取程式碼: ${error instanceof Error ? error.message : '未知錯誤'}`;
        }
    }

    public async fetchMany(urls: string[]): Promise<string[]> {
        return Promise.all(urls.map(url => this.fetchOne(url)));
    }
}
