import React from 'react';
import { test, expect } from '@playwright/experimental-ct-react';
import { parseCodeBlocksFromChildren } from './codeBlockParser';

test.describe('codeBlockParser', () => {
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
});
