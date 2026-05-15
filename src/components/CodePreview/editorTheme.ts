import type { EditorProps } from '@monaco-editor/react';

export const CODE_PREVIEW_DARK_EDITOR_THEME = 'code-preview-dark';

type MonacoInstance = Parameters<NonNullable<EditorProps['beforeMount']>>[0];

const configuredMonacoInstances = new WeakSet<object>();
const tokenStyleElementId = 'code-preview-dark-token-override';

const ensureDarkTokenOverrideStyle = () => {
    if (typeof document === 'undefined' || document.getElementById(tokenStyleElementId)) {
        return;
    }

    const style = document.createElement('style');
    style.id = tokenStyleElementId;
    style.textContent = `
[class*='codePreviewContainer'][data-theme='dark'] .monaco-editor .mtk1 { color: #e2e8f0 !important; }
[class*='codePreviewContainer'][data-theme='dark'] .monaco-editor .mtk5 { color: #f9a8d4 !important; }
[class*='codePreviewContainer'][data-theme='dark'] .monaco-editor .mtk6 { color: #93c5fd !important; }
[class*='codePreviewContainer'][data-theme='dark'] .monaco-editor .mtk8 { color: #86efac !important; }
[class*='codePreviewContainer'][data-theme='dark'] .monaco-editor .mtk9 { color: #fbbf24 !important; }
[class*='codePreviewContainer'][data-theme='dark'] .monaco-editor .mtk10 { color: #d4d4d4 !important; }
[class*='codePreviewContainer'][data-theme='dark'] .monaco-editor .mtk11 { color: #b5cea8 !important; }
[class*='codePreviewContainer'][data-theme='dark'] .monaco-editor .mtk13 { color: #94a3b8 !important; }
[class*='codePreviewContainer'][data-theme='dark'] .monaco-editor .mtk16 { color: #cbd5e1 !important; }
[class*='codePreviewContainer'][data-theme='dark'] .monaco-editor .mtk24 { color: #60a5fa !important; }
`;
    document.head.appendChild(style);
};

export const defineCodePreviewEditorThemes = (monaco: MonacoInstance) => {
    ensureDarkTokenOverrideStyle();

    if (configuredMonacoInstances.has(monaco)) {
        return;
    }

    monaco.editor.defineTheme(CODE_PREVIEW_DARK_EDITOR_THEME, {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: '', foreground: 'e2e8f0' },
            { token: 'comment', foreground: '94a3b8', fontStyle: 'italic' },
            { token: 'keyword', foreground: 'c084fc' },
            { token: 'number', foreground: 'fbbf24' },
            { token: 'string', foreground: '86efac' },
            { token: 'type', foreground: '67e8f9' },
            { token: 'delimiter', foreground: 'cbd5e1' },
            { token: 'delimiter.html', foreground: '94a3b8' },
            { token: 'tag', foreground: '60a5fa' },
            { token: 'metatag', foreground: '60a5fa' },
            { token: 'attribute.name', foreground: 'f9a8d4' },
            { token: 'attribute.value', foreground: '86efac' },
            { token: 'attribute.value.html', foreground: '86efac' },
            { token: 'string.html', foreground: '86efac' },
            { token: 'string.css', foreground: '86efac' },
            { token: 'string.js', foreground: '86efac' },
            { token: 'property', foreground: '93c5fd' },
            { token: 'attribute.name.css', foreground: '93c5fd' },
            { token: 'attribute.value.css', foreground: 'fbbf24' },
            { token: 'identifier', foreground: 'e2e8f0' },
            { token: 'variable', foreground: 'e2e8f0' },
            { token: 'function', foreground: '67e8f9' }
        ],
        colors: {
            'editor.foreground': '#e2e8f0',
            'editor.background': '#0f172a',
            'editorGutter.background': '#0f172a',
            'editorLineNumber.foreground': '#94a3b8',
            'editorLineNumber.activeForeground': '#e2e8f0',
            'editorCursor.foreground': '#f8fafc',
            'editor.selectionBackground': '#2563eb66',
            'editor.inactiveSelectionBackground': '#33415599',
            'editorWidget.background': '#111827',
            'editorWhitespace.foreground': '#64748b80'
        }
    });

    configuredMonacoInstances.add(monaco);
};
