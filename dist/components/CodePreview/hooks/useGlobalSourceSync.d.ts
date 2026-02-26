import { ISourceCodeStore } from '../store';
interface UseGlobalSourceSyncProps {
    sourceId?: string;
    store: ISourceCodeStore;
    setHtmlCode: (code: string) => void;
    setCssCode: (code: string) => void;
    setJsCode: (code: string) => void;
    hasInitialHTML: boolean;
    hasInitialCSS: boolean;
    hasInitialJS: boolean;
    initialStateRef: React.MutableRefObject<{
        html: string;
        css: string;
        js: string;
    }>;
}
export declare const useGlobalSourceSync: ({ sourceId, store, setHtmlCode, setCssCode, setJsCode, hasInitialHTML, hasInitialCSS, hasInitialJS, initialStateRef }: UseGlobalSourceSyncProps) => void;
export {};
