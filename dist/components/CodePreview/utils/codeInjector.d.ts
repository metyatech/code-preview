/**
 * CSSファイルを注入するヘルパー関数
 * @param html HTMLコード
 * @param cssPath CSSファイルのパス
 * @param cssCode CSSコード
 * @returns 処理されたHTMLコード
 */
export declare const injectCss: (html: string, cssPath: string, cssCode: string) => string;
/**
 * JSファイルを注入するヘルパー関数
 * @param html HTMLコード
 * @param jsPath JSファイルのパス
 * @param jsCode JSコード
 * @returns 処理されたHTMLコードと注入されたかどうかのフラグ
 */
export declare const injectJs: (html: string, jsPath: string, jsCode: string) => {
    processed: string;
    injected: boolean;
};
