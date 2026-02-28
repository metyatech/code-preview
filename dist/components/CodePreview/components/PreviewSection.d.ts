import type { RefObject } from 'react';
import type { ImageMap } from '../types';
interface PreviewSectionProps {
    visibility: {
        showPreview: boolean;
        showConsole: boolean;
        showHTMLEditor: boolean;
        showJSEditor: boolean;
        showCSSEditor: boolean;
    };
    state: {
        iframeKey: number;
        htmlCode: string;
        cssCode: string;
        jsCode: string;
        resolvedImages?: ImageMap;
        resolvedHtmlPath?: string;
        resolvedCssPath?: string;
        resolvedJsPath?: string;
        iframeId: string;
    };
    layout: {
        previewHeight: string;
    };
    minHeightCss: string;
    cssPath?: string;
    jsPath?: string;
    iframeRef: RefObject<HTMLIFrameElement | null>;
}
export declare const PreviewSection: ({ visibility, state, layout, minHeightCss, cssPath, jsPath, iframeRef, }: PreviewSectionProps) => import("react/jsx-runtime").JSX.Element | null;
export {};
