import { useEffect, useRef, type CSSProperties, type RefObject } from 'react';
import styles from '../styles.module.css';
import { generatePreviewDocument, PreviewGeneratorOptions } from '../utils/previewGenerator';

interface PreviewPanelProps {
    iframeRef: RefObject<HTMLIFrameElement | null>;
    iframeKey: number;
    previewHeight: string;
    minHeightCss: string;
    visible: boolean;
    generatorOptions: PreviewGeneratorOptions;
}

export const PreviewPanel = ({
    iframeRef,
    iframeKey,
    previewHeight,
    minHeightCss,
    visible,
    generatorOptions
}: PreviewPanelProps) => {
    const loadedOnClientRef = useRef(false);

    useEffect(() => {
        if (!visible) return;

        const iframe = iframeRef.current;
        if (!iframe) return;
        if (iframe.dataset.codePreviewHydrationReloaded === '1') return;
        if (loadedOnClientRef.current) return;

        const srcDoc = iframe.getAttribute('srcdoc');
        if (!srcDoc) return;

        const handleMessage = (event: MessageEvent) => {
            if (event.source !== iframe.contentWindow) return;
            if (event.data?.type !== 'codePreviewHydrationReady') return;
            if (iframe.dataset.codePreviewHydrationReloaded === '1') return;

            iframe.dataset.codePreviewHydrationReloaded = '1';
            iframe.srcdoc = srcDoc;
        };

        window.addEventListener('message', handleMessage);
        iframe.contentWindow?.postMessage({ type: 'codePreviewHydrationCheck' }, '*');

        return () => window.removeEventListener('message', handleMessage);
    }, [iframeKey, iframeRef, visible]);

    return (
        <iframe
            key={`${visible ? 'visible' : 'hidden'}-${iframeKey}`}
            ref={iframeRef}
            srcDoc={generatePreviewDocument(generatorOptions)}
            onLoad={() => {
                loadedOnClientRef.current = true;
            }}
            className={visible ? styles.preview : undefined}
            title="HTML+CSS Preview"
            sandbox="allow-scripts"
            style={
                visible
                    ? ({ height: previewHeight, '--min-height': minHeightCss } as CSSProperties)
                    : ({ display: 'none' } as CSSProperties)
            }
        />
    );
};
