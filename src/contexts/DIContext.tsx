import React, { createContext, ReactNode, useContext, useState } from 'react';
import { ICodeFetcher } from '../data/CodeFetcher';
import { ViteRawCodeFetcher } from '../data/ViteRawCodeFetcher';

/**
 * 定義應用程式所有可注入的依賴介面 (DI Container)
 */
interface IDependencies {
    codeFetcher: ICodeFetcher;
    // 未來如果有其他共用服務，可以繼續加在這裡，例如：
    // authService: IAuthService;
    // logger: ILogger;
}

// 建立 DI Context
const DIContext = createContext<IDependencies | null>(null);

/**
 * 依賴注入 (DI) 的全域 Provider
 * 負責實例化並裝配 (Wire) 所有的具體實作，提供給整個 React 元件樹
 */
export const DIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // 集中管理所有的實例
    const [dependencies] = useState<IDependencies>(() => ({
        codeFetcher: new ViteRawCodeFetcher()
    }));

    return (
        <DIContext.Provider value={dependencies}>
            {children}
        </DIContext.Provider>
    );
};

/**
 * 取得 DI Context 內的所有依賴
 */
export const useDI = (): IDependencies => {
    const context = useContext(DIContext);
    if (!context) {
        throw new Error('useDI must be used within a DIProvider');
    }
    return context;
};

/**
 * 提供語義化的 Hook，方便元件只拿自己需要的服務
 */
export const useCodeFetcher = (): ICodeFetcher => {
    const { codeFetcher } = useDI();
    return codeFetcher;
};
