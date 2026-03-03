/**
 * 從整份檔案字串中，嘗試提取對應的 class 或 interface 區塊
 *
 * @param sourceCode 完整的原始碼字串
 * @param targetName 想要抓取的目標名稱 (比如 "Directory" 或 "EntryComponent")
 * @returns 提取出的原始碼區塊。如果找不到，回傳 null。
 */
export function extractClassOrInterface(sourceCode: string, targetName: string): string | null {
    if (!sourceCode || !targetName) return null;

    // 1. 尋找 'class TargetName' 或 'interface TargetName' 或 'abstract class TargetName'
    // Regex 說明:
    // (?:export\s+)?           -> 可能有 export (可選)
    // (?:abstract\s+)?         -> 可能有 abstract (可選)
    // (?:class|interface)\s+   -> class 或 interface (必填)
    // TargetName\b             -> 目標名稱以 word boundary 結尾
    // (*SKIP)(*FAIL) => JS不支援, 用純邏輯匹配:
    const regex = new RegExp(`(?:export\\s+)?(?:abstract\\s+)?(?:class|interface)\\s+${targetName}\\b`);
    const match = sourceCode.match(regex);

    if (!match) {
        return null; // 找不到對應名稱的定義，放棄提取
    }

    const startIndex = match.index!;

    // 2. 找到起始的 '{' 並開始計算括號深度
    let braceDepth = 0;
    let hasStarted = false;
    let contentEndIndex = startIndex;

    for (let i = startIndex; i < sourceCode.length; i++) {
        const char = sourceCode[i];

        if (char === '{') {
            braceDepth++;
            hasStarted = true;
        } else if (char === '}') {
            braceDepth--;
        }

        if (hasStarted && braceDepth === 0) {
            contentEndIndex = i + 1;
            break;
        }
    }

    // 提取內容區塊
    let extracted = sourceCode.substring(startIndex, contentEndIndex);

    // 3. 嘗試把上面的註解 (JSDoc 或 //) 也一起抓進來
    const prefixSource = sourceCode.substring(0, startIndex);

    // 簡單往上找 JSDoc 的 /**
    const lastDocCommentIndex = prefixSource.lastIndexOf('/**');
    const lastBlockCommentEnd = prefixSource.lastIndexOf('*/');

    if (lastDocCommentIndex !== -1 && (lastBlockCommentEnd === -1 || lastBlockCommentEnd < startIndex)) {
        // 確定 /** 到 startIndex 中間沒有其他的 */ 或太多換行（表示真的是這段的註解）
        const textBetween = prefixSource.substring(lastDocCommentIndex);
        // 若沒有多餘的 `class` / `function` 宣告，基本上就是這個 class 的
        if (!textBetween.includes('class') && !textBetween.includes('interface')) {
            extracted = textBetween + extracted;
        }
    } else {
        // 單行註解提取
        const lines = prefixSource.split('\n');
        let i = lines.length - 1;
        let commentPrefix = [];

        while (i > 0) {
            const line = lines[i].trim();
            if (line.startsWith('//')) {
                commentPrefix.unshift(lines[i]);
                i--;
            } else if (line === '') {
                i--; // 空行繼續往上找
            } else {
                break; // 撞到其他程式碼
            }
        }

        if (commentPrefix.length > 0) {
            extracted = commentPrefix.join('\n') + '\n' + extracted;
        }
    }

    return extracted;
}
