import React, { useState, useRef, useEffect } from 'react';
import { X, HelpCircle, Calendar, User, Code, Bot, Panda, ChevronDown, ChevronUp } from 'lucide-react';

// ... (interfaces)
interface RoadmapItem {
    day: number;
    title: string;
    pattern: string;
    target: string;
    core: string;
    color: string;
    context?: string;
    transcript?: { speaker: string; text: string }[];
    tasks: string[];
    tasksTitle: string;
}

const scheduleData: RoadmapItem[] = [
    {
        day: 1,
        title: '結構的根基',
        pattern: 'Composite + Prototype',
        target: '解決檔案與資料夾的「一致性」問題，支持巢狀目錄。並實現檔案樹的快速深拷貝。',
        core: '讓檔案與資料夾擁有相同介面 EntryComponent，實現無限層級的樹狀結構與統一處理邏輯。',
        color: 'from-blue-600 to-indigo-700',
        context: '今天你與客戶進行了「檔案管理系統」的需求訪談。以下是訪談的部分紀錄。',
        transcript: [
            { speaker: '客戶', text: '我們有很多不同類型的檔案要分類管理，最常見的有 Word 文件、圖片，還有一些簡單的 純文字檔。' },
            { speaker: '你', text: '這些檔案在系統裡有什麼共同點嗎？' },
            { speaker: '客戶', text: '當然，每個檔案都要有檔名，我們也要知道它的大小（KB）以及它是什麼時候建立的。' },
            { speaker: '你', text: '那不同類型的檔案有什麼特別需要紀錄的資訊嗎？' },
            { speaker: '客戶', text: '喔有的！如果是 Word 檔，我們需要記錄它有幾頁；如果是圖片，解析度（寬跟高）很重要；至於純文字檔，我們通常會標記它是用哪種編碼存的，像是 UTF-8 之類的。' },
            { speaker: '你', text: '了解。那這些檔案是怎麼組織的？' },
            { speaker: '客戶', text: '我們用「目錄」來管理。一個目錄裡面可以放很多檔案。而且目錄裡面還可以再建立子目錄，就像 Windows 的資料夾那樣，一層套一層沒有限制。' },
            { speaker: '你', text: '所以目錄本身也有名字吧？' },
            { speaker: '客戶', text: '對，目錄也有名字。另外要注意，所有的檔案都必須放在某個目錄下面，不能孤零零地存在外面。' }
        ],
        tasksTitle: '不論舵或堂，都是天地會兄弟',
        tasks: [
            '請根據以上對話，掌握那些「名調」與「動詞」會建構成你的系統。',
            '推導出系統的 Domain Model（領域模型），並使用 UML 類別圖呈現。',
            '規劃出系統的 ER Model，將來資料庫會有那些表格與欄位或關聯。',
            '不限語言，先實作出「名詞」可看到樹狀的檔案呈現即可，不用實現「動詞」的功能。'
        ]
    },
    {
        day: 2,
        title: '優雅的巡禮',
        pattern: 'Visitor',
        target: '在不改變物件結構的前提下，增加新功能。例如：輸出 XML、計算總和大小。',
        core: '將資料結構與操作邏輯解耦，透過 accept 機制實現行為的「插件化」擴展。',
        color: 'from-purple-600 to-pink-700',
        context: '上次客戶說要分類管理，但具體是怎麼管理？應該就是新增、複製、刪除吧…',
        transcript: [
            { speaker: '客戶', text: '對，新增、複製、刪除、排序，這些都是基本功能。' },
            { speaker: '你', text: '那還有什麼沒提到的功能嗎？' },
            { speaker: '客戶', text: '檔案太多，所以一定要可以搜尋檔案。另外，要知道檔案的加總大小。' },
            { speaker: '客戶', text: '還有，由於有別的系統要整合，所以也需要可以匯出資料。' },
            { speaker: '你', text: '那交換的格式，走 XML 可以嗎？' },
            { speaker: '客戶', text: '我不了解，但你們先訂一版看看吧。' }
        ],
        tasksTitle: '想要就說，我有 Accept 搞定',
        tasks: [
            '完成 計算檔案大小 的功能',
            '完成 搜尋特定關鍵字檔案 的功能',
            '完成 輸出 XML 格式的功能'
        ]
    },
    {
        day: 3,
        title: '行為的骨架',
        pattern: 'Template Method',
        target: '封裝重複的演算法結構 (如樹狀遞迴與縮排)，開放特定 Hook 給子類實作。',
        core: '將「怎麼走 (遞迴)」與「做什麼 (邏輯)」分離，進一步擴充 Visitor 的功能。',
        color: 'from-amber-500 to-orange-600',
        context: '我開發好了功能，但後來客戶說。他們的系統不是 XML 格式，目前支援 JSON 格式。',
        transcript: [
            { speaker: '客戶', text: '抱歉，我後來搞清楚了，是 JSON。' },
            { speaker: '你', text: '沒問題，可以改成 JSON 格式輸出。（心想…XML 以後可能還會用到）' },
            { speaker: '客戶', text: '聽 AI 部門說，他們另要 Markdown。' },
            { speaker: '你', text: '(心想…輸出要考慮"字元脫逸"、"縮排"問題。只要輸出，就要處理這些)' },
        ],
        tasksTitle: '身為子類別，要有一套規矩',
        tasks: [
            '定義 BaseExporterTemplate 基類，在 visit (骨架方法) 中處理「字元脫逸」與「縮排」。',
            '完成 JSONExporter 與 MarkdownExporter 子類別，只處理格式輸出（細節不拘）。'
        ]
    },
    {
        day: 4,
        title: '狀態與觀察',
        pattern: 'Observer',
        target: '監控檔案系統變化，自動同步通知，更新 UI Dashboard 面板與 Console 日誌。',
        core: '建立一對多的通訊機制，處理行為的時候，可同時通知處理訊息，多端訂閱機制。',
        color: 'from-rose-500 to-red-600',
        context: '由於檔案數量太多，要增加進度顯示。那開發要等通知端先確定，還是接受端先確定？',
        transcript: [
            { speaker: '老闆', text: '系統執行過程，應該要加入進度條來改善體驗，也可從日誌了解詳細。' },
            { speaker: '你', text: '對，當我看到有進度。自然可以等待較久的時間。' },
            { speaker: '老闆', text: '另外，處理訊息的通知端與接受端同時開發，不要互相影響開發進程。' }
        ],
        tasksTitle: '打雷啦！下雨囉，收衣服呀',
        tasks: [
            '完成發佈端 Subject 介面實作，發佈訊息',
            '完成接收端 ConsoleObserver 顯示日誌',
            '完成接收端 DashboardObserver 即時狀態'
        ]
    },
    {
        day: 5,
        title: '靈活的外殼',
        pattern: 'Decorator + Adapter',
        target: '動態地為日誌訊息附加樣式與圖標美化，建立多維度的裝飾者鏈。',
        core: '透過「組合或轉換」而非繼承來動態疊加職責，實現日誌訊息的透明樣式擴展。',
        color: 'from-emerald-600 to-teal-700',
        context: '好的日誌有圖標與顏色，最好有更多顯示區別，但…進度條與日誌的接受參數不一樣。',
        transcript: [
            { speaker: '客戶', text: '日誌顯示太長，容易漏看重要訊息。' },
            { speaker: '你', text: '好，我們用圖標、粗體、顏色等方式來改善，依命令來顯示不同樣式。' },
            { speaker: '客戶', text: '我還希望有個儀表版，可以顯示目前處理到那，與整體進度百分比。' },
            { speaker: '你', text: '儀表版跟日誌訊息的 UI 差別有點大。（心想…元件的使用參數不太一樣），得處理一下。還是做得到。' },
        ],
        tasksTitle: '十七掌合在一起 - 降龍十八掌',
        tasks: [
            '完成 各種 Decorator 偵測關鍵字變樣式',
            '完成 Adapter 介面轉換，讓儀表板顯示進度'
        ]
    },
    {
        day: 6,
        title: '行為的封裝',
        pattern: 'Command + Strategy + Singleton',
        target: '實現檔案的「複製、貼上、刪除、貼標籤、復原與重做 (Undo/Redo)」跟「排序規則」。',
        core: '將請求封裝成一致的物件以支援紀錄操作，並透過策略物件注入不同的排序演算，還有單例管理剪貼簿。',
        color: 'from-indigo-600 to-violet-700',
        context: '終於要開始作「管理」功能，但怕客戶誤操作，所以要具備 Undo / Redo 的機制。',
        transcript: [
            { speaker: '絕地會議', text: '這一部份功能都很清楚，但就 Undo / Redo 機制，會議上大家有不同看法。' },
            { speaker: '你', text: '我看過一種設計模式，叫 Memento 備忘錄模式，可以儲存不同狀態。' },
            { speaker: '尤達', text: 'Memento 的確是紀錄物件的狀態，但我們的功能，沒有編輯。檔案物件的狀態屬性是不變的。' },
            { speaker: '你', text: 'なるほど…那就用 Command Pattern，把每一個操作都封裝成一樣的物件，然後把這些物件儲存起來。' },
            { speaker: '尤達', text: '排序有多種方式，每種排序，都是一種 Command 嗎？複製可以 Undo 嗎？剪貼簿要如何管理？預計完成？' },
            { speaker: '你', text: '預計完成：Redo/Undo、複製、貼上、刪除、排序（依不同屬性）。' },

        ],
        tasksTitle: '表面是吹風機，其實是刮鬍刀',
        tasks: [
            '完成 Command 命令介面達成一鍵復原',
            '完成 CommandInvoker 紀錄操作歷史',
            '完成 Command 使用排序策略 Strategy',
            '完成 Clipboard 全域 Singleton 共享剪貼簿'
        ]
    },
    {
        day: 7,
        title: '共享與管理',
        pattern: 'Flyweight + Mediator',
        target: '優化標籤資源並集中管理檔案關係，確保全域唯一的系統組件。',
        core: '利用工廠實現物件共享，透過中介者消除網狀依賴，保證單一實體存取點。',
        color: 'from-cyan-500 to-blue-600',
        context: '現代化管理須導入標籤概念，這比目錄靈活，日後也會拿來統計歸類，該怎麼設計？',
        transcript: [
            { speaker: '尤達', text: '目錄是為了分類，但分類可不是只有目錄一種方式。' },
            { speaker: '你', text: '沒錯，標籤可以讓管理更多樣靈活，跨階層，多對多，而且具有唯一性。' },
            { speaker: '尤達', text: '是的，請從多對多與唯一性來思考。' },
        ],
        tasksTitle: '現代設計，有標籤是很合理的',
        tasks: [
            '完成 LabelFactory 共享標籤實體',
            '完成 TagMediator 管理標籤與檔案的多對多'
        ]
    },
    {
        day: 8,
        title: '簡單的總管',
        pattern: 'Facade',
        target: '為複雜的後端子功能提供高層級的統一進入點，簡化呼叫，降低使用門檻。',
        core: '對外隱藏子功能的複雜度，提供一致且友好的開發 API 介面。',
        color: 'from-slate-700 to-slate-900',
        context: '最後一里路了，乾淨與簡單的系統架構，讓系統清晰，不然沒人想當 Product Owner。',
        transcript: [
            { speaker: '尤達', text: '內在完成了，但為了提升整潔度與方便度，所以包一下，對外統一用法。' },
            { speaker: '你', text: '包起來，不燒腦，這是我最擅長的。' },
            { speaker: '你', text: '總於，這次的專案，雖然花了一點時間，但可讀性跟可測性都好多了。' },
            { speaker: '尤達', text: '對啊，你這麼辛苦重整與設計，將來換個 Owner 就又爛了…' },

        ],
        tasksTitle: '總管的背後，個個都是垃圾？',
        tasks: [
            '完成 FileSystemFacade 統整所有命令介面',
            '降低 Explorer UI 對模式實體類別的直接依賴'
        ]
    }
];

