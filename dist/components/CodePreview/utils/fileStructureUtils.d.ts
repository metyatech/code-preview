import type { ImageMap } from '../types';
export declare const buildFileStructure: (resolvedHtmlPath?: string, resolvedCssPath?: string, resolvedJsPath?: string, resolvedImages?: ImageMap) => {
    folders: Map<string, string[]>;
    rootFiles: string[];
};
