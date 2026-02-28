import { MutableRefObject } from 'react';
import type { editor } from 'monaco-editor';
export declare const useEditorMount: (updateSectionWidths: (force?: boolean) => void) => {
    createMountHandler: (ref: MutableRefObject<editor.IStandaloneCodeEditor | null>) => (editorInstance: editor.IStandaloneCodeEditor) => void;
};
