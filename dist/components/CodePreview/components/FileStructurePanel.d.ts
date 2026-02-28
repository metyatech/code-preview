import type { ImageMap } from '../types';
interface FileStructurePanelProps {
    resolvedHtmlPath?: string;
    resolvedCssPath?: string;
    resolvedJsPath?: string;
    resolvedImages?: ImageMap;
}
export declare const FileStructurePanel: ({ resolvedHtmlPath, resolvedCssPath, resolvedJsPath, resolvedImages, }: FileStructurePanelProps) => import("react/jsx-runtime").JSX.Element;
export {};
