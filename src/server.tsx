import { cache } from 'react';
import type { CodePreviewProps } from './components/CodePreview/types';
import { CodePreview as CodePreviewClient } from './client';
import { parseCodeBlocksFromChildren, type ParsedCodeBlocks } from './components/CodePreview/utils/codeBlockParser';

const parseCodeBlocksFromChildrenCached = cache(parseCodeBlocksFromChildren);

export function CodePreview(props: CodePreviewProps) {
    const {
        children,
        initialHTML,
        initialCSS,
        initialJS,
        ...rest
    } = props;

    const shouldParseChildren =
        children !== undefined &&
        (initialHTML === undefined || initialCSS === undefined || initialJS === undefined);
    const parsedSource: ParsedCodeBlocks = shouldParseChildren
        ? parseCodeBlocksFromChildrenCached(children)
        : {};
    const resolvedInitialHTML = initialHTML ?? parsedSource.initialHTML;
    const resolvedInitialCSS = initialCSS ?? parsedSource.initialCSS;
    const resolvedInitialJS = initialJS ?? parsedSource.initialJS;

    return (
        <CodePreviewClient
            {...rest}
            initialHTML={resolvedInitialHTML}
            initialCSS={resolvedInitialCSS}
            initialJS={resolvedInitialJS}
        />
    );
}
