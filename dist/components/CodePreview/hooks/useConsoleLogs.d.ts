/**
 * iframeからのコンソールログを受信・管理するフック
 *
 * @param iframeRef 監視対象のiframeのRef
 * @param dependencies ログをクリアするトリガーとなる依存配列
 */
export declare const useConsoleLogs: (iframeRef: React.RefObject<HTMLIFrameElement | null>, dependencies?: unknown[]) => {
    consoleLogs: string[];
    setConsoleLogs: import("react").Dispatch<import("react").SetStateAction<string[]>>;
};
