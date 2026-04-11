import type { ResolvedImageMap } from '../types';
/**
 * Resolve image-related attribute values in HTML.
 */
export declare const processImagePaths: (code: string, resolvedImages?: ResolvedImageMap, htmlPath?: string) => string;
/**
 * Escape </script> tags in HTML to prevent premature termination.
 */
export declare const escapeScriptEndTag: (code: string) => string;
/**
 * Inline matching CSS/JS file paths into the HTML.
 */
export declare const resolveFilePaths: (html: string, cssPath?: string, cssCode?: string, jsPath?: string, jsCode?: string) => {
    processed: string;
    jsInjected: boolean;
};
/**
 * Process HTML with asset resolution and inline file injection.
 */
export declare const processHtmlCode: (code: string, cssPath?: string, cssCode?: string, jsPath?: string, jsCode?: string, resolvedImages?: ResolvedImageMap, htmlPath?: string) => {
    processed: string;
    jsInjected: boolean;
};
