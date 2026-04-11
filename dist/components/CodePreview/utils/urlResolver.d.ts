import type { ResolvedImageMap } from '../types';
/**
 * Resolve a URL or path using an optional base URL and virtual image map.
 */
export declare const resolveUrl: (path: string, resolvedImages?: ResolvedImageMap, baseFilePath?: string) => string;
