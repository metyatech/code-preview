import type { MinHeightValue } from '../types';
export declare const normalizeMinHeight: (value: MinHeightValue | undefined, fallbackPx?: number) => {
    px: number;
    css: string;
};
