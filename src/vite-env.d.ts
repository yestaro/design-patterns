/// <reference types="vite/client" />

/** Vite ?raw 靜態匯入的型別宣告 */
declare module '*.ts?raw' {
    const content: string;
    export default content;
}
