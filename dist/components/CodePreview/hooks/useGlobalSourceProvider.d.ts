import { ISourceCodeStore } from '../store';
import { ImageMap } from '../types';
interface UseGlobalSourceProviderProps {
    sourceId?: string;
    store: ISourceCodeStore;
    share?: boolean;
    initialHTML?: string;
    initialCSS?: string;
    initialJS?: string;
    images?: ImageMap;
    htmlPath?: string;
    cssPath?: string;
    jsPath?: string;
    hasInitialHTML: boolean;
    hasInitialCSS: boolean;
    hasInitialJS: boolean;
}
export declare const useGlobalSourceProvider: (props: UseGlobalSourceProviderProps) => void;
export {};
