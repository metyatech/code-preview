import { MutableRefObject } from 'react';
import type { editor } from 'monaco-editor';
import { EditorDefinition } from '../types';
interface UseEditorDefinitionsProps {
    htmlCode: string;
    setHtmlCode: (code: string) => void;
    cssCode: string;
    setCssCode: (code: string) => void;
    jsCode: string;
    setJsCode: (code: string) => void;
    showHTMLEditor: boolean;
    showCSSEditor: boolean;
    showJSEditor: boolean;
    htmlEditorRef: MutableRefObject<editor.IStandaloneCodeEditor | null>;
    cssEditorRef: MutableRefObject<editor.IStandaloneCodeEditor | null>;
    jsEditorRef: MutableRefObject<editor.IStandaloneCodeEditor | null>;
}
export declare const useEditorDefinitions: ({ htmlCode, setHtmlCode, cssCode, setCssCode, jsCode, setJsCode, showHTMLEditor, showCSSEditor, showJSEditor, htmlEditorRef, cssEditorRef, jsEditorRef, }: UseEditorDefinitionsProps) => EditorDefinition[];
export {};
