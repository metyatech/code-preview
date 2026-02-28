import type { KeyboardEvent, MouseEvent } from 'react';
import { EditorKey } from '../types';
interface ResizerProps {
    leftKey: EditorKey;
    rightKey: EditorKey;
    leftLabel: string;
    rightLabel: string;
    onMouseDown: (event: MouseEvent, left: EditorKey, right: EditorKey) => void;
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>, left: EditorKey, right: EditorKey) => void;
    onDoubleClick: (event: MouseEvent) => void;
}
export declare const Resizer: ({ leftKey, rightKey, leftLabel, rightLabel, onMouseDown, onKeyDown, onDoubleClick, }: ResizerProps) => import("react/jsx-runtime").JSX.Element;
export {};
