import { useMemo } from 'react';
import { CodePreviewProps } from './types';
import { useCodePreview } from './hooks/useCodePreview';
import { CodePreviewLayout } from './CodePreviewLayout';
import {
    parseCodeBlocksFromChildren,
    shouldParseCodeBlocksFromChildren,
    type ParsedCodeBlocks
} from './utils/codeBlockParser';

export default function CodePreviewClient(props: CodePreviewProps) {
    const {
        children,
        title,
        cssPath,
        jsPath,
        initialHTML,
        initialCSS,
        initialJS,
        ...rest
    } = props;

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
        cssPath,
        jsPath,
        initialHTML: resolvedInitialHTML,
        initialCSS: resolvedInitialCSS,
        initialJS: resolvedInitialJS,
    });

    return (
        <CodePreviewLayout
            {...hookResult}
            title={title}
            cssPath={cssPath}
            jsPath={jsPath}
        />
    );
}
