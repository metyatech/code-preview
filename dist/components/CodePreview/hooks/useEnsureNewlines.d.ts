import { EditorDefinition } from '../types';
interface UseEnsureNewlinesProps {
    editors: EditorDefinition[];
}
/**
 * 各エディタのコードの末尾に改行がない場合、自動的に改行を追加するフック。
 * エディタのカーソル位置を保持しながら更新します。
 */
export declare const useEnsureNewlines: ({ editors }: UseEnsureNewlinesProps) => void;
export {};
