import { editor } from 'monaco-editor';
export declare const MIN_EDITOR_WIDTH = 200;
/**
 * エディタのコンテンツ幅を取得します。
 * Monaco EditorのDOM構造に依存しているため、仕様変更に弱い可能性があります。
 */
export declare const getEditorScrollWidth: (editorInstance: editor.IStandaloneCodeEditor | null) => number;
/**
 * コンテナ幅と各エディタの必要幅に基づいて、最適な幅（％）を計算します。
 */
export declare const calculateOptimalEditorWidths: <K extends string>(containerWidth: number, editorNeeds: Array<{
    key: K;
    needed: number;
}>) => Record<K, number>;
/**
 * リサイズ時の新しい幅（％）を計算します。
 */
export declare const computeNewPairPercents: (containerWidth: number, leftPercent: number, rightPercent: number, deltaPx: number) => {
    left: number;
    right: number;
} | null;
