import { EditorDefinition } from '../types';
interface UsePreviewHeightProps {
    minHeightPx: number;
    showPreview: boolean;
    iframeRef: React.RefObject<HTMLIFrameElement | null>;
    editors: EditorDefinition[];
}
export declare const usePreviewHeight: ({ minHeightPx, showPreview, iframeRef, editors }: UsePreviewHeightProps) => {
    previewHeight: string;
    updatePreviewHeight: () => void;
};
export {};
