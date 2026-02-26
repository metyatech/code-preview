import React from 'react';

const shouldParseCodeBlocksFromChildren = (children, initialHTML, initialCSS, initialJS) => children !== undefined && (initialHTML === undefined || initialCSS === undefined || initialJS === undefined);
const LANGUAGE_ALIASES = {
    html: 'html',
    css: 'css',
    js: 'js',
    javascript: 'js'
};
const extractLanguage = (className, language, lang, dataLanguage, dataLang) => {
    const explicit = (language || lang || dataLanguage || dataLang)?.toLowerCase();
    if (explicit && LANGUAGE_ALIASES[explicit]) {
        return LANGUAGE_ALIASES[explicit];
    }
    if (!className)
        return undefined;
    const match = className.match(/language-([a-z0-9_-]+)/i);
    if (!match)
        return undefined;
    const normalized = match[1].toLowerCase();
    return LANGUAGE_ALIASES[normalized];
};
const extractText = (node) => {
    let text = '';
    React.Children.forEach(node, (child) => {
        if (typeof child === 'string' || typeof child === 'number') {
            text += String(child);
            return;
        }
        if (React.isValidElement(child)) {
            text += extractText(child.props.children);
        }
    });
    return text;
};
const extractCodeFromNode = (node) => {
    const props = node.props;
    if (typeof props.code === 'string') {
        return props.code;
    }
    if (typeof props.value === 'string') {
        return props.value;
    }
    return extractText(props.children);
};
const parseFencedBlocks = (raw) => {
    const result = {};
    const regex = /```([a-z0-9_-]+)[ \t]*\r?\n([\s\S]*?)```/gi;
    let match;
    while ((match = regex.exec(raw)) !== null) {
        const language = LANGUAGE_ALIASES[match[1].toLowerCase()];
        if (!language) {
            continue;
        }
        if (result[language] === undefined) {
            result[language] = match[2];
        }
    }
    return result;
};
const collectCodeBlocks = (node, result, rawSegments) => {
    if (node === null || node === undefined)
        return;
    if (Array.isArray(node)) {
        node.forEach((child) => collectCodeBlocks(child, result, rawSegments));
        return;
    }
    if (typeof node === 'string' || typeof node === 'number') {
        rawSegments.push(String(node));
        return;
    }
    if (!React.isValidElement(node))
        return;
    const { className, children, language, lang, 'data-language': dataLanguage, 'data-lang': dataLang } = node.props;
    const detected = extractLanguage(className, language, lang, dataLanguage, dataLang);
    if (detected && result[detected] === undefined) {
        result[detected] = extractCodeFromNode(node);
        return;
    }
    collectCodeBlocks(children, result, rawSegments);
};
const parseCodeBlocksFromChildren = (children) => {
    const result = {};
    const rawSegments = [];
    collectCodeBlocks(children, result, rawSegments);
    const resolved = !result.html && !result.css && !result.js ? { ...result, ...parseFencedBlocks(rawSegments.join('')) } : result;
    return {
        initialHTML: resolved.html,
        initialCSS: resolved.css,
        initialJS: resolved.js
    };
};

export { parseCodeBlocksFromChildren as p, shouldParseCodeBlocksFromChildren as s };
//# sourceMappingURL=CodePreviewShared-OZSlX-Bp.esm.js.map
