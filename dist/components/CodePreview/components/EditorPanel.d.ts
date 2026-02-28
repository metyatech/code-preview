import { EditorConfig } from '../types';
interface EditorPanelProps {
    config: EditorConfig;
    width: number;
    height: string;
    theme: string;
    showLineNumbers: boolean;
}
export declare const EditorPanel: ({ config, width, height, theme, showLineNumbers, }: EditorPanelProps) => import("react/jsx-runtime").JSX.Element;
export {};
