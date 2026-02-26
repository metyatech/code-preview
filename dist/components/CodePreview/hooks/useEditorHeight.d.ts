import { EditorDefinition } from '../types';
/**
 * useEditorHeight フックのプロパティ
 */
interface UseEditorHeightProps {
    minHeightPx: number;
    editors: EditorDefinition[];
}
/**
 * エディタの高さを計算・管理するフック
 */
export declare const useEditorHeight: ({ minHeightPx, editors }: UseEditorHeightProps) => {
    editorHeight: string;
    updateEditorHeight: () => void;
};
export {};
