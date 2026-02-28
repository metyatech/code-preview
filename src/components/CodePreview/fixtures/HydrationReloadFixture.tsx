import React, { useEffect, useRef } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { PreviewPanel } from '../components/PreviewPanel';

declare global {
  interface Window {
    __codePreviewHydrationTest?: {
      loadCount: number;
    };
  }
}

const buildSrcDoc = () =>
  [
    '<!doctype html>',
    '<html>',
    '<head>',
    '<meta charset="utf-8" />',
    '<style>',
    'body { margin: 0; }',
    '.parallax1 { height: 2000px; background-attachment: fixed; background: linear-gradient(#000, #fff); }',
    '</style>',
    '</head>',
    '<body>',
    '<div class="parallax1"></div>',
    '</body>',
    '</html>',
  ].join('\n');

export const HydrationReloadFixture = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hydratedRootRef = useRef<Root | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const testState = { loadCount: 0 };
    window.__codePreviewHydrationTest = testState;

    const iframe = document.createElement('iframe');
    iframe.title = 'HTML+CSS Preview';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    iframe.style.height = '200px';
    iframe.style.setProperty('--min-height', '200px');
    iframe.addEventListener('load', () => {
      testState.loadCount += 1;
    });
    container.appendChild(iframe);

    const run = async () => {
      iframe.srcdoc = buildSrcDoc();

      await new Promise<void>((resolve) => {
        const onLoad = () => resolve();
        iframe.addEventListener('load', onLoad, { once: true });
      });

      hydratedRootRef.current = hydrateRoot(
        container,
        <PreviewPanel
          iframeRef={{ current: iframe }}
          iframeKey={0}
          previewHeight="200px"
          minHeightCss="200px"
          visible={true}
          generatorOptions={{
            htmlCode: '',
            cssCode: '',
            jsCode: '',
            showPreview: true,
            showConsole: false,
            showHTMLEditor: false,
            showJSEditor: false,
            resolvedImages: {},
            cssPath: undefined,
            jsPath: undefined,
            resolvedHtmlPath: 'index.html',
            resolvedCssPath: undefined,
            resolvedJsPath: undefined,
            iframeId: 'test-iframe',
          }}
        />,
      );
    };

    void run();

    return () => {
      hydratedRootRef.current?.unmount();
    };
  }, []);

  return <div ref={containerRef} />;
};
