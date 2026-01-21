import { useMemo } from 'react';
import { CodePreviewProps } from './types';
import { useCodePreview } from './hooks/useCodePreview';
import { CodePreviewLayout } from './CodePreviewLayout';
import { parseCodeBlocksFromChildren, type ParsedCodeBlocks } from './utils/codeBlockParser';

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

    const shouldParseChildren =
        children !== undefined &&
        (initialHTML === undefined || initialCSS === undefined || initialJS === undefined);

    const parsedSource = useMemo<ParsedCodeBlocks>(
        () => (shouldParseChildren ? parseCodeBlocksFromChildren(children) : {}),
        [children, shouldParseChildren]
    );

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
