import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, RefObject } from 'react';
import { EditorKey, EditorConfig } from '../types';
interface EditorSectionProps {
    layout: {
        visibleEditorConfigs: EditorConfig[];
        sectionWidths: Record<EditorKey, number>;
        editorHeight: string;
        showLineNumbers: boolean;
        isResizing: boolean;
    };
    state: {
        editorTheme: string;
        showFileStructure: boolean;
    };
    handlers: {
        handleMouseDown: (e: ReactMouseEvent, left: EditorKey, right: EditorKey) => void;
        handleResizerKeyDown: (e: ReactKeyboardEvent<HTMLDivElement>, left: EditorKey, right: EditorKey) => void;
        resetSectionWidthsToAuto: () => void;
        toggleLineNumbers: () => void;
        toggleFileStructure: () => void;
        handleResetMouseDown: () => void;
        handleResetMouseUp: () => void;
        handleResetMouseLeave: () => void;
        resetProgress: number;
    };
    editorsRowRef: RefObject<HTMLDivElement | null>;
    editorsRowStyle?: CSSProperties;
}
export declare const EditorSection: ({ layout, state, handlers, editorsRowRef, editorsRowStyle }: EditorSectionProps) => import("react/jsx-runtime").JSX.Element;
export {};
