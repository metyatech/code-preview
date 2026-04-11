import type { ResolvedImageMap } from '../types';
export declare const buildFileStructure: (resolvedHtmlPath?: string, resolvedCssPath?: string, resolvedJsPath?: string, resolvedImages?: ResolvedImageMap) => {
    folders: Map<string, string[]>;
    rootFiles: string[];
};
