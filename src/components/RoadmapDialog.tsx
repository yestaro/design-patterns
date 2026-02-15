import React, { useState } from 'react';
import { X, HelpCircle, Calendar } from 'lucide-react';

interface RoadmapItem {
    day: number;
    title: string;
    pattern: string;
    target: string;
    core: string;
    color: string;
    tasks: string[];
}

const scheduleData: RoadmapItem[] = [
    {
        day: 1,
        title: '結構的根基',
        pattern: 'Composite & Prototype',
        target: '解決檔案與資料夾的「一致性」問題，支持巢狀目錄。並實現檔案樹的快速深拷貝。',
        core: '讓單一檔案與資料夾擁有相同介面，實現無限層級的樹狀結構與統一處理邏輯。',
        color: 'from-blue-600 to-indigo-700',
        tasks: [
            '實作透明性 (Transparency) 的 DirectoryComposite',
            '定義 File 抽象基類與具體 Leaf 節點',
            '使用 Prototype 克隆整棵樹以支援 Undo 狀態保存'
        ]
    },
    {
        day: 2,
        title: '優雅的巡禮',
        pattern: 'Visitor (訪問者模式)',
        target: '在不改變物件結構的前提下，增加新功能。例如：輸出 XML、計算總和大小。',
        core: '將資料結構與操作邏輯解耦，透過 accept 機制實現行為的「插件化」擴展。',
        color: 'from-purple-600 to-pink-700',
        tasks: [
            '實作 Double Dispatch (兩次分派) 機制',
            '撰寫 SizeCalculator 統計全目錄容量',
            '撰寫 FileSearch 搜尋特定關鍵字檔案'
        ]
    },
    {
        day: 3,
        title: '行為的骨架',
        pattern: 'Template Method',
        target: '封裝重複的演算法結構 (如樹狀遞迴與縮排)，開放特定 Hook 給子類實作。',
        core: '將「怎麼走 (遞迴)」與「做什麼 (邏輯)」分離，利用 depth 實現分層管理。',
        color: 'from-amber-500 to-orange-600',
        tasks: [
            '定義 BaseExporterTemplate 基類',
            '在 Skeleton (骨架) 中內建「字元脫逸」處理邏輯',
            '實作 MarkdownExporter 利用 depth 生成對應層級標題'
        ]
    },
    {
        day: 4,
        title: '狀態與觀察',
        pattern: 'Observer (通訊與觀察者)',
        target: '監控檔案系統變化，自動同步更新 UI 統計 Dashboard 面板與 Console 日誌。',
        core: '建立一對多的通訊機制，實現狀態變更時的自動通知與多端訂閱機制。',
        color: 'from-rose-500 to-red-600',
        tasks: [
            '建立 Subject 被觀察者介面',
            '實作 ConsoleObserver 對接 React Console 狀態',
            '實作 DashboardObserver 即時運算掃描進度文字'
        ]
    },
    {
        day: 5,
        title: '行為的封裝',
        pattern: 'Command & Strategy',
        target: '實作檔案「刪除、貼標籤、復原 (Undo)」與「動態排序規則」。',
        core: '將請求封裝成物件以支援紀錄與撤銷，並透過策略物件注入不同的排序演算法。',
        color: 'from-emerald-600 to-teal-700',
        tasks: [
            '實作 CommandInvoker 紀錄操作歷史',
            '實作 Undoable 介面達成一鍵復原檔案刪除',
            '封裝 NameSort 與 SizeSort 排序策略'
        ]
    },
    {
        day: 6,
        title: '靈活的外殼',
        pattern: 'Decorator (裝飾者模式)',
        target: '動態地為日誌訊息附加樣式與圖標美化，建立多維度的裝飾者鏈。',
        core: '透過「物件組合」而非繼承來動態疊加職責，實現日誌訊息的透明樣式擴展。',
        color: 'from-indigo-600 to-violet-700',
        tasks: [
            '建立 HighlightDecorator 偵測關鍵字變色',
            '建立 IconDecorator 為訊息加上情緒圖標',
            '建立 BoldDecorator 為效能訊息加粗強化'
        ]
    },
    {
        day: 7,
        title: '共享與管理',
        pattern: 'Flyweight & Mediator / Singleton',
        target: '優化標籤資源並集中管理檔案關係，確保全域唯一的系統組件。',
        core: '利用工廠實現物件共享，透過中介者消除網狀依賴，保證單一實體存取點。',
        color: 'from-cyan-500 to-blue-600',
        tasks: [
            '實作 LabelFactory 共享標籤實體',
            '實作 TagMediator 管理標籤與檔案的多對多對映',
            '確保 Clipboard 為全域 Singleton 共享剪貼簿'
        ]
    },
    {
        day: 8,
        title: '簡單的總管',
        pattern: 'Facade (外觀模式)',
        target: '為複雜的後端子功能提供高層級的統一進入點，簡化前端呼叫。',
        core: '對外隱藏子系統的複雜度，提供一致且友好的開發 API 介面。',
        color: 'from-slate-700 to-slate-900',
        tasks: [
            '實作 FileSystemFacade 統整所有命令介面',
            '封裝複雜的一站式搜尋與計數流程',
            '降低 ExplorerTab 對模式實體類別的直接依賴'
        ]
    }
];

