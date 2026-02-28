interface ToolbarProps {
    resetProgress: number;
    showLineNumbers: boolean;
    showFileStructure: boolean;
    onResetMouseDown: () => void;
    onResetMouseUp: () => void;
    onResetMouseLeave: () => void;
    onToggleLineNumbers: () => void;
    onToggleFileStructure: () => void;
}
export declare const Toolbar: ({ resetProgress, showLineNumbers, showFileStructure, onResetMouseDown, onResetMouseUp, onResetMouseLeave, onToggleLineNumbers, onToggleFileStructure }: ToolbarProps) => import("react/jsx-runtime").JSX.Element;
export {};
