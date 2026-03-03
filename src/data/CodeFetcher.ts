/**
 * ICodeFetcher 介面
 * 定義了取得原始碼的標準行為，符合依賴反轉原則 (DIP)
 */
export interface ICodeFetcher {
    fetchOne(url: string): Promise<string>;
    fetchMany(urls: string[]): Promise<string[]>;
}


