import { useCodePreview } from './hooks/useCodePreview';
type UseCodePreviewResult = ReturnType<typeof useCodePreview>;
interface CodePreviewLayoutProps extends UseCodePreviewResult {
    title?: string;
    cssPath?: string;
    jsPath?: string;
}
export declare const CodePreviewLayout: ({ elementRefs, state, visibility, layout, handlers, title, cssPath, jsPath }: CodePreviewLayoutProps) => import("react/jsx-runtime").JSX.Element;
export {};