interface RoadmapDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const RoadmapDialog: React.FC<RoadmapDialogProps> = ({ isOpen, onClose }) => {
    const [selectedDay, setSelectedDay] = useState(scheduleData[0]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 text-left">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden relative z-10 animate-in zoom-in-95 duration-300 flex flex-col border border-white/20 text-left">

                {/* Modal Header - Restored Orange Theme */}
                <div className="px-6 py-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white flex justify-between items-center relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                        <HelpCircle size={120} />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-3xl font-black flex items-center gap-3 mb-1">
                            <Calendar size={32} className="text-orange-200" />
                            Design Pattern in a Week
                        </h3>
                        <p className="text-orange-50 font-medium tracking-wide">掌握軟體設計的靈魂：從 Structure 到 Behavioral 與 Creational</p>
                    </div>
                    <button onClick={onClose} className="relative z-10 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Two-Column Body: Left (Detailed Tasks) | Right (Roadmap Grid) */}
                <div className="flex flex-1 overflow-hidden">

                    {/* ----------------- Left Side: Implementation Tasks (1/3) ----------------- */}
                    <div className="w-[400px] bg-white p-8 overflow-y-auto custom-scrollbar flex flex-col shrink-0 border-r border-slate-200">
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${selectedDay.color} flex items-center justify-center text-white text-xl font-black shadow-lg`}>
                                    {selectedDay.day}
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-slate-800 leading-tight">實作任務清單</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Day {selectedDay.day} Details</p>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">當前主題</p>
                                <p className="text-slate-700 font-bold text-sm leading-relaxed">{selectedDay.title}：{selectedDay.pattern}</p>
                            </div>

                            <div className="space-y-6">
                                <h5 className="text-xs font-black text-slate-900 flex items-center gap-2">
                                    <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                                    今日挑戰題目
                                </h5>
                                <div className="grid grid-cols-1 gap-4">
                                    {selectedDay.tasks.map((task, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-300 transition-all group">
                                            <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-[10px] font-black shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                {idx + 1}
                                            </div>
                                            <span className="text-slate-700 font-bold text-sm leading-relaxed">{task}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto p-6 bg-slate-900 rounded-[32px] text-white">
                            <p className="text-[10px] font-black text-amber-400 uppercase mb-2">💡 實作提示</p>
                            <p className="text-xs leading-relaxed opacity-80 font-medium">
                                點擊右側不同天數，可以查看對應的實作細節。建議先在 Code Tab 觀察 Anti-Pattern 的痛點，再開始撰寫模式代碼。
                            </p>
                        </div>
                    </div>

                    {/* ----------------- Right Side: Original Roadmap Cards (2/3) ----------------- */}
                    <div className="flex-1 p-8 overflow-y-auto bg-slate-50 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {scheduleData.map((item) => (
                                <div
                                    key={item.day}
                                    onClick={() => setSelectedDay(item)}
                                    className={`bg-white rounded-2xl border-2 transition-all overflow-hidden group cursor-pointer ${selectedDay.day === item.day ? 'border-blue-500 shadow-xl scale-[1.02]' : 'border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'}`}
                                >
                                    <div className={`p-1 bg-gradient-to-r ${item.color}`} />
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Day {item.day}</span>
                                                <h4 className="text-xl font-bold text-slate-800">{item.title}</h4>
                                            </div>
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform`}>
                                                {item.day}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <p className="text-xs font-black text-slate-400 uppercase mb-1">核心模式</p>
                                                <p className="font-bold text-blue-600 text-sm">{item.pattern}</p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-black text-slate-400 uppercase mb-1">目標</p>
                                                <p className="text-slate-600 text-sm leading-relaxed">{item.target}</p>
                                            </div>

                                            <div className="pt-3 border-t border-dashed border-slate-200">
                                                <p className="text-xs font-black text-slate-400 uppercase mb-1">關鍵機制</p>
                                                <p className="text-slate-600 text-sm italic leading-relaxed font-medium">"{item.core}"</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoadmapDialog;
