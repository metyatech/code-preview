import type { ResolvedImageMap } from '../types';
export interface AttributeProcessor {
    process(value: string, resolvedImages?: ResolvedImageMap, baseFilePath?: string): string;
}
export declare class DefaultAttributeProcessor implements AttributeProcessor {
    process(value: string, resolvedImages?: ResolvedImageMap, baseFilePath?: string): string;
}
export declare class SrcSetAttributeProcessor implements AttributeProcessor {
    process(value: string, resolvedImages?: ResolvedImageMap, baseFilePath?: string): string;
}
