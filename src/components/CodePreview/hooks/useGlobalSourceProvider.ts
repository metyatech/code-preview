import { useEffect } from 'react';
import { ISourceCodeStore } from '../store';
import { SourceCodeState, ImageMap } from '../types';
import { normalizeImageMap } from '../utils/imageMap';

interface UseGlobalSourceProviderProps {
    sourceId?: string;
    store: ISourceCodeStore;
    share?: boolean;
    initialHTML?: string;
    initialCSS?: string;
    initialJS?: string;
    images?: ImageMap;
    htmlPath?: string;
    cssPath?: string;
    jsPath?: string;
    hasInitialHTML: boolean;
    hasInitialCSS: boolean;
    hasInitialJS: boolean;
}

export const useGlobalSourceProvider = (props: UseGlobalSourceProviderProps) => {
    const {
        sourceId,
        store,
        share = true,
        initialHTML,
        initialCSS,
        initialJS,
        images,
        htmlPath,
        cssPath,
        jsPath,
        hasInitialHTML,
        hasInitialCSS,
        hasInitialJS
    } = props;

    const hasSourceInputs = !!(
        hasInitialHTML ||
        hasInitialCSS ||
        hasInitialJS ||
        images !== undefined ||
        htmlPath !== undefined ||
        cssPath !== undefined ||
        jsPath !== undefined
    );
    const isSourceProvider = share && sourceId && hasSourceInputs;
    const normalizedImages = normalizeImageMap(images);

    useEffect(() => {
        if (sourceId && isSourceProvider) {
            const existing = store.get(sourceId) || {
                html: '',
                css: '',
                js: '',
                hasHtml: false,
                hasCss: false,
                hasJs: false
            };
            const updated: SourceCodeState = {
                html: hasInitialHTML ? initialHTML || '' : existing.html,
                css: hasInitialCSS ? initialCSS || '' : existing.css,
                js: hasInitialJS ? initialJS || '' : existing.js,
                hasHtml: hasInitialHTML ? true : (existing.hasHtml ?? false),
                hasCss: hasInitialCSS ? true : (existing.hasCss ?? false),
                hasJs: hasInitialJS ? true : (existing.hasJs ?? false),
                images: images !== undefined ? normalizedImages : existing.images,
                htmlPath: htmlPath !== undefined ? htmlPath : existing.htmlPath,
                cssPath: cssPath !== undefined ? cssPath : existing.cssPath,
                jsPath: jsPath !== undefined ? jsPath : existing.jsPath
            };
            store.set(sourceId, updated);
            store.notify(sourceId);
        }
    }, [
        sourceId,
        isSourceProvider,
        hasInitialHTML,
        hasInitialCSS,
        hasInitialJS,
        initialHTML,
        initialCSS,
        initialJS,
        images,
        normalizedImages,
        htmlPath,
        cssPath,
        jsPath,
        store
    ]);
};
