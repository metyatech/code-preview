/**
 * useResetHandler フックのプロパティ
 */
interface UseResetHandlerProps {
    /** リセット確定時に実行されるコールバック */
    onReset: () => void;
    /** 長押しと判定されるまでの時間 (ms) */
    longPressDuration?: number;
}
/**
 * リセットボタンの長押し操作を管理するフック
 */
export declare const useResetHandler: ({ onReset, longPressDuration }: UseResetHandlerProps) => {
    resetProgress: number;
    handleResetMouseDown: () => void;
    handleResetMouseUp: () => void;
    handleResetMouseLeave: () => void;
};
export {};
