import type { ImageMap, ImageSource, ResolvedImageMap } from '../types';

const resolveImageSource = (value: ImageSource): string | undefined => {
    if (typeof value === 'string') {
        return value;
    }

    if (!value || typeof value !== 'object') {
        return undefined;
    }

    if ('src' in value && typeof value.src === 'string') {
        return value.src;
    }

    if ('default' in value) {
        const defaultValue = value.default;
        if (typeof defaultValue === 'string') {
            return defaultValue;
        }
        if (defaultValue && typeof defaultValue === 'object' && 'src' in defaultValue) {
            return typeof defaultValue.src === 'string' ? defaultValue.src : undefined;
        }
    }

    return undefined;
};

export const normalizeImageMap = (images?: ImageMap): ResolvedImageMap | undefined => {
    if (!images) {
        return undefined;
    }

    const resolvedEntries = Object.entries(images)
        .map(([virtualPath, source]) => [virtualPath, resolveImageSource(source)] as const)
        .filter((entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].length > 0);

    return Object.fromEntries(resolvedEntries);
};
