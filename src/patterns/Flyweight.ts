// --- Flyweight ---

/**
 * Label (享元物件 - Flyweight)
 */
export class Label {
    constructor(public name: string, public color: string) { }
}

/**
 * LabelFactory (享元工廠)
 */
export class LabelFactory {
    private labels: Record<string, Label> = {};

    private colors: Record<string, string> = {
        'Urgent': 'bg-red-500',
        'Work': 'bg-blue-500',
        'Personal': 'bg-green-500'
    };

    /**
     * 取得標籤 (若無則建立)
     * @param name 標籤名稱
     */
    getLabel(name: string): Label {
        if (!this.labels[name]) {
            this.labels[name] = new Label(name, this.colors[name] || 'bg-slate-500');
        }
        return this.labels[name];
    }
}

export const labelFactory = new LabelFactory();
