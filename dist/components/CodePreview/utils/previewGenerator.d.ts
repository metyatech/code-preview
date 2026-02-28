import type { ImageMap } from '../types';
export interface PreviewGeneratorOptions {
    htmlCode: string;
    cssCode: string;
    jsCode: string;
    showPreview: boolean;
    showConsole: boolean;
    showHTMLEditor: boolean;
    showCSSEditor: boolean;
    showJSEditor: boolean;
    resolvedImages?: ImageMap;
    cssPath?: string;
    jsPath?: string;
    resolvedHtmlPath?: string;
    resolvedCssPath?: string;
    resolvedJsPath?: string;
    iframeId?: string;
}
export declare const generatePreviewDocument: (options: PreviewGeneratorOptions) => string;
