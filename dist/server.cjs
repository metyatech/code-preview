'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var CodePreviewShared = require('./CodePreviewShared-CYVQtdMZ.cjs');
var CodePreviewClient = require('./CodePreviewClient-dxsq5sYz.cjs');
require('@monaco-editor/react');

const parseCodeBlocksFromChildrenCached = React.cache(CodePreviewShared.parseCodeBlocksFromChildren);
function CodePreview(props) {
    const { children, initialHTML, initialCSS, initialJS, ...rest } = props;
    const shouldParseChildren = CodePreviewShared.shouldParseCodeBlocksFromChildren(children, initialHTML, initialCSS, initialJS);
    const parsedSource = shouldParseChildren ? parseCodeBlocksFromChildrenCached(children) : {};
    const resolvedInitialHTML = initialHTML ?? parsedSource.initialHTML;
    const resolvedInitialCSS = initialCSS ?? parsedSource.initialCSS;
    const resolvedInitialJS = initialJS ?? parsedSource.initialJS;
    return (jsxRuntime.jsx(CodePreviewClient.CodePreviewClient, { ...rest, initialHTML: resolvedInitialHTML, initialCSS: resolvedInitialCSS, initialJS: resolvedInitialJS }));
}

exports.CodePreview = CodePreview;
//# sourceMappingURL=server.cjs.map
