import type { editor } from 'monaco-editor';
import { ResolvedCodePreviewProps } from '../types';
export declare const useCodePreview: (props: ResolvedCodePreviewProps) => {
    elementRefs: {
        iframeRef: import("react").RefObject<HTMLIFrameElement | null>;
        containerRef: import("react").RefObject<HTMLDivElement | null>;
        editorsRowRef: import("react").RefObject<HTMLDivElement | null>;
        htmlEditorRef: import("react").RefObject<editor.IStandaloneCodeEditor | null>;
        cssEditorRef: import("react").RefObject<editor.IStandaloneCodeEditor | null>;
        jsEditorRef: import("react").RefObject<editor.IStandaloneCodeEditor | null>;
    };
    state: {
        htmlCode: string;
        cssCode: string;
        jsCode: string;
        resolvedImages: import("../types").ResolvedImageMap | undefined;
        resolvedHtmlPath: string;
        resolvedCssPath: string | undefined;
        resolvedJsPath: string | undefined;
        consoleLogs: string[];
        showFileStructure: boolean;
        iframeKey: number;
        iframeId: string;
        editorTheme: string;
    };
    visibility: {
        showHTMLEditor: boolean;
        showCSSEditor: boolean;
        showJSEditor: boolean;
        showPreview: boolean;
        showConsole: boolean;
    };
    layout: {
        editorHeight: string;
        previewHeight: string;
        sectionWidths: Record<import("../types").EditorKey, number>;
        isResizing: boolean;
        visibleEditorConfigs: import("../types").EditorConfig[];
        showLineNumbers: boolean;
        minHeightCss: string;
    };
    handlers: {
        handleMouseDown: (e: React.MouseEvent, leftKey: import("../types").EditorKey, rightKey: import("../types").EditorKey) => void;
        handleResizerKeyDown: (event: React.KeyboardEvent<HTMLDivElement>, leftKey: import("../types").EditorKey, rightKey: import("../types").EditorKey) => void;
        resetSectionWidthsToAuto: () => void;
        toggleLineNumbers: () => void;
        toggleFileStructure: () => void;
        handleResetMouseDown: () => void;
        handleResetMouseUp: () => void;
        handleResetMouseLeave: () => void;
        resetProgress: number;
    };
};
