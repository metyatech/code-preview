declare global {
    interface Window {
        __codePreviewHydrationTest?: {
            loadCount: number;
        };
    }
}
export declare const HydrationReloadFixture: () => import("react/jsx-runtime").JSX.Element;
