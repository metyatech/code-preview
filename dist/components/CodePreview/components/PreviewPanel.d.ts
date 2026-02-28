import { type RefObject } from 'react';
import { PreviewGeneratorOptions } from '../utils/previewGenerator';
interface PreviewPanelProps {
    iframeRef: RefObject<HTMLIFrameElement | null>;
    iframeKey: number;
    previewHeight: string;
    minHeightCss: string;
    visible: boolean;
    generatorOptions: PreviewGeneratorOptions;
}
export declare const PreviewPanel: ({ iframeRef, iframeKey, previewHeight, minHeightCss, visible, generatorOptions, }: PreviewPanelProps) => import("react/jsx-runtime").JSX.Element;
export {};
