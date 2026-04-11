import { jsx } from 'react/jsx-runtime';
import { cache } from 'react';
import { p as parseCodeBlocksFromChildren, s as shouldParseCodeBlocksFromChildren } from './CodePreviewShared-OZSlX-Bp.esm.js';
import { C as CodePreviewClient } from './CodePreviewClient-DVyay_AX.esm.js';
import '@monaco-editor/react';

const parseCodeBlocksFromChildrenCached = cache(parseCodeBlocksFromChildren);
function CodePreview(props) {
    const { children, initialHTML, initialCSS, initialJS, ...rest } = props;
    const shouldParseChildren = shouldParseCodeBlocksFromChildren(children, initialHTML, initialCSS, initialJS);
    const parsedSource = shouldParseChildren ? parseCodeBlocksFromChildrenCached(children) : {};
    const resolvedInitialHTML = initialHTML ?? parsedSource.initialHTML;
    const resolvedInitialCSS = initialCSS ?? parsedSource.initialCSS;
    const resolvedInitialJS = initialJS ?? parsedSource.initialJS;
    return (jsx(CodePreviewClient, { ...rest, initialHTML: resolvedInitialHTML, initialCSS: resolvedInitialCSS, initialJS: resolvedInitialJS }));
}

export { CodePreview };
//# sourceMappingURL=server.esm.js.map
