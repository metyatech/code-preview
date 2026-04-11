import { SourceCodeState, ImageMap } from '../types';
interface ResolveSourceProps {
    sourceId?: string;
    storedState?: SourceCodeState;
    initialHTML?: string;
    initialCSS?: string;
    initialJS?: string;
    images?: ImageMap;
    htmlPath?: string;
    cssPath?: string;
    jsPath?: string;
}
export declare const resolveInitialSource: (props: ResolveSourceProps) => {
    resolvedHTML: string | undefined;
    resolvedCSS: string | undefined;
    resolvedJS: string | undefined;
    resolvedImages: import("../types").ResolvedImageMap | undefined;
    resolvedHtmlPath: string | undefined;
    resolvedCssPath: string | undefined;
    resolvedJsPath: string | undefined;
    hasInitialHTML: boolean;
    hasInitialCSS: boolean;
    hasInitialJS: boolean;
};
export {};
