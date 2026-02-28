import type { ImageMap } from '../types';
export interface AttributeProcessor {
    process(value: string, resolvedImages?: ImageMap, baseFilePath?: string): string;
}
export declare class DefaultAttributeProcessor implements AttributeProcessor {
    process(value: string, resolvedImages?: ImageMap, baseFilePath?: string): string;
}
export declare class SrcSetAttributeProcessor implements AttributeProcessor {
    process(value: string, resolvedImages?: ImageMap, baseFilePath?: string): string;
}
