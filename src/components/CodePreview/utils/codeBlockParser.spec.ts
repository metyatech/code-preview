import React from 'react';
import { test, expect } from '@playwright/experimental-ct-react';
import { parseCodeBlocksFromChildren } from './codeBlockParser';

test.describe('codeBlockParser', () => {
    const parseWithProps = (props: Record<string, string>, code: string) => {
        const node = React.createElement(
            'pre',
            null,
            React.createElement('code', props, code),
        );
        return parseCodeBlocksFromChildren(node);
    };

    test('extracts code from data-language blocks', async () => {
        const node = React.createElement(
            'pre',
            null,
            React.createElement(
                'code',
                { 'data-language': 'html' },
                '<p>Hello</p>',
            ),
        );

        const parsed = parseCodeBlocksFromChildren(node);

        expect(parsed.initialHTML).toBe('<p>Hello</p>');
        expect(parsed.initialCSS).toBeUndefined();
        expect(parsed.initialJS).toBeUndefined();
    });

    test('extracts code from data-lang blocks', async () => {
        const node = React.createElement(
            'pre',
            null,
            React.createElement(
                'code',
                { 'data-lang': 'css' },
                'body { color: red; }',
            ),
        );

        const parsed = parseCodeBlocksFromChildren(node);

        expect(parsed.initialHTML).toBeUndefined();
        expect(parsed.initialCSS).toBe('body { color: red; }');
        expect(parsed.initialJS).toBeUndefined();
    });

    test('prefers explicit data-language over className', async () => {
        const node = React.createElement(
            'pre',
            null,
            React.createElement(
                'code',
                {
                    className: 'language-css',
                    'data-language': 'html',
                },
                '<div>Explicit</div>',
            ),
        );

        const parsed = parseCodeBlocksFromChildren(node);

        expect(parsed.initialHTML).toBe('<div>Explicit</div>');
        expect(parsed.initialCSS).toBeUndefined();
        expect(parsed.initialJS).toBeUndefined();
    });

    test('respects full language precedence order', async () => {
        const languageFirst = parseWithProps(
            {
                language: 'html',
                lang: 'css',
                'data-language': 'js',
                'data-lang': 'css',
                className: 'language-css',
            },
            '<section>Lang</section>',
        );
        expect(languageFirst.initialHTML).toBe('<section>Lang</section>');

        const langSecond = parseWithProps(
            {
                lang: 'css',
                'data-language': 'html',
                'data-lang': 'js',
                className: 'language-js',
            },
            'body { color: purple; }',
        );
        expect(langSecond.initialCSS).toBe('body { color: purple; }');

        const dataLanguageThird = parseWithProps(
            {
                'data-language': 'html',
                'data-lang': 'css',
                className: 'language-js',
            },
            '<p>Data Language</p>',
        );
        expect(dataLanguageThird.initialHTML).toBe('<p>Data Language</p>');

        const dataLangFourth = parseWithProps(
            {
                'data-lang': 'css',
                className: 'language-html',
            },
            'body { color: green; }',
        );
        expect(dataLangFourth.initialCSS).toBe('body { color: green; }');
    });

    test('extracts code from className when explicit language is missing', async () => {
        const classNameOnly = parseWithProps(
            {
                className: 'language-html',
            },
            '<main>From className</main>',
        );

        expect(classNameOnly.initialHTML).toBe('<main>From className</main>');
        expect(classNameOnly.initialCSS).toBeUndefined();
        expect(classNameOnly.initialJS).toBeUndefined();
    });
});
