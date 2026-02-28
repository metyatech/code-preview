import { ISourceCodeStore } from '../store';
import type { ImageMap } from '../types';
interface UseSourceCodeStoreProps {
    sourceId?: string;
    share?: boolean;
    store?: ISourceCodeStore;
    initialHTML?: string;
    initialCSS?: string;
    initialJS?: string;
    images?: ImageMap;
    htmlPath?: string;
    cssPath?: string;
    jsPath?: string;
}
export declare const useSourceCodeStore: (props: UseSourceCodeStoreProps) => {
    htmlCode: string;
    setHtmlCode: import("react").Dispatch<import("react").SetStateAction<string>>;
    cssCode: string;
    setCssCode: import("react").Dispatch<import("react").SetStateAction<string>>;
    jsCode: string;
    setJsCode: import("react").Dispatch<import("react").SetStateAction<string>>;
    resolvedHTML: string | undefined;
    resolvedCSS: string | undefined;
    resolvedJS: string | undefined;
    resolvedImages: ImageMap | undefined;
    resolvedHtmlPath: string | undefined;
    resolvedCssPath: string | undefined;
    resolvedJsPath: string | undefined;
    initialStateRef: import("react").RefObject<{
        html: string;
        css: string;
        js: string;
    }>;
    resetCodes: () => void;
};
export {};
