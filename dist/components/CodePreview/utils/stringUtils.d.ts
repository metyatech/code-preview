/**
 * 文字列の末尾に改行がない場合、改行を追加して返します。
 * @param code 対象の文字列
 * @returns 末尾に改行コードが付与された文字列
 */
export declare const ensureTrailingNewline: (code: string) => string;
export declare const stripIndent: (value: string) => string;
export declare const normalizeInitialCode: (code?: string) => string | undefined;
