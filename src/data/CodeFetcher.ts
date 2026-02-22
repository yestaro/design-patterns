/**
 * CodeFetcher
 * 負責從 GitHub 遠端抓取原始碼內容的邏輯類別
 */
export class CodeFetcher {
    private static cache: Map<string, string> = new Map();

    /**
     * 將標準 GitHub URL 轉換為 raw.githubusercontent URL
     * 例如: https://github.com/user/repo/blob/main/file.ts
     * 轉換為: https://raw.githubusercontent.com/user/repo/main/file.ts
     */
    private static convertToRawUrl(url: string): string {
        if (url.includes('raw.githubusercontent.com')) return url;

        return url
            .replace('github.com', 'raw.githubusercontent.com')
            .replace('/blob/', '/');
    }

    /**
     * 抓取單一 URL 的內容
     */
    public static async fetchOne(url: string): Promise<string> {
        const rawUrl = this.convertToRawUrl(url);

        // 檢查快取
        if (this.cache.has(rawUrl)) {
            return this.cache.get(rawUrl)!;
        }

        try {
            const response = await fetch(rawUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch code from ${rawUrl}: ${response.statusText}`);
            }
            const content = await response.text();

            // 存入快取
            this.cache.set(rawUrl, content);
            return content;
        } catch (error) {
            console.error('CodeFetcher Error:', error);
            return `// 無法讀取程式碼: ${error instanceof Error ? error.message : '未知錯誤'}`;
        }
    }

    /**
     * 抓取多個 URL 的內容
     */
    public static async fetchMany(urls: string[]): Promise<string[]> {
        return Promise.all(urls.map(url => this.fetchOne(url)));
    }
}
