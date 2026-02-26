/**
 * useCodePreviewReset フックのプロパティ
 */
interface UseCodePreviewResetProps {
    /** コードを初期状態に戻す関数 */
    resetCodes: () => void;
    /** コンソールログをクリアする関数 */
    clearConsoleLogs: () => void;
    /** iframeを再マウントする関数 */
    remountIframe: () => void;
    /** プレビューの高さを更新する関数 */
    updatePreviewHeight: () => void;
}
/**
 * コードプレビューのリセット処理を提供するフック
 */
export declare const useCodePreviewReset: ({ resetCodes, clearConsoleLogs, remountIframe, updatePreviewHeight }: UseCodePreviewResetProps) => () => void;
export {};
