import { BookOpen, Database, Eye, Layers, TableProperties } from "lucide-react";
import mermaid from "mermaid";
import React, { useEffect, useState } from "react";
import CodeBlock from "./shared/CodeBlock";

const ERTab: React.FC = () => {
  const [activeInheritance, setActiveInheritance] = useState<
    "sti" | "cti" | "concrete"
  >("sti");
  const [activeHierarchy, setActiveHierarchy] = useState<
    "adjacency" | "path" | "closure"
  >("adjacency");
  const [activePolymorphic, setActivePolymorphic] = useState<
    "reverse" | "belongsTo" | "exclusive"
  >("reverse");
  const [activeMetadata, setActiveMetadata] = useState<
    "eav" | "json" | "overload"
  >("eav");
  const [activeVersioning, setActiveVersioning] = useState<
    "shadow" | "inline" | "event"
  >("shadow");
  const [activeAudit, setActiveAudit] = useState<"embedded" | "centralized">(
    "embedded",
  );

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
      themeVariables: {
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "14px",
      },
    });
    const renderMermaid = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 50));
        await mermaid.run({ querySelector: ".mermaid-er" });
      } catch (e) {
        console.warn("Mermaid render error:", e);
      }
    };
    renderMermaid();
  }, []);

  return (
    <div className="text-left text-base animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 mb-8 text-left transition-all hover:shadow-md">
        <h2 className="text-xl font-black mb-6 flex items-center gap-2">
          <Database className="text-blue-600" /> 混合 ER 模型 (Hybrid Model:
          JSON + EAV)
        </h2>
        {/* ER Diagram 單欄置中 */}
        <div className="mermaid-er text-sm w-full mx-auto flex justify-center [&>svg]:w-full [&>svg]:max-w-4xl [&>svg]:h-auto">
          {`erDiagram

    Entries ||--o{ EntryAttributes : "has (1:N)"
    Entries ||--o{ EntryTags : "has (N:M)"
    Tags ||--o{ EntryTags : "tagged in"

    Entries["<b>Entries</b> (Composite)"] {
        int EntryID PK
        int ParentID FK "Self-Referencing"
        string Name
        string Type
        int Size
        datetime Created
        jsonb Attributes "Snapshots"
    }
    
    EntryAttributes["<b>EntryAttributes</b> (Extension)"] {
        int AttrID PK
        int EntryID FK
        string AttrName
        string AttrValue
    }
    
    Tags["<b>Tags</b> (Flyweight)"] {
        int TagID PK
        string TagName UK
        string Color
    }
    
    EntryTags["<b>EntryTags</b> (Mediator)"] {
        int EntryID FK
        int TagID FK
    }`}
        </div>
      </div>

      {/* 範例數據 */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 mb-8 text-left transition-all hover:shadow-md">
        <h2 className="text-xl font-black mb-6 flex items-center gap-2">
          <Eye className="text-blue-600" /> 範例數據展示 (Sample Data)
        </h2>
        <div className="space-y-8">
          {/* Row 1: Entries 主表 (滿版) */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
              <Layers size={14} /> 1. Entries 主表實例
            </p>
            <div className="sample-table-container shadow-sm">
              <table className="sample-table whitespace-nowrap">
                <thead className="bg-slate-100/50 text-left">
                  <tr>
                    <th>EntryID</th>
                    <th>ParentID</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Size (KB)</th>
                    <th>Created</th>
                    <th>Attributes (JSON)</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr>
                    <td className="font-mono">101</td>
                    <td className="text-slate-400 font-mono">NULL</td>
                    <td className="font-bold text-blue-600 italic">
                      我的根目錄
                    </td>
                    <td>Dir</td>
                    <td>0</td>
                    <td className="text-xs">2025-01-01</td>
                    <td className="text-slate-400">{"{}"}</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="font-mono">202</td>
                    <td className="font-mono">101</td>
                    <td className="font-bold text-blue-600 italic">專案文件</td>
                    <td>Dir</td>
                    <td>0</td>
                    <td className="text-xs">2025-01-10</td>
                    <td className="text-slate-400">{"{}"}</td>
                  </tr>
                  <tr>
                    <td className="font-mono">303</td>
                    <td className="font-mono">202</td>
                    <td className="font-bold">產品規格書.docx</td>
                    <td>Word</td>
                    <td>500</td>
                    <td className="text-xs">2025-01-10</td>
                    <td className="text-indigo-600">{'{"PageCount": 15}'}</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="font-mono">404</td>
                    <td className="font-mono">202</td>
                    <td className="font-bold">架構設計圖.png</td>
                    <td>Image</td>
                    <td>2048</td>
                    <td className="text-xs">2025-01-12</td>
                    <td className="text-indigo-600">
                      {'{"Width": 1920, "Height": 1080}'}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-mono">505</td>
                    <td className="font-mono">101</td>
                    <td className="font-bold">README.txt</td>
                    <td>Text</td>
                    <td>0.5</td>
                    <td className="text-xs">2025-01-01</td>
                    <td className="text-slate-400">{"{}"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Row 2: 三個細節/關聯表 (三等分) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 min-w-0">
              <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <TableProperties size={14} /> 2. EntryAttributes 細節表實例
              </p>
              <div className="sample-table-container shadow-sm border-indigo-200">
                <table className="sample-table whitespace-nowrap">
                  <thead className="bg-indigo-50/50 text-left">
                    <tr>
                      <th className="text-indigo-800">AttrID</th>
                      <th className="text-indigo-800">EntryID</th>
                      <th className="text-indigo-800">AttrName</th>
                      <th className="text-indigo-800">AttrValue</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    <tr>
                      <td>1</td>
                      <td className="font-mono">303</td>
                      <td className="text-indigo-600 font-bold underline">
                        PageCount
                      </td>
                      <td className="font-mono">15</td>
                    </tr>
                    <tr className="bg-indigo-50/30">
                      <td>2</td>
                      <td className="font-mono">404</td>
                      <td className="text-indigo-600 font-bold underline">
                        Width
                      </td>
                      <td className="font-mono">1920</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3 min-w-0">
              <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <TableProperties size={14} /> 3. EntryTags (Mediator) 實例
              </p>
              <div className="sample-table-container shadow-sm border-rose-200">
                <table className="sample-table whitespace-nowrap">
                  <thead className="bg-rose-50/50 text-left">
                    <tr>
                      <th className="text-rose-800">EntryID (FK)</th>
                      <th className="text-rose-800">TagID (FK)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    <tr>
                      <td className="font-mono">303</td>
                      <td className="font-mono">T1</td>
                    </tr>
                    <tr>
                      <td className="font-mono">303</td>
                      <td className="font-mono">T2</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <Layers size={14} /> 4. Tags (Flyweight) 實例
              </p>
              <div className="sample-table-container shadow-sm border-emerald-200">
                <table className="sample-table whitespace-nowrap">
                  <thead className="bg-emerald-50/50 text-left">
                    <tr>
                      <th className="text-emerald-800">TagID</th>
                      <th className="text-emerald-800">TagName</th>
                      <th className="text-emerald-800">Color</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    <tr>
                      <td className="font-mono">T1</td>
                      <td className="text-emerald-600 font-bold">Urgent</td>
                      <td className="text-xs">
                        <span className="px-2 py-1 rounded bg-red-100 text-red-600">
                          red-500
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="font-mono">T2</td>
                      <td className="text-emerald-600 font-bold">Work</td>
                      <td className="text-xs">
                        <span className="px-2 py-1 rounded bg-blue-100 text-blue-600">
                          blue-500
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-900 rounded-2xl text-white text-base shadow-xl border border-slate-700 text-left">
        <h4 className="text-blue-400 font-bold mb-4 flex items-center gap-2 italic tracking-wider">
          混合架構 (Hybrid) 教學引導
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 leading-relaxed text-left">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <p className="font-bold text-amber-400 mb-2">
              ● 為何要重複存屬性？
            </p>
            <p className="text-sm opacity-80">
              Entries 表的 JSON
              用於「前端呈現」。只需一次查詢主表即可得到快照，減少查詢次數。
            </p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <p className="font-bold text-amber-400 mb-2">
              ● 細節表 (EAV) 用在哪？
            </p>
            <p className="text-sm opacity-80">
              用於「搜尋與分析」。SQL 透過細節表過濾速度遠快於解析
              JSON，且能建立高效索引。
            </p>
          </div>
        </div>
      </div>

      {/* 3. 模式的無所不在 (Patterns Everywhere) */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 text-left space-y-12 mt-8">
        <h2 className="text-xl font-black mb-6 flex items-center gap-2">
          <BookOpen className="text-blue-600" /> Practical Schema Design
        </h2>

        {/* 1. Inheritance Mapping */}
        <section className="space-y-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-slate-800">
                <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-base">
                  1
                </span>
                <h3 className="text-lg font-bold text-slate-800">
                  繼承映射 Inheritance Mapping
                </h3>
              </div>
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-sm text-slate-600 leading-relaxed ml-11">
                <p className="font-bold text-indigo-800 mb-2 flex items-center gap-2">
                  💡 情境決策指南
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <b>子類別差異極小、絕大部分屬性共用？</b> 👉 選{" "}
                    <button
                      onClick={() => setActiveInheritance("sti")}
                      className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none transition-colors"
                    >
                      STI (Single Table Inheritance)
                    </button>
                    ，雖然會有 NULL，但查詢最快、ORM 支援最好。
                  </li>
                  <li>
                    <b>
                      子類別屬性差異大，重視資料庫層級的完整性約束設計，且查詢通常「跨越多個階層」？
                    </b>{" "}
                    👉 選{" "}
                    <button
                      onClick={() => setActiveInheritance("cti")}
                      className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none transition-colors"
                    >
                      CTI (Class Table Inheritance)
                    </button>
                    ，最正規劃，但需忍受 JOIN 效能損耗。
                  </li>
                  <li>
                    <b>
                      子類別屬性差異巨大，且經常需要「獨立查詢」特定子類別？
                    </b>{" "}
                    👉 選{" "}
                    <button
                      onClick={() => setActiveInheritance("concrete")}
                      className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none transition-colors"
                    >
                      Concrete Table Inheritance
                    </button>
                    ，物理隔離，零 JOIN 成本。
                  </li>
                </ul>
              </div>
            </div>

            {/* Inheritance Scorecards Tabs */}
            <div className="flex flex-wrap justify-center gap-3 w-full">
              <button
                onClick={() => setActiveInheritance("sti")}
                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activeInheritance === "sti" ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
              >
                <span
                  className={`text-sm font-black tracking-wide ${activeInheritance === "sti" ? "text-indigo-700" : "text-slate-500"}`}
                >
                  Single Table Inheritance
                </span>
                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Query:</span>
                    <span className="text-amber-500">5/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Integrity:</span>
                    <span className="text-rose-500">2/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Flexibility:</span>
                    <span className="text-rose-500">1/5</span>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setActiveInheritance("cti")}
                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activeInheritance === "cti" ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
              >
                <span
                  className={`text-sm font-black tracking-wide ${activeInheritance === "cti" ? "text-indigo-700" : "text-slate-500"}`}
                >
                  Class Table Inheritance
                </span>
                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Query:</span>
                    <span className="text-amber-500">3/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Integrity:</span>
                    <span className="text-amber-500">5/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Flexibility:</span>
                    <span className="text-amber-500">4/5</span>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setActiveInheritance("concrete")}
                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activeInheritance === "concrete" ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
              >
                <span
                  className={`text-sm font-black tracking-wide ${activeInheritance === "concrete" ? "text-indigo-700" : "text-slate-500"}`}
                >
                  Concrete Table Inheritance
                </span>
                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Query:</span>
                    <span className="text-amber-500">4/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Integrity:</span>
                    <span className="text-amber-500">3/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Flexibility:</span>
                    <span className="text-amber-500">5/5</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeInheritance === "sti" && (
              /* A. STI */
              <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                <div className="flex flex-col gap-2">
                  <h5 className="text-lg font-black text-slate-700 italic">
                    STI (Single Table Inheritance) - 全量寬表映射
                  </h5>
                </div>
                <div className="sample-table-container shadow-lg">
                  <table className="sample-table whitespace-nowrap">
                    <thead>
                      <tr>
                        <th className="bg-slate-100/50">EntryID</th>
                        <th className="italic">ParentID</th>
                        <th>Name</th>
                        <th className="text-indigo-700">Type</th>
                        <th>Size</th>
                        <th className="bg-rose-50 text-rose-600 font-black">
                          PageCount
                        </th>
                        <th className="bg-emerald-50 text-emerald-600 font-black text-center">
                          Width
                        </th>
                        <th className="bg-emerald-50 text-emerald-600 font-black text-center">
                          Height
                        </th>
                        <th className="bg-amber-50 text-amber-700 font-black">
                          Encoding
                        </th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="row-highlight">
                        <td>101</td>
                        <td className="cell-null">NULL</td>
                        <td>我的根目錄</td>
                        <td className="font-bold text-slate-500">Dir</td>
                        <td>0</td>
                        <td className="cell-null">NULL</td>
                        <td className="cell-null">NULL</td>
                        <td className="cell-null">NULL</td>
                        <td className="cell-null">NULL</td>
                        <td className="text-slate-400">2025-01-01</td>
                      </tr>
                      <tr>
                        <td>202</td>
                        <td className="text-slate-400 italic">101</td>
                        <td>專案文件</td>
                        <td className="font-bold text-slate-500">Dir</td>
                        <td>0</td>
                        <td className="cell-null">NULL</td>
                        <td className="cell-null">NULL</td>
                        <td className="cell-null">NULL</td>
                        <td className="cell-null">NULL</td>
                        <td className="text-slate-400">2025-01-10</td>
                      </tr>
                      <tr>
                        <td>303</td>
                        <td className="text-slate-400 italic">202</td>
                        <td>產品規格書.docx</td>
                        <td className="font-black text-rose-600">Word</td>
                        <td>500</td>
                        <td className="bg-rose-50/30 font-black text-rose-700 text-center italic">
                          15
                        </td>
                        <td className="cell-null">NULL</td>
                        <td className="cell-null">NULL</td>
                        <td className="cell-null">NULL</td>
                        <td className="text-slate-400">2025-01-10</td>
                      </tr>
                      <tr>
                        <td>404</td>
                        <td className="text-slate-400 italic">202</td>
                        <td>架構設計圖.png</td>
                        <td className="font-black text-emerald-600">Image</td>
                        <td>2048</td>
                        <td className="cell-null">NULL</td>
                        <td className="bg-emerald-50/30 font-black text-emerald-700 text-center">
                          1920
                        </td>
                        <td className="bg-emerald-50/30 font-black text-emerald-700 text-center">
                          1080
                        </td>
                        <td className="cell-null">NULL</td>
                        <td className="text-slate-400">2025-01-12</td>
                      </tr>
                      <tr>
                        <td>505</td>
                        <td className="text-slate-400 italic">101</td>
                        <td>README.txt</td>
                        <td className="font-black text-amber-600">Text</td>
                        <td>0.5</td>
                        <td className="cell-null">NULL</td>
                        <td className="cell-null">NULL</td>
                        <td className="cell-null">NULL</td>
                        <td className="bg-amber-50/30 font-black text-amber-700 text-center italic">
                          UTF-8
                        </td>
                        <td className="text-slate-400">2025-01-01</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>物理真相：</b>{" "}
                  所有子型別共用同一張大寬表。查詢極快但造成大量 `NULL`
                  浪費，且每增加一個物件類型就必須頻繁修改物理
                  Schema，維護成本最高。
                </p>
              </div>
            )}

            {activeInheritance === "cti" && (
              /* B. CTI */
              <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                <div className="flex flex-col gap-2">
                  <h5 className="text-lg font-black text-slate-700 italic">
                    CTI (Class Table Inheritance) - 階層式正規化
                  </h5>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <div className="border border-slate-200 rounded-xl overflow-x-auto custom-scrollbar shadow-lg shadow-slate-100/50">
                    <table className="sample-table">
                      <caption className="bg-slate-800 text-nowrap">
                        Main Table: Entries_Base
                      </caption>
                      <thead>
                        <tr>
                          <th className="text-red-500">EntryID(PK)</th>
                          <th className="italic">ParentID</th>
                          <th>Name</th>
                          <th className="text-indigo-600">Type</th>
                          <th>Size</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-700">
                        <tr className="row-highlight">
                          <td>101</td>
                          <td className="cell-null">NULL</td>
                          <td className="font-black text-slate-700">
                            我的根目錄
                          </td>
                          <td className="font-bold text-slate-500">Dir</td>
                          <td>0</td>
                          <td className="text-slate-400 text-nowrap">
                            2025-01-01
                          </td>
                        </tr>
                        <tr>
                          <td>202</td>
                          <td className="text-slate-400 italic text-sm">101</td>
                          <td>專案文件</td>
                          <td className="font-bold text-slate-500">Dir</td>
                          <td>0</td>
                          <td className="text-slate-400 text-nowrap">
                            2025-01-10
                          </td>
                        </tr>
                        <tr>
                          <td className="underline text-red-500">303</td>
                          <td className="text-slate-400 italic text-sm">202</td>
                          <td className="italic">產品規格書.docx</td>
                          <td className="font-black text-rose-600 text-sm">
                            Word
                          </td>
                          <td>500</td>
                          <td className="text-slate-400 text-nowrap">
                            2025-01-10
                          </td>
                        </tr>
                        <tr>
                          <td className="underline text-red-500">404</td>
                          <td className="text-slate-400 italic text-sm">202</td>
                          <td className="italic">架構設計圖.png</td>
                          <td className="font-black text-emerald-600 text-sm">
                            Image
                          </td>
                          <td>2048</td>
                          <td className="text-slate-400 text-nowrap">
                            2025-01-12
                          </td>
                        </tr>
                        <tr>
                          <td className="underline text-red-500">505</td>
                          <td className="text-slate-400 italic text-sm">101</td>
                          <td className="italic">README.txt</td>
                          <td className="font-black text-amber-600 text-sm">
                            Text
                          </td>
                          <td>0.5</td>
                          <td className="text-slate-400 text-nowrap">
                            2025-01-01
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="border border-rose-200 rounded-xl overflow-hidden shadow-lg shadow-rose-100/50">
                      <table className="sample-table">
                        <caption className="bg-rose-600">
                          Extension: Word_Only
                        </caption>
                        <thead className="bg-rose-50 text-rose-600 font-black">
                          <tr>
                            <th className="text-red-500 text-sm">
                              EntryID(FK)
                            </th>
                            <th>PageCount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="text-red-500 font-bold px-3 py-2">
                              303
                            </td>
                            <td className="font-black underline text-rose-700 px-3 py-2">
                              15
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="border border-emerald-200 rounded-xl overflow-hidden shadow-lg shadow-emerald-100/50">
                      <table className="sample-table">
                        <caption className="bg-emerald-600">
                          Extension: Image_Only
                        </caption>
                        <thead className="bg-emerald-50 text-emerald-600 font-black">
                          <tr>
                            <th className="text-red-500 text-sm">
                              EntryID(FK)
                            </th>
                            <th>Width</th>
                            <th>Height</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="text-red-500 font-bold px-3 py-2">
                              404
                            </td>
                            <td className="font-black underline text-emerald-700 px-3 py-2">
                              1920
                            </td>
                            <td className="font-black underline text-emerald-700 px-3 py-2">
                              1080
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="border border-amber-200 rounded-xl overflow-hidden shadow-lg shadow-amber-100/50">
                      <table className="sample-table">
                        <caption className="bg-amber-600">
                          Extension: Text_Only
                        </caption>
                        <thead className="bg-amber-50 text-amber-600 font-black">
                          <tr>
                            <th className="text-red-500 text-sm">
                              EntryID(FK)
                            </th>
                            <th>Encoding</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="text-red-500 font-bold px-3 py-2">
                              505
                            </td>
                            <td className="font-black underline text-amber-700 px-3 py-2">
                              UTF-8
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>結構化：</b> 分離共用與特有屬性。模型乾淨但每次強制
                  `JOIN`，查詢負擔隨層級增加。
                </p>

                <div className="mt-6 bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-800">
                  <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-400 font-black text-sm">
                        SQL 範例
                      </span>
                      <span className="text-slate-400 text-xs">
                        查詢「圖片」與「文件」檔案 (多重 LEFT JOIN)
                      </span>
                    </div>
                  </div>
                  <CodeBlock
                    language="sql"
                    code={`SELECT e.EntryID, e.Name, e.Type, i.Width, i.Height, w.PageCount\nFROM Entries_Base e\nLEFT JOIN Images_Only i ON e.EntryID = i.EntryID\nLEFT JOIN Words_Only w ON e.EntryID = w.EntryID\nWHERE e.Type IN ('Image', 'Word');`}
                  />
                </div>
              </div>
            )}

            {activeInheritance === "concrete" && (
              /* C. Concrete Table Inheritance */
              <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                <div className="flex flex-col gap-2">
                  <h5 className="text-lg font-black text-slate-700 italic">
                    Concrete Table Inheritance - 物理隔離
                  </h5>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                  {/* Dirs Table */}
                  <div className="border border-slate-200 rounded-xl overflow-x-auto custom-scrollbar shadow-lg shadow-slate-100/50">
                    <table className="sample-table">
                      <caption className="bg-slate-600 text-nowrap">
                        Physical Table: Directories_Only
                      </caption>
                      <thead className="text-slate-600">
                        <tr>
                          <th>EntryID</th>
                          <th className="italic">ParentID</th>
                          <th>Name</th>
                          <th>Size</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-700">
                        <tr>
                          <td>101</td>
                          <td className="cell-null">NULL</td>
                          <td className="font-black text-slate-700">
                            我的根目錄
                          </td>
                          <td>0</td>
                          <td className="text-slate-400 text-xs">2025-01-01</td>
                        </tr>
                        <tr>
                          <td>202</td>
                          <td className="text-slate-400 italic">101</td>
                          <td>專案文件</td>
                          <td>0</td>
                          <td className="text-slate-400 text-xs">2025-01-10</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Words Table */}
                  <div className="border border-rose-200 rounded-xl overflow-x-auto custom-scrollbar shadow-lg shadow-rose-100/50">
                    <table className="sample-table">
                      <caption className="bg-rose-600">
                        Physical Table: Words_Only
                      </caption>
                      <thead className="text-rose-600">
                        <tr>
                          <th>EntryID</th>
                          <th className="italic">ParentID</th>
                          <th>Name</th>
                          <th className="bg-rose-50 text-rose-600 font-black">
                            PageCount
                          </th>
                          <th>Size</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-700">
                        <tr>
                          <td className="font-bold underline text-red-500">
                            303
                          </td>
                          <td className="text-slate-400 italic">202</td>
                          <td className="italic text-rose-700">
                            產品規格書.docx
                          </td>
                          <td className="bg-rose-50/20 text-rose-700 font-black text-center italic underline">
                            15
                          </td>
                          <td>500</td>
                          <td className="text-slate-400 text-xs text-nowrap">
                            2025-01-10
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Images Table */}
                  <div className="border border-emerald-200 rounded-xl overflow-x-auto custom-scrollbar shadow-lg shadow-emerald-100/50">
                    <table className="sample-table">
                      <caption className="bg-emerald-600">
                        Physical Table: Images_Only
                      </caption>
                      <thead className="text-emerald-600">
                        <tr>
                          <th>EntryID</th>
                          <th className="italic">ParentID</th>
                          <th>Name</th>
                          <th className="bg-emerald-50 text-emerald-600 font-black text-center">
                            Width
                          </th>
                          <th className="bg-emerald-50 text-emerald-600 font-black text-center">
                            Height
                          </th>
                          <th>Size</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-700">
                        <tr>
                          <td className="font-bold underline text-red-500">
                            404
                          </td>
                          <td className="text-slate-400 italic">202</td>
                          <td className="font-black italic text-emerald-700">
                            架構設計圖.png
                          </td>
                          <td className="bg-emerald-50/20 text-emerald-700 font-black text-center underline">
                            1920
                          </td>
                          <td className="bg-emerald-50/20 text-emerald-700 font-black text-center underline">
                            1080
                          </td>
                          <td>2048</td>
                          <td className="text-slate-400 text-xs text-nowrap">
                            2025-01-12
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Texts Table */}
                  <div className="border border-amber-200 rounded-xl overflow-x-auto custom-scrollbar shadow-lg shadow-amber-100/50">
                    <table className="sample-table">
                      <caption className="bg-amber-600">
                        Physical Table: Texts_Only
                      </caption>
                      <thead className="text-amber-600">
                        <tr>
                          <th>EntryID</th>
                          <th className="italic">ParentID</th>
                          <th>Name</th>
                          <th className="bg-amber-50 text-amber-600 font-black text-center">
                            Encoding
                          </th>
                          <th>Size</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-700">
                        <tr>
                          <td className="font-bold underline text-red-500">
                            505
                          </td>
                          <td className="text-slate-400 italic">202</td>
                          <td className="italic text-amber-700">README.txt</td>
                          <td className="bg-amber-50/20 text-amber-700 font-black text-center italic underline">
                            UTF-8
                          </td>
                          <td>10</td>
                          <td className="text-slate-400 text-xs text-nowrap">
                            2025-01-01
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>物理隔離：</b> 每張表完全獨立存儲父類與子類欄位。雖然
                  `JOIN` 為零，但資料完整性與共用欄位的維護（如 Size
                  統計）極為困難，若要跨類別查詢，須 UNION ALL，效能會大幅下降。
                </p>

                <div className="mt-6 bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-800">
                  <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center gap-2">
                    <span className="text-indigo-400 font-black text-sm">
                      SQL 範例
                    </span>
                    <span className="text-slate-400 text-xs">
                      建立全域檔案清單 (大量 UNION ALL)
                    </span>
                  </div>
                  <CodeBlock
                    language="sql"
                    code={`SELECT EntryID, Name, Size, 'Dir' AS Type FROM Directories_Only\nUNION ALL\nSELECT EntryID, Name, Size, 'Word' AS Type FROM Words_Only\nUNION ALL\nSELECT EntryID, Name, Size, 'Image' AS Type FROM Images_Only\nUNION ALL\nSELECT EntryID, Name, Size, 'Text' AS Type FROM Texts_Only;`}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 2. Hierarchy Patterns */}
        <section className="pt-12 border-t border-slate-100 space-y-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-base">
                  2
                </span>
                <h3 className="text-lg font-bold text-slate-800">
                  樹狀結構 Tree Hierarchy
                </h3>
              </div>
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-sm text-slate-600 leading-relaxed ml-11">
                <p className="font-bold text-indigo-800 mb-2 flex items-center gap-2">
                  💡 情境決策指南
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <b>階層很淺（通常 2-3 層），主要只查詢「直屬子節點」？</b>{" "}
                    👉 選{" "}
                    <button
                      onClick={() => setActiveHierarchy("adjacency")}
                      className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none transition-colors"
                    >
                      Adjacency List
                    </button>
                    ，結構最直覺，寫入與移動節點無負擔。
                  </li>
                  <li>
                    <b>
                      需要頻繁且快速地撈取「某個節點底下的所有子子孫孫」（如麵包屑導覽）？
                    </b>{" "}
                    👉 選{" "}
                    <button
                      onClick={() => setActiveHierarchy("path")}
                      className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none transition-colors"
                    >
                      Path Enumeration
                    </button>
                    ，字串 LIKE 搜尋極快，但移動節點成本高。
                  </li>
                  <li>
                    <b>
                      階層極深、需要複雜的祖先/子孫關聯查詢，且必須保證
                      Referential Integrity？
                    </b>{" "}
                    👉 選{" "}
                    <button
                      onClick={() => setActiveHierarchy("closure")}
                      className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none transition-colors"
                    >
                      Closure Table
                    </button>
                    ，用空間換取最靈活的查詢時間。
                  </li>
                </ul>
              </div>
            </div>

            {/* Hierarchy Scorecards Tabs */}
            <div className="flex flex-wrap justify-center gap-3 w-full">
              <button
                onClick={() => setActiveHierarchy("adjacency")}
                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activeHierarchy === "adjacency" ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
              >
                <span
                  className={`text-sm font-black tracking-wide ${activeHierarchy === "adjacency" ? "text-indigo-700" : "text-slate-500"}`}
                >
                  Adjacency List
                </span>
                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Query:</span>
                    <span className="text-rose-500">1/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Integrity:</span>
                    <span className="text-amber-500">5/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Flexibility:</span>
                    <span className="text-amber-500">5/5</span>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setActiveHierarchy("path")}
                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activeHierarchy === "path" ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
              >
                <span
                  className={`text-sm font-black tracking-wide ${activeHierarchy === "path" ? "text-indigo-700" : "text-slate-500"}`}
                >
                  Path Enumeration
                </span>
                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Query:</span>
                    <span className="text-amber-500">4/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Integrity:</span>
                    <span className="text-rose-500">2/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Flexibility:</span>
                    <span className="text-amber-500">3/5</span>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setActiveHierarchy("closure")}
                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activeHierarchy === "closure" ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
              >
                <span
                  className={`text-sm font-black tracking-wide ${activeHierarchy === "closure" ? "text-indigo-700" : "text-slate-500"}`}
                >
                  Closure Table
                </span>
                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Query:</span>
                    <span className="text-amber-500">5/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Integrity:</span>
                    <span className="text-amber-500">4/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Flexibility:</span>
                    <span className="text-rose-500">2/5</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeHierarchy === "adjacency" && (
              /* A. Adjacency List */
              <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                <div className="flex flex-col gap-2">
                  <h5 className="text-lg font-black text-slate-700 italic">
                    Adjacency List (鄰接表) - 最簡物理指標
                  </h5>
                </div>
                <div className="sample-table-container shadow-lg shadow-slate-100/50">
                  <table className="sample-table">
                    <thead>
                      <tr>
                        <th className="text-red-600">EntryID(PK)</th>
                        <th className="text-emerald-600 italic">
                          ParentID(FK)
                        </th>
                        <th>Name</th>
                        <th className="bg-slate-100 text-slate-700 text-center font-black">
                          Sort
                        </th>
                        <th>Size</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      <tr className="row-highlight">
                        <td>101</td>
                        <td className="cell-null">NULL</td>
                        <td className="font-black text-slate-700">
                          我的根目錄
                        </td>
                        <td className="bg-slate-50/80 text-center font-bold">
                          1
                        </td>
                        <td>0</td>
                        <td className="text-slate-400">2025-01-01</td>
                      </tr>
                      <tr>
                        <td>202</td>
                        <td className="underline italic font-black">101</td>
                        <td>專案文件</td>
                        <td className="bg-slate-50/80 text-center font-bold text-slate-700">
                          1
                        </td>
                        <td>0</td>
                        <td className="text-slate-400">2025-01-10</td>
                      </tr>
                      <tr>
                        <td>303</td>
                        <td className="underline italic font-black">202</td>
                        <td>產品規格書.docx</td>
                        <td className="bg-slate-50/80 text-center font-bold text-slate-700">
                          1
                        </td>
                        <td>500</td>
                        <td className="text-slate-400">2025-01-10</td>
                      </tr>
                      <tr>
                        <td>404</td>
                        <td className="underline italic font-black">202</td>
                        <td>架構設計圖.png</td>
                        <td className="bg-slate-50/80 text-center font-bold text-slate-700">
                          2
                        </td>
                        <td>2048</td>
                        <td className="text-slate-400">2025-01-12</td>
                      </tr>
                      <tr>
                        <td>505</td>
                        <td className="underline italic font-black">101</td>
                        <td>README.txt</td>
                        <td className="bg-slate-50/80 text-center font-bold text-slate-700">
                          3
                        </td>
                        <td>0.5</td>
                        <td className="text-slate-400">2025-01-01</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>物理真相：</b>{" "}
                  每個節點只知道自己的父節點。移動節點極快。排序時需增加{" "}
                  <b>Sort</b> 欄位並依 `ORDER BY ParentID, Sort` 查詢。
                </p>
              </div>
            )}

            {activeHierarchy === "path" && (
              /* B. Path Enumeration */
              <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                <div className="flex flex-col gap-2">
                  <h5 className="text-lg font-black text-slate-700 italic">
                    Path Enumeration (路徑枚舉) - 預計算字串存儲
                  </h5>
                </div>
                <div className="sample-table-container shadow-lg shadow-emerald-100/50">
                  <table className="sample-table">
                    <thead>
                      <tr>
                        <th>EntryID</th>
                        <th>Name</th>
                        <th className="text-emerald-600 font-black italic">
                          Materialized Path (Weight-Encoded)
                        </th>
                        <th className="bg-slate-100 text-slate-700 text-center font-black">
                          Sort
                        </th>
                        <th>Size</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      <tr className="row-highlight">
                        <td>101</td>
                        <td className="font-black">我的根目錄</td>
                        <td className="text-slate-400 font-bold">/001:101/</td>
                        <td className="bg-slate-50/80 text-center font-bold">
                          1
                        </td>
                        <td>0</td>
                        <td className="text-slate-400">2025-01-01</td>
                      </tr>
                      <tr>
                        <td>202</td>
                        <td>專案文件</td>
                        <td className="text-emerald-700 font-black italic">
                          /001:101/001:202/
                        </td>
                        <td className="bg-slate-50/80 text-center font-bold">
                          1
                        </td>
                        <td>0</td>
                        <td className="text-slate-400">2025-01-10</td>
                      </tr>
                      <tr>
                        <td>303</td>
                        <td>產品規格書.docx</td>
                        <td className="text-emerald-700 font-black italic">
                          /001:101/001:202/001:303/
                        </td>
                        <td className="bg-slate-50/80 text-center font-bold">
                          1
                        </td>
                        <td>500</td>
                        <td className="text-slate-400">2025-01-10</td>
                      </tr>
                      <tr>
                        <td>404</td>
                        <td>架構設計圖.png</td>
                        <td className="text-emerald-700 font-black italic">
                          /001:101/001:202/002:404/
                        </td>
                        <td className="bg-slate-50/80 text-center font-bold">
                          2
                        </td>
                        <td>2048</td>
                        <td className="text-slate-400">2025-01-12</td>
                      </tr>
                      <tr>
                        <td>505</td>
                        <td>README.txt</td>
                        <td className="text-emerald-700 font-black italic">
                          /001:101/001:202/003:505/
                        </td>
                        <td className="bg-slate-50/80 text-center font-bold">
                          3
                        </td>
                        <td>0.5</td>
                        <td className="text-slate-400">2025-01-01</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>字串匹配：</b> 可將排序權重直接編入路徑（如
                  `/001:ID/`）實現「天然排序免計算」，或像上方一樣維持獨立{" "}
                  <b>Sort</b> 欄位以求靈活。
                </p>
              </div>
            )}

            {activeHierarchy === "closure" && (
              /* C. Closure Table */
              <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                <div className="flex flex-col gap-2">
                  <h5 className="text-lg font-black text-slate-700 italic">
                    Closure Table (閉包表) - 笛卡兒積空間表
                  </h5>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <div className="border border-slate-200 rounded-xl overflow-x-auto custom-scrollbar shadow-lg shadow-slate-100/50">
                    <table className="sample-table">
                      <caption className="bg-slate-800 text-nowrap">
                        Main Table: Entries_Base
                      </caption>
                      <thead>
                        <tr>
                          <th>EntryID(PK)</th>
                          <th>Name</th>
                          <th className="bg-slate-100 text-slate-700 text-center font-black">
                            Sort
                          </th>
                          <th>Size</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-700 border-b border-slate-100">
                        <tr className="row-highlight">
                          <td>101</td>
                          <td className="font-black">我的根目錄</td>
                          <td className="bg-slate-50/80 text-center font-bold">
                            1
                          </td>
                          <td>0</td>
                          <td className="text-slate-400">2025-01-01</td>
                        </tr>
                        <tr>
                          <td>202</td>
                          <td>專案文件</td>
                          <td className="bg-slate-50/80 text-center font-bold">
                            1
                          </td>
                          <td>0</td>
                          <td className="text-slate-400">2025-01-10</td>
                        </tr>
                        <tr>
                          <td>303</td>
                          <td>產品規格書.docx</td>
                          <td className="bg-slate-50/80 text-center font-bold text-slate-700">
                            1
                          </td>
                          <td>500</td>
                          <td className="text-slate-400">2025-01-10</td>
                        </tr>
                        <tr>
                          <td>404</td>
                          <td>架構設計圖.png</td>
                          <td className="bg-slate-50/80 text-center font-bold text-slate-700">
                            2
                          </td>
                          <td>2048</td>
                          <td className="text-slate-400">2025-01-12</td>
                        </tr>
                        <tr>
                          <td>505</td>
                          <td>README.txt</td>
                          <td className="bg-slate-50/80 text-center font-bold text-slate-700">
                            3
                          </td>
                          <td>0.5</td>
                          <td className="text-slate-400">2025-01-01</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="space-y-4">
                    <div className="sample-table-container shadow-lg shadow-indigo-100/50 overflow-hidden">
                      <table className="sample-table">
                        <caption className="bg-indigo-600">
                          Closure Relations Table
                        </caption>
                        <thead>
                          <tr>
                            <th className="text-rose-600">Ancestor</th>
                            <th className="text-indigo-600">Descendant</th>
                            <th className="text-center font-black">Depth</th>
                          </tr>
                        </thead>
                        <tbody className="italic text-slate-700 text-xs">
                          <tr>
                            <td className="text-slate-400">101</td>
                            <td>101</td>
                            <td className="text-center">0</td>
                          </tr>
                          <tr>
                            <td className="font-bold text-slate-500">101</td>
                            <td className="font-black text-indigo-700">202</td>
                            <td className="text-center">1</td>
                          </tr>
                          <tr>
                            <td className="font-bold text-slate-500">101</td>
                            <td className="font-black text-rose-700">303</td>
                            <td className="text-center">2</td>
                          </tr>
                          <tr>
                            <td className="font-bold text-slate-500">202</td>
                            <td className="font-black text-rose-700">303</td>
                            <td className="text-center">1</td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td>...</td>
                            <td>...</td>
                            <td className="text-center">...</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>空間換時間：</b>{" "}
                  最正規、查詢最強大的層級設計。透過一張專門的關聯表紀錄所有「祖先-子代」的笛卡兒積。可應付極度複雜的層級、多重隸屬關係，需要頻繁查詢「任意兩節點關係」的企業級應用。
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 3. Polymorphic Associations */}
        <section className="pt-12 border-t border-slate-100 space-y-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-base">
                  3
                </span>
                <h3 className="text-lg font-bold text-slate-800">
                  多型關聯 Polymorphic Association
                </h3>
              </div>
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-sm text-slate-600 leading-relaxed ml-11">
                <p className="font-bold text-indigo-800 mb-2 flex items-center gap-2">
                  💡 情境決策指南
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <b>
                      關聯對象可能無限擴充，且堅持最高標準的資料庫正規劃與
                      Referential Integrity？
                    </b>{" "}
                    👉 選{" "}
                    <button
                      onClick={() => setActivePolymorphic("reverse")}
                      className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none transition-colors"
                    >
                      Reverse Polymorphic
                    </button>
                    ，建立專屬中介表，解耦最徹底。
                  </li>
                  <li>
                    <b>
                      使用 Rails/Laravel 等 ORM 開發，且極度看重程式碼便利性？
                    </b>{" "}
                    👉 選{" "}
                    <button
                      onClick={() => setActivePolymorphic("belongsTo")}
                      className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none transition-colors"
                    >
                      Polymorphic Belongs-To
                    </button>
                    ，直接使用框架內建支援，開發最快。
                  </li>
                  <li>
                    <b>
                      未來要關聯的實體數量確定且很少（就固定 2-3
                      個），且不允許資料髒亂？
                    </b>{" "}
                    👉 選{" "}
                    <button
                      onClick={() => setActivePolymorphic("exclusive")}
                      className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none transition-colors"
                    >
                      Exclusive Foreign Keys
                    </button>
                    ，完全確保關聯實體存在。
                  </li>
                </ul>
              </div>
            </div>

            {/* Polymorphic Scorecards Tabs */}
            <div className="flex flex-wrap justify-center gap-3 w-full">
              <button
                onClick={() => setActivePolymorphic("reverse")}
                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activePolymorphic === "reverse" ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
              >
                <span
                  className={`text-sm font-black tracking-wide ${activePolymorphic === "reverse" ? "text-indigo-700" : "text-slate-500"}`}
                >
                  Reverse Polymorphic
                </span>
                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Query:</span>
                    <span className="text-amber-500">5/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Integrity:</span>
                    <span className="text-amber-500">4/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Flexibility:</span>
                    <span className="text-amber-500">4/5</span>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setActivePolymorphic("belongsTo")}
                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activePolymorphic === "belongsTo" ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
              >
                <span
                  className={`text-sm font-black tracking-wide ${activePolymorphic === "belongsTo" ? "text-indigo-700" : "text-slate-500"}`}
                >
                  Polymorphic Belongs-To
                </span>
                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Query:</span>
                    <span className="text-amber-500">4/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Integrity:</span>
                    <span className="text-rose-500">2/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Flexibility:</span>
                    <span className="text-amber-500">5/5</span>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setActivePolymorphic("exclusive")}
                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activePolymorphic === "exclusive" ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
              >
                <span
                  className={`text-sm font-black tracking-wide ${activePolymorphic === "exclusive" ? "text-indigo-700" : "text-slate-500"}`}
                >
                  Exclusive Foreign Keys
                </span>
                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Query:</span>
                    <span className="text-amber-500">4/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Integrity:</span>
                    <span className="text-amber-500">5/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Flexibility:</span>
                    <span className="text-amber-500">3/5</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activePolymorphic === "reverse" && (
              <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                <div className="flex flex-col gap-2">
                  <h5 className="text-lg font-black text-slate-700 italic">
                    Reverse Polymorphic (交叉中間表) - 高度正規化設計
                  </h5>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <b>情境：</b>{" "}
                    建立專屬的關聯表！誰要貼標籤，就為誰開一張專屬的中介表。如果是採
                    STI/CTI，那就是ENTRYTAGS；若採Concrete Table，就為 Words
                    建立 `WordTags` 表；為 Images 建立 `ImageTags` 表。
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  {/* 1. EntryTags (If using Inheritance) */}
                  <div className="sample-table-container shadow-lg shadow-indigo-100/50 overflow-hidden">
                    <table className="sample-table">
                      <caption className="bg-indigo-600">
                        Single/Class Table：EntryTags 表
                      </caption>
                      <thead>
                        <tr>
                          <th className="text-indigo-600">
                            EntryID (連至 Entries_Base)
                          </th>
                          <th>TagID (連至 Tags)</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-700 bg-white">
                        <tr>
                          <td className="text-indigo-700 font-bold">
                            303{" "}
                            <span className="text-xs font-normal text-slate-400">
                              Word
                            </span>
                          </td>
                          <td>1</td>
                        </tr>
                        <tr>
                          <td className="text-indigo-700 font-bold">
                            303{" "}
                            <span className="text-xs font-normal text-slate-400">
                              Word
                            </span>
                          </td>
                          <td>2</td>
                        </tr>
                        <tr className="bg-slate-50">
                          <td className="text-indigo-700 font-bold">
                            404{" "}
                            <span className="text-xs font-normal text-slate-400">
                              Image
                            </span>
                          </td>
                          <td>1</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 2. WordTags */}
                  <div className="sample-table-container shadow-lg shadow-rose-100/50 overflow-hidden">
                    <table className="sample-table">
                      <caption className="bg-rose-600">
                        Table Inheritance: WordTags 表
                      </caption>
                      <thead>
                        <tr>
                          <th className="text-rose-600">WordID (強 FK 約束)</th>
                          <th>TagID (強 FK 約束)</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-700 bg-white">
                        <tr>
                          <td className="text-rose-700 font-bold">303</td>
                          <td>1</td>
                        </tr>
                        <tr>
                          <td className="text-rose-700 font-bold">303</td>
                          <td>2</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 3. ImageTags */}
                  <div className="sample-table-container shadow-lg shadow-emerald-100/50 overflow-hidden">
                    <table className="sample-table">
                      <caption className="bg-emerald-600">
                        Table Inheritance: ImageTags 表
                      </caption>
                      <thead>
                        <tr>
                          <th className="text-emerald-600">
                            ImageID (強 FK 約束)
                          </th>
                          <th>TagID (強 FK 約束)</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-700 bg-white">
                        <tr className="bg-slate-50">
                          <td className="text-emerald-700 font-bold">404</td>
                          <td>1</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium mt-6">
                  <b>高度解耦：</b> 符合正規化精神且保留穩固的 FK 約束。如果是{" "}
                  <b>Concrete Table Inheritance</b>{" "}
                  的設計，未來擴充實體時，只需新增專屬的關聯表（如
                  `VideoTags`），完全無需異動既有資料表。
                </p>
              </div>
            )}
            {activePolymorphic === "belongsTo" && (
              <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                <div className="flex flex-col gap-2">
                  <h5 className="text-lg font-black text-slate-700 italic">
                    Polymorphic Belongs-To (多型外部鍵) - ORM 預設的最愛
                  </h5>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <b>情境：</b> 建立一張「通用」的 `ItemTags` 關聯表。使用
                    `ItemType` 記錄目標表格名稱 (Word 還是
                    Image，甚至將來不是檔案的Tag，而是針對其它表的Tag)，`ItemID`
                    記錄它的 ID。
                  </p>
                </div>
                <div className="sample-table-container shadow-lg shadow-slate-100/50">
                  <table className="sample-table">
                    <thead>
                      <tr>
                        <th>TagID (FK)</th>
                        <th className="text-rose-600 font-black bg-rose-50/50">
                          ItemType (字串字面量)
                        </th>
                        <th className="text-rose-600 font-black bg-rose-50/50">
                          ItemID (弱約束數值)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      <tr>
                        <td>1</td>
                        <td className="text-rose-700 font-bold italic">
                          'Word'
                        </td>
                        <td>303</td>
                      </tr>
                      <tr>
                        <td>2</td>
                        <td className="text-rose-700 font-bold italic">
                          'Word'
                        </td>
                        <td>303</td>
                      </tr>
                      <tr className="bg-slate-50">
                        <td>1</td>
                        <td className="text-emerald-700 font-bold italic">
                          'Image'
                        </td>
                        <td>404</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>動態映射：</b>{" "}
                  表格結構不變，保有極高的擴充性，容易在應用程式端實作（如 Rails
                  的 Polymorphic Associations）。
                </p>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>潛在限制：</b>{" "}
                  <code className="text-rose-500 font-bold">
                    ItemID 無法在資料庫層級建立有效的 Foreign Key 約束
                  </code>
                  。如果來源實體被刪除，這裡可能會留下失去指向的「孤兒記錄
                  (Orphan Records)」。
                </p>
              </div>
            )}
            {activePolymorphic === "exclusive" && (
              <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                <div className="flex flex-col gap-2">
                  <h5 className="text-lg font-black text-slate-700 italic">
                    Exclusive Foreign Keys (互斥外部鍵) - DBA 的嚴謹堅持
                  </h5>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <b>情境：</b> 還是只有一張通用的 `ItemTags`
                    關聯表，但為「每一個可能會被貼標籤的實體」，都預先開一個專屬的獨立
                    ID 欄位 (WordID, ImageID)，並設定可空性約束。
                  </p>
                </div>
                <div className="sample-table-container shadow-lg shadow-slate-100/50">
                  <table className="sample-table">
                    <thead>
                      <tr>
                        <th>TagID (FK)</th>
                        <th className="text-rose-600">
                          WordID (具 FK 約束, 可 NULL)
                        </th>
                        <th className="text-emerald-600">
                          ImageID (具 FK 約束, 可 NULL)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      <tr>
                        <td>1</td>
                        <td className="text-rose-700 font-bold">303</td>
                        <td className="text-slate-300 italic">NULL</td>
                      </tr>
                      <tr>
                        <td>2</td>
                        <td className="text-rose-700 font-bold">303</td>
                        <td className="text-slate-300 italic">NULL</td>
                      </tr>
                      <tr className="bg-slate-50">
                        <td>1</td>
                        <td className="text-slate-300 italic">NULL</td>
                        <td className="text-emerald-700 font-bold">404</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>嚴謹約束：</b> 每個實體欄位都能建立真實的 Foreign
                  Key，可透過資料庫的 `CHECK CONSTRAINT` 確保「單筆記錄只有一個
                  FK 有值」，維持關聯正確性。
                </p>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>架構負擔：</b> 未來若新增可關聯實體（如新增 Videos
                  表），就必須修改 Schema 增加{" "}
                  <code className="text-rose-500 font-bold">VideoID</code>{" "}
                  欄位，擴充流程繁瑣且容易產生過多 NULL 值。
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 4. Metadata & Attribute Patterns */}
        <section className="pt-12 border-t border-slate-100 space-y-8 pb-12">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-base">
                  4
                </span>
                <h3 className="text-lg font-bold text-slate-800">
                  元數據與屬性 Metadata / Attributes
                </h3>
              </div>
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-sm text-slate-600 leading-relaxed ml-11">
                <p className="font-bold text-indigo-800 mb-2 flex items-center gap-2">
                  💡 情境決策指南
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <b>
                      需要把動態屬性當作頻繁的 SQL
                      搜尋條件（例如「找出所有螢幕尺寸包含 1080p」的商品）？
                    </b>{" "}
                    👉 考慮{" "}
                    <button
                      onClick={() => setActiveMetadata("eav")}
                      className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none transition-colors"
                    >
                      EAV
                    </button>
                    ，方便建立索引。
                  </li>
                  <li>
                    <b>
                      動態屬性只是純撈取展示，幾乎不作為 JOIN 或複雜 WHERE
                      條件？
                    </b>{" "}
                    👉 秒選{" "}
                    <button
                      onClick={() => setActiveMetadata("json")}
                      className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none transition-colors"
                    >
                      Hybrid JSON
                    </button>
                    ，單表單欄位輕鬆搞定。
                  </li>
                  <li>
                    <b>
                      系統是老舊框架，不支援 JSON，DBA
                      也不准開新表（或開表流程極繁瑣）？
                    </b>{" "}
                    👉 考慮{" "}
                    <button
                      onClick={() => setActiveMetadata("overload")}
                      className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none transition-colors"
                    >
                      Multi-Column Overload
                    </button>{" "}
                    作為過渡妥協方案。
                  </li>
                </ul>
              </div>
            </div>

            {/* Metadata Scorecards Tabs */}
            <div className="flex flex-wrap justify-center gap-3 w-full">
              <button
                onClick={() => setActiveMetadata("eav")}
                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activeMetadata === "eav" ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
              >
                <span
                  className={`text-sm font-black tracking-wide ${activeMetadata === "eav" ? "text-indigo-700" : "text-slate-500"}`}
                >
                  EAV (Entity-Attribute-Value)
                </span>
                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Query:</span>
                    <span className="text-rose-500">2/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Integrity:</span>
                    <span className="text-rose-500">2/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Flexibility:</span>
                    <span className="text-amber-500">5/5</span>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setActiveMetadata("json")}
                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activeMetadata === "json" ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
              >
                <span
                  className={`text-sm font-black tracking-wide ${activeMetadata === "json" ? "text-indigo-700" : "text-slate-500"}`}
                >
                  Hybrid JSON
                </span>
                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Query:</span>
                    <span className="text-amber-500">4/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Integrity:</span>
                    <span className="text-amber-500">3/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Flexibility:</span>
                    <span className="text-amber-500">4/5</span>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setActiveMetadata("overload")}
                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activeMetadata === "overload" ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
              >
                <span
                  className={`text-sm font-black tracking-wide ${activeMetadata === "overload" ? "text-indigo-700" : "text-slate-500"}`}
                >
                  Multi-Column Overload
                </span>
                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Query:</span>
                    <span className="text-amber-500">5/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Integrity:</span>
                    <span className="text-amber-500">4/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Flexibility:</span>
                    <span className="text-rose-500">2/5</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeMetadata === "eav" && (
              <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                <div className="flex flex-col gap-2">
                  <h5 className="text-lg font-black text-slate-700 italic">
                    EAV (Entity-Attribute-Value) - 無限擴充的屬性清單
                  </h5>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <b>情境：</b> 也就是最上方「混合模型」裡的 `EntryAttributes`
                    表。不論未來增加什麼新屬性（例如：Author,
                    Resolution），都不用修改
                    Schema，而是以「行(Row)」的形式無限寫入這張表。
                  </p>
                </div>
                <div className="sample-table-container shadow-lg shadow-indigo-100/50">
                  <table className="sample-table">
                    <thead>
                      <tr>
                        <th>AttrID (PK)</th>
                        <th className="text-rose-600">EntryID (FK)</th>
                        <th className="text-indigo-600">AttrName (屬性鍵)</th>
                        <th className="text-emerald-600">
                          AttrValue (屬性值字串)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      <tr>
                        <td>1001</td>
                        <td className="text-rose-700 font-bold">303</td>
                        <td className="text-indigo-700 font-bold">Author</td>
                        <td className="text-emerald-700">John Doe</td>
                      </tr>
                      <tr>
                        <td>1002</td>
                        <td className="text-rose-700 font-bold">303</td>
                        <td className="text-indigo-700 font-bold">PageCount</td>
                        <td className="text-emerald-700">15</td>
                      </tr>
                      <tr className="bg-slate-50">
                        <td>1003</td>
                        <td className="text-rose-700 font-bold">404</td>
                        <td className="text-indigo-700 font-bold">Width</td>
                        <td className="text-emerald-700">1920</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>屬性列化：</b>{" "}
                  高度靈活，適合屬性極端稀疏、未知或動態變化的業務需求（如電商商品規格）。
                </p>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>效能與型別限制：</b> 查詢實體的多個屬性時，需要進行昂貴的{" "}
                  <code className="text-rose-500 font-bold">多次自我 JOIN</code>
                  ，資料庫負擔大會有顯著的效能折損。此外，所有數值通常被轉存為字串，難以實施型別和範圍檢查。
                </p>
              </div>
            )}
            {activeMetadata === "json" && (
              <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                <div className="flex flex-col gap-2">
                  <h5 className="text-lg font-black text-slate-700 italic">
                    Hybrid JSON / Document Storage - 現代主流混合設計
                  </h5>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <b>情境：</b> 如同第一大單元「混合模型」裡 `Entries` 表內的
                    `Attributes (JSONB)` 欄位。將變動性高的屬性結構化為 JSON
                    格式，直接存儲於單一欄位中。
                  </p>
                </div>
                <div className="sample-table-container shadow-lg shadow-slate-100/50">
                  <table className="sample-table">
                    <thead>
                      <tr>
                        <th className="text-blue-600">EntryID (PK)</th>
                        <th>Name</th>
                        <th className="text-blue-600">
                          Attributes (JSONB 欄位)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      <tr>
                        <td className="font-bold">303</td>
                        <td>產品規格書.docx</td>
                        <td className="font-mono text-xs text-blue-800 bg-blue-50/20">
                          {'{ "Author": "John", "Pages": 15 }'}
                        </td>
                      </tr>
                      <tr className="bg-slate-50">
                        <td className="font-bold">404</td>
                        <td>架構設計圖.png</td>
                        <td className="font-mono text-xs text-blue-800 bg-blue-50/20">
                          {'{ "Width": 1920, "Height": 1080 }'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>混合存儲：</b> 大幅簡化了查詢語法與複雜度（降低 JOIN
                  的依賴），一次讀取即可取得關聯屬性，兼顧關聯式資料庫的嚴謹性與
                  Document 結構的彈性。
                </p>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>使用場景：</b> 主流資料庫 (PostgreSQL, MySQL)
                  皆有良好支援。不過，若頻繁更新 JSON 內部的細微節點，或需常以
                  JSON 內容當作高頻 JOIN/WHERE 條件，仍會面臨資源消耗的議題。
                </p>
              </div>
            )}
            {activeMetadata === "overload" && (
              <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                <div className="flex flex-col gap-2">
                  <h5 className="text-lg font-black text-slate-700 italic">
                    Multi-Column Overload (溢出表格) - 傳統寬表妥協設計
                  </h5>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <b>情境：</b> 避免變更主表結構，而是另外建立一張
                    `Entries_ExtraData` 副表，並預先定義了 `StringAttr1`,
                    `StringAttr2`, `IntAttr1` 等多個泛用型預留欄位。
                  </p>
                </div>
                <div className="sample-table-container shadow-lg shadow-amber-100/50">
                  <table className="sample-table">
                    <thead>
                      <tr>
                        <th className="text-blue-600">EntryID</th>
                        <th className="text-amber-600">StringAttr1</th>
                        <th className="text-amber-600">StringAttr2</th>
                        <th className="text-emerald-600">IntAttr1</th>
                        <th className="text-emerald-600">IntAttr2</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      <tr>
                        <td className="text-blue-700 font-bold">303</td>
                        <td className="text-amber-700">"John" (當作 Author)</td>
                        <td className="text-slate-300 italic">NULL</td>
                        <td className="text-emerald-700">
                          15 (當作 PageCount)
                        </td>
                        <td className="text-slate-300 italic">NULL</td>
                      </tr>
                      <tr className="bg-slate-50">
                        <td className="text-blue-700 font-bold">404</td>
                        <td className="text-amber-700">"1920x1080"</td>
                        <td className="text-amber-700">"PNG"</td>
                        <td className="text-slate-300 italic">NULL</td>
                        <td className="text-slate-300 italic">NULL</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>分層寬表：</b>{" "}
                  讀取特定屬性時有不錯的掃描效能，並保留了基本的資料庫型別特質，也沒有額外的
                  JSON 解析負擔。
                </p>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>維護負擔：</b> 開發端必須額外維護一份{" "}
                  <code className="text-rose-500 font-bold">對應字典</code>
                  ，才能翻譯泛用欄位代表的商業邏輯。預留欄位耗盡時仍需變更
                  Schema。由於 JSON 類型普及，此作法已逐漸減少使用。
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 5. Versioning Patterns */}
        <section className="pt-12 border-t border-slate-100 space-y-8 pb-12">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-base">
                  5
                </span>
                <h3 className="text-lg font-bold text-slate-800">
                  版本控制 Versioning & History
                </h3>
              </div>
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-sm text-slate-600 leading-relaxed ml-11">
                <p className="font-bold text-indigo-800 mb-2 flex items-center gap-2">
                  💡 情境決策指南
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <b>最標準的作法，查詢線上資料時絕對不想被歷史紀錄干擾？</b>{" "}
                    👉 選{" "}
                    <button
                      onClick={() => setActiveVersioning("shadow")}
                      className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none transition-colors"
                    >
                      Shadow Table (影子表)
                    </button>
                    ，效能與架構最乾淨。
                  </li>
                  <li>
                    <b>
                      需要頻繁比較不同版本，或是同一個實體允許同時存在多個「草稿」分支？
                    </b>{" "}
                    👉 選{" "}
                    <button
                      onClick={() => setActiveVersioning("inline")}
                      className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none transition-colors"
                    >
                      Inline Versioning (行內版本)
                    </button>
                    。
                  </li>
                  <li>
                    <b>
                      極度重視「操作歷程」，需要紀錄誰在什麼時候修改了哪裡的字（甚至需要復原到精確秒數）？
                    </b>{" "}
                    👉 選{" "}
                    <button
                      onClick={() => setActiveVersioning("event")}
                      className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none transition-colors"
                    >
                      Event Sourcing (事件溯源)
                    </button>
                    。
                  </li>
                </ul>
              </div>
            </div>

            {/* Versioning Scorecards Tabs */}
            <div className="flex flex-wrap justify-center gap-3 w-full">
              <button
                onClick={() => setActiveVersioning("shadow")}
                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activeVersioning === "shadow" ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
              >
                <span
                  className={`text-sm font-black tracking-wide ${activeVersioning === "shadow" ? "text-indigo-700" : "text-slate-500"}`}
                >
                  Shadow Table (影子表)
                </span>
                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Query:</span>
                    <span className="text-amber-500">5/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Integrity:</span>
                    <span className="text-amber-500">4/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Traceability:</span>
                    <span className="text-amber-500">4/5</span>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setActiveVersioning("inline")}
                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activeVersioning === "inline" ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
              >
                <span
                  className={`text-sm font-black tracking-wide ${activeVersioning === "inline" ? "text-indigo-700" : "text-slate-500"}`}
                >
                  Row Versioning (行內版本)
                </span>
                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Query:</span>
                    <span className="text-rose-500">2/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Integrity:</span>
                    <span className="text-amber-500">3/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Traceability:</span>
                    <span className="text-amber-500">4/5</span>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setActiveVersioning("event")}
                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activeVersioning === "event" ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
              >
                <span
                  className={`text-sm font-black tracking-wide ${activeVersioning === "event" ? "text-indigo-700" : "text-slate-500"}`}
                >
                  Event Sourcing (事件溯源)
                </span>
                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Query:</span>
                    <span className="text-rose-500">1/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Integrity:</span>
                    <span className="text-amber-500">5/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Traceability:</span>
                    <span className="text-amber-500">5/5</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeVersioning === "shadow" && (
              <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                <div className="flex flex-col gap-2">
                  <h5 className="text-lg font-black text-slate-700 italic">
                    Shadow Table (影子歷史表) - 主從分離的最乾淨設計
                  </h5>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <b>情境：</b> 主表{" "}
                    <code className="bg-white px-1 py-0.5 rounded border border-slate-200">
                      Entries
                    </code>{" "}
                    只保存「最新/正式」狀態。任何時候 UPDATE 或 DELETE
                    主表，就觸發邏輯（程式碼或 DB
                    Trigger），把舊資料複製一份存入結構完全一樣的{" "}
                    <code className="bg-white px-1 py-0.5 rounded border border-slate-200">
                      Entries_History
                    </code>{" "}
                    表裡。
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <div className="sample-table-container shadow-lg shadow-slate-200/50 overflow-hidden">
                    <table className="sample-table">
                      <caption className="bg-slate-800">
                        主表：Entries (永遠最新)
                      </caption>
                      <thead>
                        <tr>
                          <th className="text-red-500">EntryID (PK)</th>
                          <th>Name</th>
                          <th>Type</th>
                          <th>Size</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-700 bg-white">
                        <tr className="bg-slate-50">
                          <td className="font-bold text-red-500">303</td>
                          <td>產品規格書.docx</td>
                          <td className="text-slate-500 font-bold">Word</td>
                          <td>500</td>
                          <td className="text-slate-400">2025-01-10</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="sample-table-container shadow-lg shadow-amber-100/50 overflow-hidden">
                    <table className="sample-table">
                      <caption className="bg-amber-600">
                        歷史表：Entries_History (追加寫入)
                      </caption>
                      <thead>
                        <tr>
                          <th className="text-amber-700">HistoryID</th>
                          <th className="text-rose-500">
                            EntryID (無 FK 約束)
                          </th>
                          <th>Name</th>
                          <th>Type</th>
                          <th>Size</th>
                          <th className="text-indigo-600 font-bold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-700 bg-white text-xs">
                        <tr>
                          <td>1</td>
                          <td className="font-bold text-rose-500">303</td>
                          <td className="italic text-slate-500">
                            規格書 V1.docx
                          </td>
                          <td className="text-slate-500">Word</td>
                          <td className="text-slate-400">100</td>
                          <td className="text-emerald-600 font-bold">INSERT</td>
                        </tr>
                        <tr className="bg-slate-50">
                          <td>2</td>
                          <td className="font-bold text-rose-500">303</td>
                          <td className="italic text-slate-500">
                            規格書 草稿.docx
                          </td>
                          <td className="text-slate-500">Word</td>
                          <td className="text-slate-400">350</td>
                          <td className="text-indigo-600 font-bold">UPDATE</td>
                        </tr>
                        <tr>
                          <td>3</td>
                          <td className="font-bold text-rose-500">404</td>
                          <td className="italic text-slate-500">
                            舊版架構設計圖.png
                          </td>
                          <td className="text-slate-500">Image</td>
                          <td className="text-slate-400">2048</td>
                          <td className="text-rose-600 font-bold">DELETE</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>極速查詢：</b> 全域搜尋或 JOIN
                  主表時，效能不受成千上萬筆歷史紀錄的拖累（因為它們被物理隔離了）。
                </p>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>關鍵細節：</b>{" "}
                  <code className="text-rose-500 font-bold">
                    歷史表的 EntryID 絕對不能建立 Foreign Key 約束
                  </code>
                  ！就如同表中的{" "}
                  <code className="font-bold text-red-500">404</code>
                  ，如果主表資料被刪除了，而這裡又有強 FK
                  綁定，資料庫就會報錯阻止刪除（或引發 CASCADE
                  災難把珍貴的歷程全砍了）。所以這理只能是個「軟關聯」的數字。
                </p>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>架構負擔：</b> 需維護兩張 Schema
                  相同的表。每次主表加減欄位（如新增
                  `Author`），影子表也必須跟著 ALTER TABLE。
                </p>
              </div>
            )}
            {activeVersioning === "inline" && (
              <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                <div className="flex flex-col gap-2">
                  <h5 className="text-lg font-black text-slate-700 italic">
                    Row Versioning (行內版本) - 狀態維度合併
                  </h5>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <b>情境：</b>{" "}
                    不開新表，所有的新舊資料全部混在一起存。取消原本把 PK
                    當作唯一識別的方法，改以一個代表號（如
                    `DocumentID`），結合一個 `Version` 或 `IsCurrent`
                    的旗標來設計 Schema。
                  </p>
                </div>
                <div className="sample-table-container shadow-lg shadow-indigo-100/50">
                  <table className="sample-table">
                    <thead>
                      <tr>
                        <th className="text-red-500">EntryID (PK)</th>
                        <th className="text-purple-600">DocID (文件群組)</th>
                        <th className="text-emerald-600 font-black">
                          IsCurrent
                        </th>
                        <th className="text-emerald-600 font-black">Version</th>
                        <th>Content</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      <tr className="text-slate-400 opacity-70">
                        <td className="font-bold text-red-500">1</td>
                        <td className="font-bold text-purple-600">101</td>
                        <td className="font-bold text-slate-400">FALSE</td>
                        <td className="font-bold">1.0</td>
                        <td>文件初稿...</td>
                      </tr>
                      <tr className="bg-emerald-50/50">
                        <td className="font-bold text-red-500">2</td>
                        <td className="font-bold text-purple-600">101</td>
                        <td className="font-black text-emerald-600">TRUE</td>
                        <td className="font-black text-emerald-600">2.0</td>
                        <td className="text-slate-800">最新修改的版本...</td>
                      </tr>
                      <tr className="text-slate-400 opacity-70">
                        <td className="font-bold text-red-500">3</td>
                        <td className="font-bold text-purple-600">101</td>
                        <td className="font-bold text-slate-400">FALSE</td>
                        <td className="font-bold">2.1(Draft)</td>
                        <td>某人寫一半的草稿...</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>彈性極高：</b>{" "}
                  由於允許同一個群組（DocID）下有多種不同狀態的紀錄，因此極度適合實作「多人協作編輯」、「送審草稿與正式上線並存」這種複雜的業務邏輯。
                </p>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>代價慘痛：</b> 所有的 SQL 查詢，所有的 JOIN 條件，
                  <b>必定</b>都要強制補上{" "}
                  <code className="text-rose-500 font-bold">
                    WHERE IsCurrent = TRUE
                  </code>
                  ，只要開發者一不小心漏寫，整個系統就會暴亂。另外，當一個系統十年的歷史積累後，這張表會變得無比巨大且緩慢。
                </p>
              </div>
            )}
            {activeVersioning === "event" && (
              <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                <div className="flex flex-col gap-2">
                  <h5 className="text-lg font-black text-slate-700 italic">
                    Event Sourcing (事件溯源) - 回放過去的黑盒子
                  </h5>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <b>情境：</b>{" "}
                    根本不存「最終的內容」，只存「你對文件做了什麼事
                    (Delta)」。就跟 Git 的 Commit
                    一樣，當要讀取文件的最新狀態時，就是把所有的事件從頭「回放
                    (Replay)」一遍計算出來的結果。
                  </p>
                </div>
                <div className="sample-table-container shadow-lg shadow-amber-100/50">
                  <table className="sample-table">
                    <thead>
                      <tr>
                        <th>EventID</th>
                        <th className="text-red-500">EntryID (目標)</th>
                        <th className="text-indigo-600 font-black">
                          EventType
                        </th>
                        <th className="text-slate-500">Payload (JSON)</th>
                        <th>CreatedAt</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700 text-sm">
                      <tr>
                        <td>1</td>
                        <td className="font-bold text-red-500">303</td>
                        <td className="text-indigo-600 font-bold uppercase">
                          文件建立
                        </td>
                        <td className="font-mono text-xs">
                          {'{ "Name": "草稿" }'}
                        </td>
                        <td>10:00:00</td>
                      </tr>
                      <tr className="bg-slate-50">
                        <td>2</td>
                        <td className="font-bold text-red-500">303</td>
                        <td className="text-indigo-600 font-bold uppercase">
                          變更名稱
                        </td>
                        <td className="font-mono text-xs">
                          {'{ "Old": "草稿", "New": "企劃" }'}
                        </td>
                        <td>10:05:30</td>
                      </tr>
                      <tr>
                        <td>3</td>
                        <td className="font-bold text-red-500">303</td>
                        <td className="text-emerald-600 font-bold uppercase">
                          內容加上
                        </td>
                        <td className="font-mono text-xs">
                          {'{ "Diff": "+新增了一行段落" }'}
                        </td>
                        <td>10:15:10</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>上帝視角：</b> 系統擁有真正的「時光機」。你可以隨時重建出
                  10:05:31 時文件的確切模樣，沒有任何資訊被永久覆蓋。
                </p>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>開發難度：</b>{" "}
                  極高。在關聯式資料庫中直接進行這類實作會導致簡單的搜尋變得如同地獄（你無法直接{" "}
                  <code className="text-rose-500 font-bold">
                    WHERE Name = '企劃'
                  </code>
                  ，因為 Name 藏在事件中）。實務中通常會搭配 CQRS，外加一個
                  Materialized View 來專門應付讀取。
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 6. Audit & Common Fields */}
        <section className="pt-12 border-t border-slate-100 space-y-8 pb-12">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-base">
                  6
                </span>
                <h3 className="text-lg font-bold text-slate-800">
                  稽核日誌 Audit Fields
                </h3>
              </div>
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-sm text-slate-600 leading-relaxed ml-11">
                <p className="font-bold text-indigo-800 mb-2 flex items-center gap-2">
                  💡 情境決策指南
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <b>最標準的專案防禦配置，不用想太多加就對了？</b> 👉{" "}
                    <button
                      onClick={() => setActiveAudit("embedded")}
                      className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none transition-colors"
                    >
                      Embedded (直接加在原表)
                    </button>
                    ，也就是經典的 CreatedAt/UpdatedAt 組合，軟刪除 (Soft
                    Delete) 也是這個範疇。
                  </li>
                  <li>
                    <b>
                      法規嚴格要求（如醫療或金融系統），需查核任何一張表「誰改了什麼欄位的哪個字」？
                    </b>{" "}
                    👉{" "}
                    <button
                      onClick={() => setActiveAudit("centralized")}
                      className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none transition-colors"
                    >
                      Centralized Audit Log (集中稽核表)
                    </button>
                    ，不污染原結構，單一中心化監控。
                  </li>
                </ul>
              </div>
            </div>

            {/* Audit Scorecards Tabs */}
            <div className="flex flex-wrap justify-center gap-3 w-full">
              <button
                onClick={() => setActiveAudit("embedded")}
                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activeAudit === "embedded" ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
              >
                <span
                  className={`text-sm font-black tracking-wide ${activeAudit === "embedded" ? "text-indigo-700" : "text-slate-500"}`}
                >
                  Embedded Columns (嵌入共用欄)
                </span>
                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Query:</span>
                    <span className="text-amber-500">5/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Maintenance:</span>
                    <span className="text-amber-500">5/5</span>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setActiveAudit("centralized")}
                className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${activeAudit === "centralized" ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200/50 scale-[1.02] ring-1 ring-indigo-500 relative z-10" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
              >
                <span
                  className={`text-sm font-black tracking-wide ${activeAudit === "centralized" ? "text-indigo-700" : "text-slate-500"}`}
                >
                  Centralized Log (集中稽核日誌)
                </span>
                <div className="flex gap-2.5 mt-1.5 text-xs items-center font-bold">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Query:</span>
                    <span className="text-rose-500">2/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Maintenance:</span>
                    <span className="text-amber-500">3/5</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeAudit === "embedded" && (
              <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                <div className="flex flex-col gap-2">
                  <h5 className="text-lg font-black text-slate-700 italic">
                    Embedded Columns - Mixin 慣例實作
                  </h5>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <b>情境：</b> 將{" "}
                    <code className="bg-white px-1 py-0.5 rounded border border-slate-200">
                      CreatedBy
                    </code>
                    、
                    <code className="bg-white px-1 py-0.5 rounded border border-slate-200">
                      CreatedAt
                    </code>{" "}
                    等基礎四本柱欄位，只要是張需要查核的表，都直接加上。現在的
                    ORM
                    甚至會在每一次模型儲存與新建時自動打上這四個時間戳記與帳號。
                  </p>
                </div>
                <div className="sample-table-container shadow-lg shadow-indigo-100/50">
                  <table className="sample-table whitespace-nowrap overflow-hidden">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>業務欄位...</th>
                        <th className="bg-indigo-50 text-indigo-700 font-bold border-l-2 border-indigo-200">
                          CreatedBy (FK)
                        </th>
                        <th className="bg-indigo-50 text-indigo-700 font-bold">
                          CreatedAt
                        </th>
                        <th className="bg-indigo-50 text-indigo-700 font-bold">
                          UpdatedBy (FK)
                        </th>
                        <th className="bg-indigo-50 text-indigo-700 font-bold">
                          UpdatedAt
                        </th>
                        <th className="bg-rose-50 text-rose-700 font-bold border-l-2 border-rose-200">
                          DeletedAt (Soft Delete)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700 text-sm">
                      <tr>
                        <td>1</td>
                        <td>...</td>
                        <td className="bg-indigo-50/30 border-l-2 border-indigo-100 font-mono">
                          U101
                        </td>
                        <td className="bg-indigo-50/30">01-01 10:00</td>
                        <td className="bg-indigo-50/30 font-mono">U205</td>
                        <td className="bg-indigo-50/30">01-05 15:30</td>
                        <td className="bg-rose-50/30 border-l-2 border-rose-100 text-slate-400 italic">
                          NULL
                        </td>
                      </tr>
                      <tr className="bg-slate-50 opacity-60">
                        <td>2</td>
                        <td>...</td>
                        <td className="bg-indigo-50/30 border-l-2 border-indigo-100 font-mono">
                          U101
                        </td>
                        <td className="bg-indigo-50/30">01-02 08:20</td>
                        <td className="bg-indigo-50/30 font-mono">U999</td>
                        <td className="bg-indigo-50/30">01-06 09:12</td>
                        <td className="bg-rose-50/30 border-l-2 border-rose-100 font-bold text-rose-600">
                          01-06 09:12 (已假刪除)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>極佳的實用性：</b> 這涵蓋了 90%
                  查核「誰建了這筆資料、最後誰改的」的需求。加入{" "}
                  <code className="text-rose-500 font-bold">DeletedAt</code>{" "}
                  即為業界俗稱的「軟刪除 (Soft
                  Delete)」，不真實刪除資料，方便救援並保留關聯。
                </p>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>弱點：</b> 這個做法是<b>覆寫</b>的。如果這筆紀錄被更新了
                  100 次，你在這裡也只會看見這「最後一次
                  (第100次)」是誰做的。中間 99 次的更新歷史都會永遠消失。
                </p>
              </div>
            )}
            {activeAudit === "centralized" && (
              <div className="group space-y-4 border-l-4 border-slate-200 pl-6 py-2">
                <div className="flex flex-col gap-2">
                  <h5 className="text-lg font-black text-slate-700 italic">
                    Centralized Audit Log - Polymorphic 的應用
                  </h5>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <b>情境：</b> 精準紀錄「原值與新值的變化」。我們可以使用
                    **Polymorphic Belongs-To** 設計一張通用的 `System_AuditLogs`
                    巨集表。無論是訂單修改、會員資料異動，全都在這張表來集中管理。
                  </p>
                </div>
                <div className="sample-table-container shadow-lg shadow-amber-100/50">
                  <table className="sample-table text-sm">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th className="bg-amber-50 text-amber-700 font-black">
                          TableName
                        </th>
                        <th className="bg-rose-50 text-rose-600 font-black">
                          RecordID (無 FK 約束)
                        </th>
                        <th>Action</th>
                        <th className="text-indigo-600">OldValue (JSONB)</th>
                        <th className="text-emerald-600">NewValue (JSONB)</th>
                        <th>ChangedBy</th>
                        <th>ChangedAt</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      <tr>
                        <td>1</td>
                        <td className="bg-amber-50/30 font-bold italic border-r border-amber-100">
                          Users
                        </td>
                        <td className="bg-rose-50/30 font-bold text-rose-600 border-r border-rose-100">
                          99
                        </td>
                        <td className="font-bold text-indigo-600">UPDATE</td>
                        <td className="font-mono text-xs opacity-75">
                          {'{ "Status": "Active" }'}
                        </td>
                        <td className="font-mono text-xs">
                          {'{ "Status": "Suspended" }'}
                        </td>
                        <td className="font-bold text-slate-600 text-center">
                          Admin
                        </td>
                        <td className="text-slate-400 text-xs">
                          2025-01-05 10:20:01
                        </td>
                      </tr>
                      <tr className="bg-slate-50">
                        <td>2</td>
                        <td className="bg-amber-50/30 font-bold italic border-r border-amber-100">
                          Entries
                        </td>
                        <td className="bg-rose-50/30 font-bold text-rose-600 border-r border-rose-100">
                          303
                        </td>
                        <td className="font-bold text-indigo-600">UPDATE</td>
                        <td className="font-mono text-xs opacity-75">
                          {'{ "Name": "草稿" }'}
                        </td>
                        <td className="font-mono text-xs">
                          {'{ "Name": "V1" }'}
                        </td>
                        <td className="font-bold text-slate-600 text-center">
                          User_A
                        </td>
                        <td className="text-slate-400 text-xs">
                          2025-01-10 14:15:30
                        </td>
                      </tr>
                      <tr>
                        <td>3</td>
                        <td className="bg-amber-50/30 font-bold italic border-r border-amber-100">
                          Entries
                        </td>
                        <td className="bg-rose-50/30 font-bold text-rose-600 border-r border-rose-100">
                          404
                        </td>
                        <td className="font-bold text-rose-600">DELETE</td>
                        <td className="font-mono text-xs opacity-75">
                          {'{ "Name": "圖.png", ... }'}
                        </td>
                        <td className="text-slate-400 italic">NULL</td>
                        <td className="font-bold text-slate-600 text-center">
                          User_A
                        </td>
                        <td className="text-slate-400 text-xs">
                          2025-01-15 09:30:45
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>解耦與擴充：</b>{" "}
                  對於原業務表格來說是零污染。且這張表可以無縫拋轉給
                  Elasticsearch 或是資料倉儲（Data
                  Warehouse）去專門應付合規查詢。
                </p>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  <b>難以關聯查詢：</b> 這是一張混雜的多型表，加上數值被塞在
                  JSON 裡，你幾乎不可能下出{" "}
                  <code className="text-rose-500 font-bold">
                    SQL: 將 AuditLogs JOIN 至關聯的訂單並查出某商品被誰修改
                  </code>
                  。它只適合「以特定 ID 為入口向下單向呈現」。
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ERTab;
