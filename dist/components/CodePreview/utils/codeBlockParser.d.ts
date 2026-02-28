import React from 'react';
export interface ParsedCodeBlocks {
    initialHTML?: string;
    initialCSS?: string;
    initialJS?: string;
}
export declare const shouldParseCodeBlocksFromChildren: (children: React.ReactNode, initialHTML?: string, initialCSS?: string, initialJS?: string) => boolean;
export declare const parseCodeBlocksFromChildren: (children: React.ReactNode) => ParsedCodeBlocks;
