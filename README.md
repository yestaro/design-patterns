# 檔案管理系統設計模式教學 (File Management System Design Patterns Tutorial)

一個基於 React 的互動式教學應用程式，旨在展示如何運用多種設計模式（Design Patterns）來重構與建構一個健全的檔案管理系統。本專案透過視覺化的方式，幫助開發者理解從程序式程式碼（Procedural Code）轉變為物件導向設計（OOD）、SOLID 原則與 Clean Architecture 的過程。

## 🎯 專案目標

在此專案中，我們模擬了一個檔案管理系統的核心功能，並針對每一個特定的需求場景，應用了最合適的設計模式。目標是讓學習者能夠：

- **理解模式的應用場景**：不僅是理論，更看到實際落地。
- **體驗架構的威力**：透過 Undo/Redo、即時監控等功能，感受良好架構帶來的擴展性。
- **掌握 SOLID 原則**：學習如何寫出低耦合、高內聚的程式碼。

## ✨ 主要功能與應用模式

本專案將不同的功能模組化，並對應到特定的設計模式：

| 功能模組             | 應用設計模式 (Design Pattern)    | 說明                                                                                                    |
| :------------------- | :------------------------------- | :------------------------------------------------------------------------------------------------------ |
| **檔案結構**   | **Composite (組合模式)**   | 將檔案與目錄視為統一的 `EntryComponent`，建立樹狀結構，讓客戶端一致地處理個別物件與組合。             |
| **檔案操作**   | **Command (命令模式)**     | 將剪下、刪除、重新命名等操作封裝為物件，支援操作的排程、與**Undo/Redo** 功能。                    |
| **系統介面**   | **Facade (外觀模式)**      | 提供一個簡單的統一介面 (`FileSystemFacade`)，隱藏背後複雜的子系統（Composite, Command, Visitor 等）。 |
| **遍歷操作**   | **Visitor (訪問者模式)**   | 在不修改檔案結構類別的前提下，定義新的操作（如計算總大小、匯出 XML、搜尋檔案）。                        |
| **狀態監控**   | **Observer (觀察者模式)**  | 當檔案系統狀態改變時（如刪除、新增），自動通知 UI 進行更新（Live Stats、Console Log）。                 |
| **格式裝飾**   | **Decorator (裝飾者模式)** | 動態地為 Console Log 添加顏色、圖示與樣式，而不需修飾原有的 Logger 類別。                               |
| **剪貼簿**     | **Singleton (單例模式)**   | 確保全系統只有一個剪貼簿實例，統一管理複製與貼上的資料。                                                |
| **介面轉換**   | **Adapter (轉接器模式)**   | 將內部的統計數據格式轉換為 Dashboard UI 所需的介面格式。                                                |
| **標籤互動**   | **Mediator (中介者模式)**  | 處理檔案與標籤之間的複雜互動關係，降低物件間的耦合度。                                                  |
| **演算法切換** | **Strategy (策略模式)**    | 動態切換不同的排序或搜尋演算法。                                                                        |

## 🛠️ 技術堆疊 (Tech Stack)

- **核心框架**: [React 19](https://react.dev/)
- **建置工具**: [Vite](https://vitejs.dev/)
- **語言**: [TypeScript](https://www.typescriptlang.org/)
- **樣式**: [TailwindCSS 4](https://tailwindcss.com/)
- **圖表繪製**: [Mermaid.js](https://mermaid.js.org/) (透過 `react-mermaid2`)
- **圖示庫**: [Lucide React](https://lucide.dev/)
- **程式碼呈現**: [React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)

## 🚀 快速開始 (Getting Started)

### 前置需求

確保您的電腦已安裝 [Node.js](https://nodejs.org/) (建議 v18 以上)。

### 安裝與執行

1. **複製專案**

   ```bash
   git clone https://github.com/your-username/my-design-patterns-app.git
   cd my-design-patterns-app
   ```
2. **安裝依賴**

   ```bash
   npm install
   ```
3. **啟動開發伺服器**

   ```bash
   npm run dev
   ```

   瀏覽器將自動開啟 `http://localhost:5173`。

## 📂 專案結構 (Project Structure)

遵循 Clean Architecture 的分層原則：

```text
src/
├── components/      # UI 元件 (View Layer)
│   ├── ExplorerTab.tsx  # 檔案總管互動介面
│   ├── DomainTab.tsx    # 領域模型圖 (UML)
│   ├── ERTab.tsx        # 先體關聯圖 (ER Diagram)
│   ├── CodeTab.tsx      # 程式碼實作展示
│   └── ...
├── patterns/        # 設計模式核心實作 (Domain/Business Logic Layer)
│   ├── Command.ts       # 命令模式實作
│   ├── Composite.ts     # 組合模式實作 (File/Directory)
│   ├── Visitor.ts       # 訪問者模式實作
│   ├── Observer.ts      # 觀察者模式實作
│   └── ...
├── data/            # 靜態資料或假資料
├── assets/          # 靜態資源 (圖片等)
├── App.tsx          # 應用程式入口與路由/Tabs 管理
└── main.tsx         # React 進入點
```

## 📚 學習指南

建議按照應用程式內的 Tab 順序進行探索：

1. **互動探索 (Explorer)**: 實際操作檔案系統，觀察 Console 的 Log 與右側的即時監控，體驗各個模式協作的結果。並可檢視「課程綱要」了解學習路徑。
2. **領域模型 (Domain)**: 查看類別圖 (Class Diagram)，理解物件之間的靜態結構關係。
3. **資料關聯 (ER)**: 理解資料在資料庫層面的儲存結構（雖然本專案為純前端模擬，但展示了對應的 Schema 設計）。
4. **實作解析 (Code)**: 直接閱讀核心程式碼，搭配語法底色標記，深入理解模式的實作細節。
5. **AI 時代 (Reflection)**: 探討在 AI 輔助編碼時代，設計模式角色的轉變與新價值。

## 📝 授權

MIT License
