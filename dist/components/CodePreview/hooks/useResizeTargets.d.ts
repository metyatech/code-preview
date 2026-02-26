import { EditorDefinition, EditorKey } from '../types';
import { ResizeTarget } from './useEditorResize';
interface UseResizeTargetsProps {
    editors: EditorDefinition[];
}
export declare const useResizeTargets: ({ editors }: UseResizeTargetsProps) => ResizeTarget<EditorKey>[];
export {};
