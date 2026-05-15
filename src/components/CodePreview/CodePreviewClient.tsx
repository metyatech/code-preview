'use client';

import { useEffect, useMemo, useState } from 'react';
import { CodePreviewProps } from './types';
import { useCodePreview } from './hooks/useCodePreview';
import { CodePreviewLayout } from './CodePreviewLayout';
import {
    parseCodeBlocksFromChildren,
    shouldParseCodeBlocksFromChildren,
    type ParsedCodeBlocks
} from './utils/codeBlockParser';

const readDocumentTheme = (): CodePreviewProps['theme'] | undefined => {
    if (typeof document === 'undefined') {
        return undefined;
    }

    const html = document.documentElement;
    const body = document.body;
    const dataTheme = html.getAttribute('data-theme') ?? body.getAttribute('data-theme');

    if (dataTheme === 'dark' || dataTheme === 'light') {
        return dataTheme;
    }
    if (html.classList.contains('dark') || body.classList.contains('dark')) {
        return 'dark';
    }
    if (html.classList.contains('light') || body.classList.contains('light')) {
        return 'light';
    }

    return undefined;
};

const useDocumentTheme = (explicitTheme: CodePreviewProps['theme']) => {
    const [documentTheme, setDocumentTheme] = useState<CodePreviewProps['theme']>();

    useEffect(() => {
        if (explicitTheme !== undefined) {
            return;
        }

        const updateTheme = () => {
            setDocumentTheme(readDocumentTheme());
        };

        updateTheme();

        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class', 'data-theme']
        });
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class', 'data-theme']
        });

        return () => {
            observer.disconnect();
        };
    }, [explicitTheme]);

    return explicitTheme ?? documentTheme ?? 'light';
};

export default function CodePreviewClient(props: CodePreviewProps) {
    const { children, title, cssPath, jsPath, initialHTML, initialCSS, initialJS, theme, ...rest } = props;
    const resolvedTheme = useDocumentTheme(theme);

    const parsedSource = useMemo<ParsedCodeBlocks>(() => {
        if (!shouldParseCodeBlocksFromChildren(children, initialHTML, initialCSS, initialJS)) {
            return {};
        }
        return parseCodeBlocksFromChildren(children);
    }, [children, initialHTML, initialCSS, initialJS]);

    const resolvedInitialHTML = initialHTML ?? parsedSource.initialHTML;
    const resolvedInitialCSS = initialCSS ?? parsedSource.initialCSS;
    const resolvedInitialJS = initialJS ?? parsedSource.initialJS;

    const hookResult = useCodePreview({
        ...rest,
        theme: resolvedTheme,
        cssPath,
        jsPath,
        initialHTML: resolvedInitialHTML,
        initialCSS: resolvedInitialCSS,
        initialJS: resolvedInitialJS
    });

    return <CodePreviewLayout {...hookResult} title={title} cssPath={cssPath} jsPath={jsPath} />;
}
