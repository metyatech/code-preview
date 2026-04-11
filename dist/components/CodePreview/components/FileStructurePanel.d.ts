import type { ResolvedImageMap } from '../types';
interface FileStructurePanelProps {
    resolvedHtmlPath?: string;
    resolvedCssPath?: string;
    resolvedJsPath?: string;
    resolvedImages?: ResolvedImageMap;
}
export declare const FileStructurePanel: ({ resolvedHtmlPath, resolvedCssPath, resolvedJsPath, resolvedImages }: FileStructurePanelProps) => import("react/jsx-runtime").JSX.Element;
export {};
