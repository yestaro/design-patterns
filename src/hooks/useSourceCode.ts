import { useCallback, useState } from 'react';
import { useCodeFetcher } from '../contexts/DIContext';

/**
 * 共用的程式碼狀態管理 Hook
 * 遵循 DRY 原則，將緩存機制 (Cache) 與載入狀態 (Loading) 封裝以便跨元件使用。
 */
export function useSourceCode() {
    const codeFetcher = useCodeFetcher();

    // 依據字串標籤 (如 tabId 或 day) 存放的快取模型
    const [cache, setCache] = useState<Record<string, string | string[]>>({});
    const [isLoading, setIsLoading] = useState(false);

    /**
     * @param key 存入 Cache 時的識別鍵 (如 activeTab, day.toString())
     * @param files 檔案名稱，支援單一檔案字串，或檔案字串陣列
     */
    const fetchCode = useCallback(async (key: string, files: string | string[]) => {
        // 如果 UI 層已經有該 key 的緩存，直接回傳不觸發網路與 Loading 狀態
        if (cache[key]) {
            return cache[key];
        }

        if (!files || (Array.isArray(files) && files.length === 0)) {
            return null;
        }

        setIsLoading(true);
        try {
            let result;
            if (Array.isArray(files)) {
                result = await codeFetcher.fetchMany(files);
            } else {
                result = await codeFetcher.fetchOne(files);
            }
            // 更新狀態機
            setCache(prev => ({ ...prev, [key]: result }));
            return result;
        } catch (error) {
            console.error('useSourceCode failed to fetch:', error);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [codeFetcher, cache]);

    return {
        codes: cache,
        isLoading,
        fetchCode
    };
}
