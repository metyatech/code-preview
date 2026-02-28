import type { editor } from 'monaco-editor';
export interface ResizeTarget<K extends string> {
    key: K;
    ref: React.RefObject<editor.IStandaloneCodeEditor | null>;
}
interface UseEditorResizeProps<K extends string> {
    resizeTargets: ResizeTarget<K>[];
    containerRef: React.RefObject<HTMLDivElement | null>;
    initialWidths?: Record<K, number>;
}
export declare const useEditorResize: <K extends string>({ resizeTargets, containerRef, initialWidths, }: UseEditorResizeProps<K>) => {
    sectionWidths: Record<K, number>;
    isResizing: boolean;
    handleMouseDown: (e: React.MouseEvent, leftKey: K, rightKey: K) => void;
    handleResizerKeyDown: (event: React.KeyboardEvent<HTMLDivElement>, leftKey: K, rightKey: K) => void;
    updateSectionWidths: (force?: boolean) => void;
    resetSectionWidthsToAuto: () => void;
};
export {};
