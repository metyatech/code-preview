import type { CodePreviewProps } from '../types';
type CodePreviewFixtureProps = Omit<CodePreviewProps, 'children'> & {
    html?: string;
    css?: string;
    js?: string;
    jsLanguage?: 'js' | 'javascript';
};
export declare const CodePreviewFixture: ({ html, css, js, jsLanguage, ...props }: CodePreviewFixtureProps) => import("react/jsx-runtime").JSX.Element;
export {};