interface RoadmapDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const RoadmapDialog: React.FC<RoadmapDialogProps> = ({ isOpen, onClose }) => {
    const [selectedDay, setSelectedDay] = useState(scheduleData[0]);
    const [expandedCores, setExpandedCores] = useState<number[]>([]);
    const detailsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (detailsRef.current) {
            detailsRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [selectedDay]);

    const toggleCore = (day: number, e: React.MouseEvent) => {
        // Stop propagation so we don't select the day when just expanding
        e.stopPropagation();
        setExpandedCores(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 text-left">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-7xl h-[90vh] overflow-hidden relative z-10 animate-in zoom-in-95 duration-300 flex flex-col border border-white/20 text-left">

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
                        <p className="text-orange-50 font-medium tracking-wide">從 Structure 到 Behavioral 與 Creational - 難道我學過如來神掌也要告訴你嗎？</p>
                    </div>
                    <button onClick={onClose} className="relative z-10 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Two-Column Body: Left (Detailed Tasks) | Right (Roadmap Grid) */}
                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

                    {/* ----------------- Left Side: Implementation Tasks (1/3) ----------------- */}
                    <div ref={detailsRef} className="w-full md:w-[400px] h-[40vh] md:h-full bg-white p-6 md:p-8 overflow-y-auto custom-scrollbar flex flex-col shrink-0 border-b md:border-b-0 md:border-r border-slate-200 order-1">
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${selectedDay.color} flex items-center justify-center text-white text-xl font-black shadow-lg`}>
                                    {selectedDay.day}
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-slate-800 leading-tight">{selectedDay.tasksTitle}</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Day {selectedDay.day} Details</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {selectedDay.context && (
                                    <div className="mb-8 pr-4">
                                        <p className="text-slate-800 text-base leading-relaxed mb-6">
                                            {selectedDay.context}
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <div className="h-px bg-slate-200 flex-1"></div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interview Start</span>
                                            <div className="h-px bg-slate-200 flex-1"></div>
                                        </div>
                                    </div>
                                )}

                                {selectedDay.transcript && (
                                    <div className="space-y-4 pr-2 mb-8 border-b border-slate-100 pb-8">
                                        {selectedDay.transcript.map((line, idx) => {
                                            const isYou = line.speaker.includes('你');

                                            return (
                                                <div key={idx} className="flex gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border mt-1 ${isYou
                                                        ? 'bg-slate-50 border-slate-200 text-slate-500'
                                                        : 'bg-orange-50 border-orange-200 text-orange-600'
                                                        }`}>
                                                        {isYou ? <Panda size={20} /> : <User size={20} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className={`text-xs font-bold uppercase mb-1 ${isYou ? 'text-slate-400' : 'text-orange-600'}`}>
                                                            {line.speaker}
                                                        </div>
                                                        <div className={`p-4 text-sm font-medium leading-relaxed rounded-2xl rounded-tl-none border ${isYou
                                                            ? 'bg-slate-50 border-slate-200 text-slate-600'
                                                            : 'bg-white border-orange-200 text-slate-800'
                                                            }`}>
                                                            {line.text}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <div>
                                    <h5 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-4">
                                        <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                                        今日任務：
                                    </h5>
                                    <div className="grid grid-cols-1 gap-2">
                                        {selectedDay.tasks.map((task, idx) => (
                                            <div key={idx} className="flex gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all group items-start">
                                                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-black shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all mt-0.5">
                                                    {idx + 1}
                                                </div>
                                                <span className="text-slate-700 font-bold text-sm leading-relaxed group-hover:text-slate-900 transition-colors">{task}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ----------------- Right Side: Original Roadmap Cards (2/3) ----------------- */}
                    <div className="flex-1 md:h-full p-6 md:p-8 overflow-y-auto bg-slate-200 custom-scrollbar order-2">
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
                                                <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-700 block mb-1">Day {item.day}</span>
                                                <h4 className="text-xl font-bold text-slate-800">{item.title}</h4>
                                            </div>
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform`}>
                                                {item.day}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <p className="text-xs font-black text-slate-400 uppercase mb-1">核心模式</p>
                                                <p className="font-bold text-blue-600 text-sm">{item.pattern}</p>
                                            </div>
                                            <p className="text-slate-600 text-sm leading-relaxed">{item.target}</p>
                                            {/* Key Mechanism (Collapsible) */}
                                            <div
                                                className="pt-3 border-t border-dashed border-slate-200 cursor-pointer hover:bg-slate-50 -mx-6 px-6 pb-2 transition-colors group/core"
                                                onClick={(e) => toggleCore(item.day, e)}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-xs font-black text-slate-400 uppercase group-hover/core:text-blue-500 transition-colors">關鍵機制</p>
                                                    {expandedCores.includes(item.day) ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                                                </div>

                                                {/* Content: Expand/Collapse */}
                                                {expandedCores.includes(item.day) && (
                                                    <p className="text-slate-600 text-sm italic leading-relaxed font-medium animate-in slide-in-from-top-2 duration-200 mt-2">
                                                        "{item.core}"
                                                    </p>
                                                )}
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
