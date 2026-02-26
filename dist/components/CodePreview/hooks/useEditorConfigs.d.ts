import { EditorConfig, EditorDefinition } from '../types';
interface UseEditorConfigsProps {
    editors: EditorDefinition[];
    updateSectionWidths: (force?: boolean) => void;
}
/**
 * エディタの設定とイベントハンドラを管理するフック
 */
export declare const useEditorConfigs: ({ editors, updateSectionWidths }: UseEditorConfigsProps) => {
    visibleEditorConfigs: EditorConfig[];
    showLineNumbers: boolean;
    toggleLineNumbers: () => void;
};
export {};
