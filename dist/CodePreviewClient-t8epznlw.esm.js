"use client";

import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useRef, useEffect, useSyncExternalStore, useMemo, useCallback, useState, useId, Fragment as Fragment$1 } from 'react';
import Editor from '@monaco-editor/react';
import { s as shouldParseCodeBlocksFromChildren, p as parseCodeBlocksFromChildren } from './CodePreviewShared-OZSlX-Bp.esm.js';

/**
 * 文字列の末尾に改行がない場合、改行を追加して返します。
 * @param code 対象の文字列
 * @returns 末尾に改行コードが付与された文字列
 */
const ensureTrailingNewline = (code) => {
    if (code && !code.endsWith('\n')) {
        return code + '\n';
    }
    return code;
};
const stripIndent = (value) => {
    const normalized = value.replace(/\r\n?/g, '\n');
    const lines = normalized.split('\n');
    let start = 0;
    let end = lines.length;
    while (start < end && lines[start].trim() === '') {
        start += 1;
    }
    while (end > start && lines[end - 1].trim() === '') {
        end -= 1;
    }
    const trimmed = lines.slice(start, end);
    if (trimmed.length === 0) {
        return '';
    }
    const indents = trimmed.filter((line) => line.trim().length > 0).map((line) => line.match(/^\s*/)?.[0].length ?? 0);
    const minIndent = indents.length > 0 ? Math.min(...indents) : 0;
    return trimmed.map((line) => line.slice(minIndent)).join('\n');
};
const normalizeInitialCode = (code) => {
    if (code === undefined) {
        return undefined;
    }
    if (!code.includes('\n') && !code.includes('\r')) {
        return code;
    }
    return stripIndent(code);
};

const resolveInitialSource = (props) => {
    const { sourceId, storedState, initialHTML, initialCSS, initialJS, images, htmlPath, cssPath, jsPath } = props;
    const hasInitialHTML = initialHTML !== undefined;
    const hasInitialCSS = initialCSS !== undefined;
    const hasInitialJS = initialJS !== undefined;
    let resolvedHTML = initialHTML;
    let resolvedCSS = initialCSS;
    let resolvedJS = initialJS;
    let resolvedImages = images;
    let resolvedHtmlPath = htmlPath;
    let resolvedCssPath = cssPath;
    let resolvedJsPath = jsPath;
    if (sourceId && storedState) {
        const stored = storedState;
        const storedHasHtml = stored.hasHtml ?? true;
        const storedHasCss = stored.hasCss ?? true;
        const storedHasJs = stored.hasJs ?? true;
        if (!hasInitialHTML && storedHasHtml)
            resolvedHTML = stored.html;
        if (!hasInitialCSS && storedHasCss)
            resolvedCSS = stored.css;
        if (!hasInitialJS && storedHasJs)
            resolvedJS = stored.js;
        if (images === undefined && stored.images !== undefined) {
            resolvedImages = stored.images;
        }
        if (htmlPath === undefined && stored.htmlPath !== undefined) {
            resolvedHtmlPath = stored.htmlPath;
        }
        if (cssPath === undefined && stored.cssPath !== undefined) {
            resolvedCssPath = stored.cssPath;
        }
        if (jsPath === undefined && stored.jsPath !== undefined) {
            resolvedJsPath = stored.jsPath;
        }
    }
    return {
        resolvedHTML,
        resolvedCSS,
        resolvedJS,
        resolvedImages,
        resolvedHtmlPath,
        resolvedCssPath,
        resolvedJsPath,
        hasInitialHTML,
        hasInitialCSS,
        hasInitialJS
    };
};

const useGlobalSourceSync = ({ sourceId, store, setHtmlCode, setCssCode, setJsCode, hasInitialHTML, hasInitialCSS, hasInitialJS, initialStateRef }) => {
    const capturedInitialRef = useRef({
        html: !!(sourceId ? hasInitialHTML : true),
        css: !!(sourceId ? hasInitialCSS : true),
        js: !!(sourceId ? hasInitialJS : true)
    });
    useEffect(() => {
        if (!sourceId)
            return;
        const updateFromStore = () => {
            const stored = store.get(sourceId);
            if (stored) {
                const storedHasHtml = stored.hasHtml ?? true;
                const storedHasCss = stored.hasCss ?? true;
                const storedHasJs = stored.hasJs ?? true;
                if (!hasInitialHTML && storedHasHtml) {
                    const code = ensureTrailingNewline(stored.html);
                    setHtmlCode(code);
                    if (!capturedInitialRef.current.html) {
                        initialStateRef.current.html = code;
                        capturedInitialRef.current.html = true;
                    }
                }
                if (!hasInitialCSS && storedHasCss) {
                    const code = ensureTrailingNewline(stored.css);
                    setCssCode(code);
                    if (!capturedInitialRef.current.css) {
                        initialStateRef.current.css = code;
                        capturedInitialRef.current.css = true;
                    }
                }
                if (!hasInitialJS && storedHasJs) {
                    const code = ensureTrailingNewline(stored.js);
                    setJsCode(code);
                    if (!capturedInitialRef.current.js) {
                        initialStateRef.current.js = code;
                        capturedInitialRef.current.js = true;
                    }
                }
            }
        };
        // Initial check
        updateFromStore();
        return store.subscribe(sourceId, updateFromStore);
    }, [
        sourceId,
        store,
        hasInitialHTML,
        hasInitialCSS,
        hasInitialJS,
        setHtmlCode,
        setCssCode,
        setJsCode,
        initialStateRef
    ]);
};

const useGlobalSourceProvider = (props) => {
    const { sourceId, store, share = true, initialHTML, initialCSS, initialJS, images, htmlPath, cssPath, jsPath, hasInitialHTML, hasInitialCSS, hasInitialJS } = props;
    const hasSourceInputs = !!(hasInitialHTML ||
        hasInitialCSS ||
        hasInitialJS ||
        images !== undefined ||
        htmlPath !== undefined ||
        cssPath !== undefined ||
        jsPath !== undefined);
    const isSourceProvider = share && sourceId && hasSourceInputs;
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
            const updated = {
                html: hasInitialHTML ? initialHTML || '' : existing.html,
                css: hasInitialCSS ? initialCSS || '' : existing.css,
                js: hasInitialJS ? initialJS || '' : existing.js,
                hasHtml: hasInitialHTML ? true : (existing.hasHtml ?? false),
                hasCss: hasInitialCSS ? true : (existing.hasCss ?? false),
                hasJs: hasInitialJS ? true : (existing.hasJs ?? false),
                images: images !== undefined ? images : existing.images,
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
        htmlPath,
        cssPath,
        jsPath,
        store
    ]);
};

let initialized = false;
let currentPathname = typeof window !== 'undefined' ? window.location.pathname : undefined;
let listeners = new Set();
let originalPushState = null;
let originalReplaceState = null;
let notifyScheduled = false;
const scheduleNotify = () => {
    if (notifyScheduled)
        return;
    notifyScheduled = true;
    const run = () => {
        notifyScheduled = false;
        listeners.forEach((listener) => listener());
    };
    if (typeof queueMicrotask === 'function') {
        queueMicrotask(run);
        return;
    }
    setTimeout(run, 0);
};
const notifyListeners = () => {
    if (typeof window === 'undefined')
        return;
    const nextPathname = window.location.pathname;
    if (nextPathname === currentPathname)
        return;
    currentPathname = nextPathname;
    scheduleNotify();
};
const ensureInitialized = () => {
    if (initialized || typeof window === 'undefined')
        return;
    initialized = true;
    currentPathname = window.location.pathname;
    window.addEventListener('popstate', notifyListeners);
    originalPushState = history.pushState;
    originalReplaceState = history.replaceState;
    history.pushState = function pushState(...args) {
        originalPushState?.apply(this, args);
        notifyListeners();
    };
    history.replaceState = function replaceState(...args) {
        originalReplaceState?.apply(this, args);
        notifyListeners();
    };
};
const cleanup = () => {
    if (typeof window === 'undefined')
        return;
    window.removeEventListener('popstate', notifyListeners);
    if (originalPushState) {
        history.pushState = originalPushState;
    }
    if (originalReplaceState) {
        history.replaceState = originalReplaceState;
    }
    originalPushState = null;
    originalReplaceState = null;
    initialized = false;
    listeners = new Set();
    notifyScheduled = false;
    currentPathname = undefined;
};
const subscribe = (listener) => {
    if (typeof window === 'undefined') {
        return () => { };
    }
    ensureInitialized();
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
            cleanup();
        }
    };
};
const getSnapshot = () => currentPathname;
const getServerSnapshot = () => undefined;
const usePathname = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

class SourceCodeStore {
    constructor() {
        this.store = new Map();
        this.listeners = new Map();
    }
    get(sourceId) {
        return this.store.get(sourceId);
    }
    set(sourceId, state) {
        this.store.set(sourceId, state);
    }
    subscribe(sourceId, listener) {
        if (!this.listeners.has(sourceId)) {
            this.listeners.set(sourceId, new Set());
        }
        this.listeners.get(sourceId).add(listener);
        return () => {
            this.listeners.get(sourceId)?.delete(listener);
        };
    }
    notify(sourceId) {
        const listeners = this.listeners.get(sourceId);
        if (listeners) {
            listeners.forEach((listener) => listener());
        }
    }
}
const globalSourceCodeStore = new SourceCodeStore();
// Expose the store on window for tests and debugging.
if (typeof window !== 'undefined') {
    window.__CodePreviewStore__ = globalSourceCodeStore;
}

const useSourceCodeStore = (props) => {
    const { store = globalSourceCodeStore, sourceId } = props;
    const normalizedInitialHTML = normalizeInitialCode(props.initialHTML);
    const normalizedInitialCSS = normalizeInitialCode(props.initialCSS);
    const normalizedInitialJS = normalizeInitialCode(props.initialJS);
    const pathname = usePathname();
    const scopedSourceId = useMemo(() => {
        if (!sourceId)
            return undefined;
        if (!pathname)
            return sourceId;
        return `${sourceId}:${pathname}`;
    }, [sourceId, pathname]);
    const subscribe = useCallback((listener) => {
        if (!scopedSourceId) {
            return () => { };
        }
        return store.subscribe(scopedSourceId, listener);
    }, [store, scopedSourceId]);
    const getSnapshot = useCallback(() => {
        if (!scopedSourceId) {
            return undefined;
        }
        return store.get(scopedSourceId);
    }, [store, scopedSourceId]);
    const storedState = useSyncExternalStore(subscribe, getSnapshot, () => undefined);
    const { resolvedHTML, resolvedCSS, resolvedJS, resolvedImages, resolvedHtmlPath, resolvedCssPath, resolvedJsPath, hasInitialHTML, hasInitialCSS, hasInitialJS } = resolveInitialSource({
        sourceId: scopedSourceId,
        storedState,
        initialHTML: normalizedInitialHTML,
        initialCSS: normalizedInitialCSS,
        initialJS: normalizedInitialJS,
        images: props.images,
        htmlPath: props.htmlPath,
        cssPath: props.cssPath,
        jsPath: props.jsPath
    });
    const [htmlCode, setHtmlCode] = useState(ensureTrailingNewline(resolvedHTML || ''));
    const [cssCode, setCssCode] = useState(ensureTrailingNewline(resolvedCSS || ''));
    const [jsCode, setJsCode] = useState(ensureTrailingNewline(resolvedJS || ''));
    const initialStateRef = useRef({
        html: ensureTrailingNewline(resolvedHTML || ''),
        css: ensureTrailingNewline(resolvedCSS || ''),
        js: ensureTrailingNewline(resolvedJS || '')
    });
    useGlobalSourceSync({
        sourceId: scopedSourceId,
        store,
        setHtmlCode,
        setCssCode,
        setJsCode,
        hasInitialHTML,
        hasInitialCSS,
        hasInitialJS,
        initialStateRef
    });
    useGlobalSourceProvider({
        sourceId: scopedSourceId,
        store,
        share: props.share,
        initialHTML: normalizedInitialHTML,
        initialCSS: normalizedInitialCSS,
        initialJS: normalizedInitialJS,
        images: props.images,
        htmlPath: props.htmlPath,
        cssPath: props.cssPath,
        jsPath: props.jsPath,
        hasInitialHTML,
        hasInitialCSS,
        hasInitialJS
    });
    const resetCodes = useCallback(() => {
        setHtmlCode(initialStateRef.current.html);
        setCssCode(initialStateRef.current.css);
        setJsCode(initialStateRef.current.js);
    }, [setHtmlCode, setCssCode, setJsCode]);
    return {
        htmlCode,
        setHtmlCode,
        cssCode,
        setCssCode,
        jsCode,
        setJsCode,
        resolvedHTML,
        resolvedCSS,
        resolvedJS,
        resolvedImages,
        resolvedHtmlPath,
        resolvedCssPath,
        resolvedJsPath,
        initialStateRef,
        resetCodes
    };
};

const MIN_EDITOR_WIDTH = 200;
/**
 * エディタのコンテンツ幅を取得します。
 * Monaco EditorのDOM構造に依存しているため、仕様変更に弱い可能性があります。
 */
const getEditorScrollWidth = (editorInstance) => {
    if (!editorInstance)
        return MIN_EDITOR_WIDTH;
    try {
        const domNode = editorInstance.getDomNode();
        if (!domNode)
            return MIN_EDITOR_WIDTH;
        const cursorTextElement = domNode.querySelector('.monaco-mouse-cursor-text');
        if (cursorTextElement) {
            const viewLines = cursorTextElement.querySelectorAll('.view-line');
            let maxSpanWidth = 0;
            for (let i = 0; i < viewLines.length; i++) {
                const viewLine = viewLines[i];
                const span = viewLine.querySelector('span');
                if (span) {
                    const spanStyle = window.getComputedStyle(span);
                    const spanWidth = parseFloat(spanStyle.width) || 0;
                    maxSpanWidth = Math.max(maxSpanWidth, spanWidth);
                }
            }
            if (maxSpanWidth > 0) {
                return maxSpanWidth + 10 + 25; // 左右の余白を考慮
            }
        }
        return MIN_EDITOR_WIDTH;
    }
    catch {
        return MIN_EDITOR_WIDTH; // エラー時は最小幅
    }
};
/**
 * コンテナ幅と各エディタの必要幅に基づいて、最適な幅（％）を計算します。
 */
const calculateOptimalEditorWidths = (containerWidth, editorNeeds) => {
    const resultWidths = {};
    const count = editorNeeds.length;
    if (count === 0) {
        return resultWidths;
    }
    if (containerWidth <= 0) {
        const width = 100 / count;
        editorNeeds.forEach((e) => (resultWidths[e.key] = width));
        return resultWidths;
    }
    const minEditorWidth = MIN_EDITOR_WIDTH;
    const totalNeededWidth = editorNeeds.reduce((sum, e) => sum + e.needed, 0);
    if (totalNeededWidth > containerWidth) {
        const remainingWidth = containerWidth - minEditorWidth * count;
        if (remainingWidth <= 0) {
            // スペース不足の場合は均等割り
            const width = 100 / count;
            editorNeeds.forEach((e) => (resultWidths[e.key] = width));
            return resultWidths;
        }
        const widthsPx = {};
        editorNeeds.forEach((e) => {
            const ratio = e.needed / totalNeededWidth;
            widthsPx[e.key] = minEditorWidth + remainingWidth * ratio;
        });
        editorNeeds.forEach((e) => {
            resultWidths[e.key] = (widthsPx[e.key] / containerWidth) * 100;
        });
    }
    else {
        editorNeeds.forEach((e) => {
            resultWidths[e.key] = (e.needed / totalNeededWidth) * 100;
        });
    }
    return resultWidths;
};
/**
 * リサイズ時の新しい幅（％）を計算します。
 */
const computeNewPairPercents = (containerWidth, leftPercent, rightPercent, deltaPx) => {
    if (!containerWidth) {
        return null;
    }
    const leftPx = (leftPercent / 100) * containerWidth;
    const rightPx = (rightPercent / 100) * containerWidth;
    const totalPx = leftPx + rightPx;
    if (!Number.isFinite(totalPx) || totalPx <= 0) {
        return null;
    }
    let newLeftPx = leftPx + deltaPx;
    let newRightPx = rightPx - deltaPx;
    const effectiveMin = Math.min(MIN_EDITOR_WIDTH, totalPx / 2);
    if (newLeftPx < effectiveMin) {
        newLeftPx = effectiveMin;
        newRightPx = totalPx - newLeftPx;
    }
    else if (newRightPx < effectiveMin) {
        newRightPx = effectiveMin;
        newLeftPx = totalPx - newRightPx;
    }
    return {
        left: (newLeftPx / containerWidth) * 100,
        right: (newRightPx / containerWidth) * 100
    };
};

const KEYBOARD_STEP_PERCENT = 5;
const useEditorResize = ({ resizeTargets, containerRef, initialWidths }) => {
    const [sectionWidths, setSectionWidths] = useState(() => {
        if (initialWidths)
            return initialWidths;
        const widths = {};
        const count = resizeTargets.length;
        if (count > 0) {
            const width = 100 / count;
            resizeTargets.forEach((t) => (widths[t.key] = width));
        }
        return widths;
    });
    const [isResizing, setIsResizing] = useState(false);
    const dragStateRef = useRef(null);
    const userResizedRef = useRef(false);
    const calculateOptimalWidths = useCallback(() => {
        const container = containerRef.current;
        const containerWidth = container?.offsetWidth || 800; // フォールバック値
        const editors = [];
        const minEditorWidth = MIN_EDITOR_WIDTH;
        resizeTargets.forEach((target) => {
            const htmlNeededWidth = Math.max(getEditorScrollWidth(target.ref.current), minEditorWidth);
            editors.push({ key: target.key, needed: htmlNeededWidth });
        });
        return calculateOptimalEditorWidths(containerWidth, editors);
    }, [containerRef, resizeTargets]);
    const updateSectionWidths = useCallback((force = false) => {
        if (!force && userResizedRef.current) {
            return;
        }
        const newWidths = calculateOptimalWidths();
        setSectionWidths(newWidths);
    }, [calculateOptimalWidths]);
    const handleMouseMove = useCallback((e) => {
        if (!dragStateRef.current)
            return;
        const { startX, leftKey, rightKey, leftWidthPercent, rightWidthPercent, containerWidth } = dragStateRef.current;
        const deltaPx = e.clientX - startX;
        const result = computeNewPairPercents(containerWidth, leftWidthPercent, rightWidthPercent, deltaPx);
        if (result) {
            setSectionWidths((prev) => ({
                ...prev,
                [leftKey]: result.left,
                [rightKey]: result.right
            }));
        }
    }, []);
    const handleMouseUp = useCallback(function onMouseUp() {
        if (dragStateRef.current) {
            document.body.style.cursor = dragStateRef.current.restoreCursor;
            document.body.style.userSelect = dragStateRef.current.restoreUserSelect;
            dragStateRef.current = null;
            setIsResizing(false);
            userResizedRef.current = true;
        }
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    }, [handleMouseMove]);
    const handleMouseDown = (e, leftKey, rightKey) => {
        e.preventDefault();
        if (!containerRef.current)
            return;
        const containerWidth = containerRef.current.offsetWidth;
        const leftWidthPercent = sectionWidths[leftKey];
        const rightWidthPercent = sectionWidths[rightKey];
        dragStateRef.current = {
            startX: e.clientX,
            leftKey,
            rightKey,
            leftWidthPercent,
            rightWidthPercent,
            containerWidth,
            restoreCursor: document.body.style.cursor,
            restoreUserSelect: document.body.style.userSelect
        };
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        setIsResizing(true);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };
    const resetSectionWidthsToAuto = useCallback(() => {
        userResizedRef.current = false;
        updateSectionWidths(true);
    }, [updateSectionWidths]);
    const handleResizerKeyDown = (event, leftKey, rightKey) => {
        if (!containerRef.current) {
            return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            resetSectionWidthsToAuto();
            return;
        }
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
            return;
        }
        const containerWidth = containerRef.current.getBoundingClientRect().width;
        if (!containerWidth) {
            return;
        }
        const direction = event.key === 'ArrowLeft' ? -1 : 1;
        const deltaPx = (KEYBOARD_STEP_PERCENT / 100) * containerWidth * direction;
        const adjusted = computeNewPairPercents(containerWidth, sectionWidths[leftKey] ?? 0, sectionWidths[rightKey] ?? 0, deltaPx);
        if (!adjusted) {
            return;
        }
        userResizedRef.current = true;
        setSectionWidths((prev) => ({
            ...prev,
            [leftKey]: adjusted.left,
            [rightKey]: adjusted.right
        }));
        event.preventDefault();
    };
    useEffect(() => {
        userResizedRef.current = false;
        updateSectionWidths(true);
    }, [resizeTargets, updateSectionWidths]);
    useEffect(() => {
        const handleResize = () => {
            updateSectionWidths();
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [updateSectionWidths]);
    return {
        sectionWidths,
        isResizing,
        handleMouseDown,
        handleResizerKeyDown,
        updateSectionWidths,
        resetSectionWidthsToAuto
    };
};

/** Monaco Editorの行の高さ (px) */
const EDITOR_LINE_HEIGHT = 19;
/** エディタの垂直パディング (px) */
const EDITOR_VERTICAL_PADDING = 22;
/** エディタの最大高さ (px) */
const MAX_EDITOR_HEIGHT = 600;
/** 高さ更新の遅延時間 (ms) */
const HEIGHT_UPDATE_DELAY_MS = 100;
/**
 * エディタの高さを計算・管理するフック
 */
const useEditorHeight = ({ minHeightPx, editors }) => {
    const [editorHeight, setEditorHeight] = useState(`${minHeightPx}px`);
    const calculateEditorHeight = useCallback(() => {
        const calculateEditorHeightByCode = (code, editorRef) => {
            // 実際のエディタコンテンツの高さが取得できる場合はそれを使用
            if (editorRef && editorRef.current) {
                const editorInstance = editorRef.current;
                // getContentHeight はコンテンツの高さを返す
                const contentHeight = editorInstance.getContentHeight();
                if (contentHeight > 0) {
                    return contentHeight;
                }
            }
            // エディタがまだマウントされていない場合のヒューリスティック計算
            if (!code)
                return minHeightPx;
            const lines = code.split('\n').length;
            // 行数 * 行の高さ + パディング で高さを推定
            return Math.max(lines * EDITOR_LINE_HEIGHT + EDITOR_VERTICAL_PADDING, minHeightPx);
        };
        const heights = editors
            .filter((editor) => editor.visible)
            .map((editor) => calculateEditorHeightByCode(editor.code, editor.ref));
        // 表示されているエディタの中で最大の高さを採用
        const maxEditorHeight = heights.length > 0 ? Math.max(...heights) : 0;
        const finalEditorHeight = Math.max(maxEditorHeight, minHeightPx);
        // 最大高さ制限を適用
        const limitedEditorHeight = Math.min(finalEditorHeight, MAX_EDITOR_HEIGHT);
        setEditorHeight(limitedEditorHeight + 'px');
    }, [editors, minHeightPx]);
    const updateEditorHeight = useCallback(() => {
        setTimeout(() => {
            calculateEditorHeight();
        }, HEIGHT_UPDATE_DELAY_MS);
    }, [calculateEditorHeight]);
    useEffect(() => {
        updateEditorHeight();
    }, [updateEditorHeight]);
    useEffect(() => {
        const handleResize = () => {
            updateEditorHeight();
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [updateEditorHeight]);
    return { editorHeight, updateEditorHeight };
};

const MAX_PREVIEW_HEIGHT = 800;
const usePreviewHeight = ({ minHeightPx, showPreview, iframeRef, editors }) => {
    const [previewHeight, setPreviewHeight] = useState(`${minHeightPx}px`);
    // Track the maximum height ever reached (only grows, never shrinks)
    const maxHeightRef = useRef(minHeightPx);
    // Reset max height when code changes (new iframe content)
    const resetMaxHeight = useCallback(() => {
        maxHeightRef.current = minHeightPx;
    }, [minHeightPx]);
    const calculatePreviewHeight = useCallback(() => {
        const iframe = iframeRef.current;
        let pHeight = minHeightPx;
        if (iframe) {
            try {
                const iframeDoc = iframe.contentDocument;
                if (iframeDoc) {
                    const calculatedHeight = Math.max(iframeDoc.body?.scrollHeight || 0, iframeDoc.body?.offsetHeight || 0, iframeDoc.documentElement?.clientHeight || 0, iframeDoc.documentElement?.scrollHeight || 0, iframeDoc.documentElement?.offsetHeight || 0);
                    pHeight = Math.max(pHeight, calculatedHeight);
                }
            }
            catch {
                // noop
            }
        }
        // Only grow, never shrink - update maxHeightRef if we have a larger height
        if (pHeight > maxHeightRef.current) {
            maxHeightRef.current = pHeight;
        }
        const finalPreviewHeight = Math.max(maxHeightRef.current, minHeightPx);
        const limitedPreviewHeight = Math.min(finalPreviewHeight, MAX_PREVIEW_HEIGHT);
        setPreviewHeight(limitedPreviewHeight + 'px');
    }, [iframeRef, minHeightPx]);
    const requestPreviewHeight = useCallback(() => {
        const iframe = iframeRef.current;
        if (!iframe?.contentWindow) {
            return;
        }
        try {
            iframe.contentWindow.postMessage({ type: 'codePreviewHeightRequest' }, '*');
        }
        catch {
            // noop
        }
    }, [iframeRef]);
    const updatePreviewHeight = useCallback(() => {
        if (!showPreview)
            return;
        setTimeout(() => {
            calculatePreviewHeight();
            requestPreviewHeight();
        }, 100);
    }, [showPreview, calculatePreviewHeight, requestPreviewHeight]);
    // Handle height change messages from iframe
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.source !== iframeRef.current?.contentWindow) {
                return;
            }
            if (event.data?.type === 'codePreviewHeightChange' && typeof event.data.height === 'number') {
                const newHeight = event.data.height;
                // Only grow, never shrink
                if (newHeight > maxHeightRef.current) {
                    maxHeightRef.current = newHeight;
                    const limitedHeight = Math.min(newHeight, MAX_PREVIEW_HEIGHT);
                    setPreviewHeight(limitedHeight + 'px');
                }
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [iframeRef]);
    // Initial load and resize
    useEffect(() => {
        if (!showPreview)
            return;
        const iframe = iframeRef.current;
        if (iframe) {
            const handleLoad = () => {
                updatePreviewHeight();
                setTimeout(updatePreviewHeight, 100);
                setTimeout(updatePreviewHeight, 500);
            };
            iframe.addEventListener('load', handleLoad);
            if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
                handleLoad();
            }
            return () => iframe.removeEventListener('load', handleLoad);
        }
    }, [showPreview, iframeRef, updatePreviewHeight]);
    // Code change - reset max height and recalculate
    useEffect(() => {
        if (showPreview) {
            resetMaxHeight();
            updatePreviewHeight();
        }
    }, [editors, minHeightPx, showPreview, resetMaxHeight, updatePreviewHeight]);
    // Window resize
    useEffect(() => {
        const handleResize = () => {
            updatePreviewHeight();
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [updatePreviewHeight]);
    return { previewHeight, updatePreviewHeight };
};

/** プログレスバーの更新間隔 (ms) */
const PROGRESS_UPDATE_INTERVAL_MS = 16;
/**
 * リセットボタンの長押し操作を管理するフック
 */
const useResetHandler = ({ onReset, longPressDuration = 500 }) => {
    const [resetProgress, setResetProgress] = useState(0);
    const resetTimerRef = useRef(null);
    const resetProgressIntervalRef = useRef(null);
    /**
     * タイマーとインターバルをクリアする
     */
    const clearTimers = useCallback(() => {
        if (resetTimerRef.current !== null) {
            window.clearTimeout(resetTimerRef.current);
            resetTimerRef.current = null;
        }
        if (resetProgressIntervalRef.current !== null) {
            window.clearInterval(resetProgressIntervalRef.current);
            resetProgressIntervalRef.current = null;
        }
    }, []);
    /**
     * マウスダウン時の処理
     * 長押しタイマーとプログレスバーのアニメーションを開始する
     */
    const handleResetMouseDown = useCallback(() => {
        const startTime = Date.now();
        setResetProgress(0);
        // プログレスバーの更新
        resetProgressIntervalRef.current = window.setInterval(() => {
            const elapsed = Date.now() - startTime;
            // 1を超えないように制限
            const progress = Math.min(elapsed / longPressDuration, 1);
            setResetProgress(progress);
        }, PROGRESS_UPDATE_INTERVAL_MS);
        // 長押し完了時の処理
        resetTimerRef.current = window.setTimeout(() => {
            setResetProgress(1);
            onReset();
            // 完了したらインターバルを止める
            if (resetProgressIntervalRef.current !== null) {
                window.clearInterval(resetProgressIntervalRef.current);
                resetProgressIntervalRef.current = null;
            }
        }, longPressDuration);
    }, [onReset, longPressDuration]);
    /**
     * マウスアップ時の処理
     * タイマーをキャンセルし、プログレスをリセットする
     */
    const handleResetMouseUp = useCallback(() => {
        clearTimers();
        setResetProgress(0);
    }, [clearTimers]);
    /**
     * マウスリーブ時の処理
     * マウスアップと同様にキャンセル扱いとする
     */
    const handleResetMouseLeave = useCallback(() => {
        clearTimers();
        setResetProgress(0);
    }, [clearTimers]);
    // コンポーネントのアンマウント時にタイマーをクリーンアップ
    useEffect(() => {
        return () => {
            clearTimers();
        };
    }, [clearTimers]);
    return {
        resetProgress,
        handleResetMouseDown,
        handleResetMouseUp,
        handleResetMouseLeave
    };
};

/**
 * iframeからのコンソールログを受信・管理するフック
 *
 * @param iframeRef 監視対象のiframeのRef
 * @param dependencies ログをクリアするトリガーとなる依存配列
 */
const useConsoleLogs = (iframeRef, dependencies = []) => {
    const [consoleLogs, setConsoleLogs] = useState([]);
    // 依存関係が変更されたらログをクリア（コード変更時など）
    useEffect(() => {
        setConsoleLogs([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);
    useEffect(() => {
        const handleMessage = (event) => {
            // 自身のiframeからのメッセージ以外は無視
            if (event.source !== iframeRef.current?.contentWindow)
                return;
            const data = event.data;
            if (!data || typeof data !== 'object')
                return;
            if (data.type === 'codePreviewConsoleLog' && Array.isArray(data.messages)) {
                setConsoleLogs(data.messages);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [iframeRef]);
    return {
        consoleLogs,
        setConsoleLogs
    };
};

/**
 * 各エディタのコードの末尾に改行がない場合、自動的に改行を追加するフック。
 * エディタのカーソル位置を保持しながら更新します。
 */
const useEnsureNewlines = ({ editors }) => {
    useEffect(() => {
        editors.forEach((editor) => {
            const { code, setCode, ref, visible } = editor;
            if (!visible)
                return;
            // codeがundefinedの場合は何もしない
            if (code && !code.endsWith('\n')) {
                // エディタがまだ準備できていない、または編集中（フォーカスがある）の場合は自動修正しない
                if (!ref.current || ref.current.hasTextFocus()) {
                    return;
                }
                const newValue = code + '\n';
                if (ref.current) {
                    const editorInstance = ref.current;
                    const model = editorInstance.getModel();
                    if (model) {
                        const lineCount = model.getLineCount();
                        const lastLineLength = model.getLineLength(lineCount);
                        // Undoスタックを保持するためにexecuteEditsを使用
                        editorInstance.executeEdits('ensureNewline', [
                            {
                                range: {
                                    startLineNumber: lineCount,
                                    startColumn: lastLineLength + 1,
                                    endLineNumber: lineCount,
                                    endColumn: lastLineLength + 1
                                },
                                text: '\n',
                                forceMoveMarkers: true
                            }
                        ]);
                        // 編集操作をプッシュ（これがないとUndoスタックに追加されない場合がある）
                        editorInstance.pushUndoStop();
                    }
                }
                // Reactの状態を更新（エディタの内容と一致させる）
                setCode(newValue);
            }
        });
    }, [editors]);
};

const useResizeTargets = ({ editors }) => {
    return useMemo(() => {
        return editors
            .filter((editor) => editor.visible)
            .map((editor) => ({
            key: editor.key,
            ref: editor.ref
        }));
    }, [editors]);
};

/** プレビューの高さ更新までの遅延時間 (ms) */
const PREVIEW_UPDATE_DELAY_MS = 100;
/**
 * コードプレビューのリセット処理を提供するフック
 */
const useCodePreviewReset = ({ resetCodes, clearConsoleLogs, remountIframe, updatePreviewHeight }) => {
    return useCallback(() => {
        // 編集したコードを初期状態に戻す
        resetCodes();
        // コンソールログをクリア
        clearConsoleLogs();
        // iframeを強制的に再マウント
        remountIframe();
        // プレビューを再レンダリング
        // iframeの再マウントとレンダリング完了を待つために遅延させる
        setTimeout(() => {
            updatePreviewHeight();
        }, PREVIEW_UPDATE_DELAY_MS);
    }, [resetCodes, clearConsoleLogs, remountIframe, updatePreviewHeight]);
};

/** レイアウト更新の遅延時間 (ms) */
const LAYOUT_UPDATE_DELAY_MS = 100;
/** コンテンツ変更時のレイアウト更新遅延時間 (ms) */
const CONTENT_CHANGE_LAYOUT_DELAY_MS = 50;
const useEditorMount = (updateSectionWidths) => {
    const createMountHandler = useCallback((ref) => {
        return (editorInstance) => {
            ref.current = editorInstance;
            // 初期表示時のレイアウト調整
            setTimeout(() => updateSectionWidths(), LAYOUT_UPDATE_DELAY_MS);
            // コンテンツ変更時にレイアウトを再計算
            editorInstance.onDidChangeModelContent(() => setTimeout(() => updateSectionWidths(), CONTENT_CHANGE_LAYOUT_DELAY_MS));
        };
    }, [updateSectionWidths]);
    return { createMountHandler };
};

/**
 * エディタの設定とイベントハンドラを管理するフック
 */
const useEditorConfigs = ({ editors, updateSectionWidths }) => {
    // 行番号表示の状態
    const [showLineNumbers, setShowLineNumbers] = useState(false);
    const toggleLineNumbers = useCallback(() => {
        setShowLineNumbers((prev) => !prev);
    }, []);
    // マウントハンドラの作成
    const { createMountHandler } = useEditorMount(updateSectionWidths);
    // 設定の生成
    const visibleEditorConfigs = useMemo(() => {
        return editors
            .filter((editor) => editor.visible)
            .map((editor) => ({
            key: editor.key,
            label: editor.label,
            language: editor.language,
            value: editor.code,
            onChange: (value) => editor.setCode(value || ''),
            onMount: createMountHandler(editor.ref),
            visible: true
        }));
    }, [editors, createMountHandler]);
    return {
        visibleEditorConfigs,
        showLineNumbers,
        toggleLineNumbers
    };
};

const useEditorDefinitions = ({ htmlCode, setHtmlCode, cssCode, setCssCode, jsCode, setJsCode, showHTMLEditor, showCSSEditor, showJSEditor, htmlEditorRef, cssEditorRef, jsEditorRef }) => {
    return useMemo(() => [
        {
            key: 'html',
            label: 'HTML',
            language: 'html',
            code: htmlCode,
            setCode: setHtmlCode,
            visible: showHTMLEditor,
            ref: htmlEditorRef
        },
        {
            key: 'css',
            label: 'CSS',
            language: 'css',
            code: cssCode,
            setCode: setCssCode,
            visible: showCSSEditor,
            ref: cssEditorRef
        },
        {
            key: 'js',
            label: 'JavaScript',
            language: 'javascript',
            code: jsCode,
            setCode: setJsCode,
            visible: showJSEditor,
            ref: jsEditorRef
        }
    ], [
        htmlCode,
        cssCode,
        jsCode,
        setHtmlCode,
        setCssCode,
        setJsCode,
        showHTMLEditor,
        showCSSEditor,
        showJSEditor,
        htmlEditorRef,
        cssEditorRef,
        jsEditorRef
    ]);
};

/**
 * CodePreviewに関連する表示ロジックのユーティリティ
 */
/**
 * プロパティによる表示指定と自動判定を解決して最終的な表示状態を決定する
 *
 * @param autoVisible - 自動判定による表示状態 (例: コードが存在するかどうか)
 * @param override - プロパティによる強制表示指定 (booleanの場合)
 * @returns 最終的な表示状態
 */
const resolveVisibility = (autoVisible, override) => {
    if (typeof override === 'boolean') {
        return override;
    }
    return autoVisible;
};

const DEFAULT_MIN_HEIGHT_PX = 200;
const isPositiveNumber = (value) => Number.isFinite(value) && value > 0;
const parseMinHeightPx = (value) => {
    if (typeof value === 'number') {
        return isPositiveNumber(value) ? value : null;
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        const pxMatch = trimmed.match(/^(\d+(?:\.\d+)?)px$/i);
        if (pxMatch) {
            const parsed = Number(pxMatch[1]);
            return isPositiveNumber(parsed) ? parsed : null;
        }
        const asNumber = Number(trimmed);
        return isPositiveNumber(asNumber) ? asNumber : null;
    }
    return null;
};
const normalizeMinHeight = (value, fallbackPx = DEFAULT_MIN_HEIGHT_PX) => {
    const parsed = parseMinHeightPx(value);
    const resolvedPx = parsed ?? fallbackPx;
    if (parsed === null && value !== undefined) {
        console.error(`[CodePreview] Invalid minHeight "${String(value)}". ` + 'Use a positive number (px) or a "NNpx" string.');
    }
    return {
        px: resolvedPx,
        css: `${resolvedPx}px`
    };
};

const useCodePreview = (props) => {
    const { initialHTML, initialCSS, initialJS, minHeight, theme = 'light', htmlVisible, cssVisible, jsVisible, previewVisible, consoleVisible, sourceId, share, htmlPath, cssPath, jsPath, images, fileStructureVisible } = props;
    // Refs
    const iframeRef = useRef(null);
    const containerRef = useRef(null);
    const editorsRowRef = useRef(null);
    const htmlEditorRef = useRef(null);
    const cssEditorRef = useRef(null);
    const jsEditorRef = useRef(null);
    // Store
    const { htmlCode, setHtmlCode, cssCode, setCssCode, jsCode, setJsCode, resolvedHTML, resolvedCSS, resolvedJS, resolvedImages, resolvedHtmlPath: resolvedHtmlPathRaw, resolvedCssPath, resolvedJsPath, resetCodes } = useSourceCodeStore({
        sourceId,
        share,
        initialHTML,
        initialCSS,
        initialJS,
        images,
        htmlPath,
        cssPath,
        jsPath
    });
    const resolvedHtmlPath = resolvedHtmlPathRaw ?? 'index.html';
    const hasFileStructureInputs = !!((resolvedImages && Object.keys(resolvedImages).length > 0) ||
        resolvedHtmlPathRaw !== undefined ||
        resolvedCssPath !== undefined ||
        resolvedJsPath !== undefined);
    // State for manual toggle
    const [isToggledManually, setIsToggledManually] = useState(false);
    const [manualShowValue, setManualShowValue] = useState(false);
    const [lastFileStructureVisible, setLastFileStructureVisible] = useState(fileStructureVisible);
    // Sync manual toggle when fileStructureVisible prop changes
    if (fileStructureVisible !== lastFileStructureVisible) {
        setLastFileStructureVisible(fileStructureVisible);
        setIsToggledManually(false);
    }
    const showFileStructure = useMemo(() => {
        if (isToggledManually)
            return manualShowValue;
        if (fileStructureVisible !== undefined)
            return !!fileStructureVisible;
        return hasFileStructureInputs;
    }, [isToggledManually, manualShowValue, fileStructureVisible, hasFileStructureInputs]);
    const [iframeKey, setIframeKey] = useState(0);
    const rawIframeId = useId();
    const iframeId = useMemo(() => `iframe-${rawIframeId.replace(/:/g, '')}`, [rawIframeId]);
    const { consoleLogs, setConsoleLogs } = useConsoleLogs(iframeRef, [jsCode, htmlCode]);
    const showHTMLEditor = resolveVisibility(resolvedHTML !== undefined, htmlVisible);
    const showCSSEditor = resolveVisibility(resolvedCSS !== undefined, cssVisible);
    const showJSEditor = resolveVisibility(resolvedJS !== undefined, jsVisible);
    const hasPreviewContent = resolvedHTML !== undefined || showHTMLEditor;
    const showPreview = resolveVisibility(hasPreviewContent, previewVisible);
    const showConsole = resolveVisibility(consoleLogs.length > 0, consoleVisible);
    // Editors Definition
    const editors = useEditorDefinitions({
        htmlCode,
        setHtmlCode,
        cssCode,
        setCssCode,
        jsCode,
        setJsCode,
        showHTMLEditor,
        showCSSEditor,
        showJSEditor,
        htmlEditorRef,
        cssEditorRef,
        jsEditorRef
    });
    const minHeightConfig = normalizeMinHeight(minHeight);
    // Hooks
    const { editorHeight } = useEditorHeight({
        minHeightPx: minHeightConfig.px,
        editors
    });
    const { previewHeight, updatePreviewHeight } = usePreviewHeight({
        minHeightPx: minHeightConfig.px,
        showPreview,
        iframeRef,
        editors
    });
    const resizeTargets = useResizeTargets({ editors });
    const { sectionWidths, isResizing, handleMouseDown, handleResizerKeyDown, updateSectionWidths, resetSectionWidthsToAuto } = useEditorResize({
        resizeTargets,
        containerRef
    });
    const { visibleEditorConfigs, showLineNumbers, toggleLineNumbers } = useEditorConfigs({
        editors,
        updateSectionWidths
    });
    const toggleFileStructure = useCallback(() => {
        setIsToggledManually(true);
        setManualShowValue(!showFileStructure);
    }, [showFileStructure]);
    const clearConsoleLogs = useCallback(() => {
        setConsoleLogs([]);
    }, [setConsoleLogs]);
    const remountIframe = useCallback(() => {
        setIframeKey((prev) => prev + 1);
    }, []);
    // リセット関数
    const handleReset = useCodePreviewReset({
        resetCodes,
        clearConsoleLogs,
        remountIframe,
        updatePreviewHeight
    });
    const { resetProgress, handleResetMouseDown, handleResetMouseUp, handleResetMouseLeave } = useResetHandler({
        onReset: handleReset
    });
    // 末尾改行保証
    useEnsureNewlines({ editors });
    const editorTheme = theme === 'dark' ? 'vs-dark' : 'light';
    return {
        elementRefs: {
            iframeRef,
            containerRef,
            editorsRowRef,
            htmlEditorRef,
            cssEditorRef,
            jsEditorRef
        },
        state: {
            htmlCode,
            cssCode,
            jsCode,
            resolvedImages,
            resolvedHtmlPath,
            resolvedCssPath,
            resolvedJsPath,
            consoleLogs,
            showFileStructure,
            iframeKey,
            iframeId,
            editorTheme
        },
        visibility: {
            showHTMLEditor,
            showCSSEditor,
            showJSEditor,
            showPreview,
            showConsole
        },
        layout: {
            editorHeight,
            previewHeight,
            sectionWidths,
            isResizing,
            visibleEditorConfigs,
            showLineNumbers,
            minHeightCss: minHeightConfig.css
        },
        handlers: {
            handleMouseDown,
            handleResizerKeyDown,
            resetSectionWidthsToAuto,
            toggleLineNumbers,
            toggleFileStructure,
            handleResetMouseDown,
            handleResetMouseUp,
            handleResetMouseLeave,
            resetProgress
        }
    };
};

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = ".styles-module__resetProgressCircle__ephif {\r\n    position: relative;\r\n    display: flex;\r\n    align-items: center;\r\n    justify-content: center;\r\n    width: 24px;\r\n    height: 24px;\r\n    transition:\r\n        filter 0.2s,\r\n        transform 0.2s;\r\n}\r\n\r\n.styles-module__resetProgressCircle__ephif svg {\r\n    width: 24px;\r\n    height: 24px;\r\n    pointer-events: none;\r\n    display: block;\r\n}\r\n\r\n/* ライブラリ版の同スタイル */\r\n.styles-module__codePreviewContainer__wRIyG {\r\n    --cp-border: #7f92a8;\r\n    border: 1px solid var(--cp-border);\r\n    border-radius: 6px;\r\n    margin: 1.5rem 0;\r\n    background: #fff;\r\n    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);\r\n    overflow: hidden;\r\n}\r\n\r\n.styles-module__header__I28Qn {\r\n    padding: 0.75rem 1rem;\r\n    background: #f6f8fa;\r\n    border-bottom: 1px solid var(--cp-border);\r\n}\r\n\r\n.styles-module__title__O1f0v {\r\n    margin: 0;\r\n    font-size: 0.9rem;\r\n    font-weight: 600;\r\n    color: #57606a;\r\n    display: flex;\r\n    align-items: center;\r\n}\r\n\r\n.styles-module__editorsRow__1QYNs {\r\n    position: relative;\r\n    display: flex;\r\n    border-bottom: 1px solid var(--cp-border);\r\n}\r\n\r\n.styles-module__gyoButton__NA4FW {\r\n    position: absolute;\r\n    top: 8px;\r\n    background: rgba(255, 255, 255, 0.9);\r\n    border: 1px solid var(--cp-border);\r\n    border-radius: 50%;\r\n    width: 24px;\r\n    height: 24px;\r\n    font-size: 0.8rem;\r\n    color: #57606a;\r\n    cursor: pointer;\r\n    display: inline-flex;\r\n    align-items: center;\r\n    justify-content: center;\r\n    transition:\r\n        background 0.2s ease,\r\n        color 0.2s ease,\r\n        border-color 0.2s ease;\r\n    padding: 0;\r\n    z-index: 2;\r\n}\r\n\r\n.styles-module__gyoButton__NA4FW:nth-of-type(1) {\r\n    right: 8px;\r\n}\r\n\r\n.styles-module__gyoButton__NA4FW:nth-of-type(2) {\r\n    right: 40px;\r\n}\r\n\r\n.styles-module__gyoButton__NA4FW:nth-of-type(3) {\r\n    right: 72px;\r\n}\r\n\r\n.styles-module__gyoButton__NA4FW:hover,\r\n.styles-module__gyoButton__NA4FW:focus {\r\n    background: #e9edf2;\r\n    color: #24292f;\r\n}\r\n\r\n.styles-module__hiddenText__G31SG {\r\n    position: absolute;\r\n    width: 1px;\r\n    height: 1px;\r\n    padding: 0;\r\n    margin: -1px;\r\n    overflow: hidden;\r\n    clip: rect(0, 0, 0, 0);\r\n    white-space: nowrap;\r\n    border: 0;\r\n}\r\n\r\n.styles-module__title__O1f0v::before {\r\n    content: '🔍';\r\n    margin-right: 0.5rem;\r\n    font-size: 1em;\r\n}\r\n\r\n.styles-module__splitLayout__RxgAU {\r\n    display: flex;\r\n    flex-direction: column;\r\n    height: auto;\r\n}\r\n\r\n.styles-module__editorSection__3EN6- {\r\n    flex: 0 0 auto;\r\n    display: flex;\r\n    flex-direction: column;\r\n    min-width: 200px;\r\n    overflow: hidden;\r\n    height: 100%;\r\n    flex-shrink: 0;\r\n}\r\n\r\n.styles-module__resizer__2nLNU {\r\n    position: relative;\r\n    flex: 0 0 auto;\r\n    width: 12px;\r\n    cursor: col-resize;\r\n    display: flex;\r\n    align-items: center;\r\n    justify-content: center;\r\n    -webkit-user-select: none;\r\n       -moz-user-select: none;\r\n            user-select: none;\r\n    background: rgba(246, 248, 250, 0.7);\r\n    transition: background 0.2s ease;\r\n    touch-action: none;\r\n}\r\n\r\n.styles-module__resizer__2nLNU::before {\r\n    content: '';\r\n    position: absolute;\r\n    top: 0;\r\n    bottom: 0;\r\n    left: 50%;\r\n    width: 1px;\r\n    background: var(--cp-border);\r\n    transform: translateX(-50%);\r\n}\r\n\r\n.styles-module__resizer__2nLNU:hover,\r\n.styles-module__resizer__2nLNU:focus-visible {\r\n    background: rgba(215, 222, 230, 0.8);\r\n}\r\n\r\n.styles-module__resizer__2nLNU:focus-visible {\r\n    outline: 2px solid #0969da;\r\n    outline-offset: 2px;\r\n}\r\n\r\n.styles-module__resizerGrip__WxNf9 {\r\n    width: 3px;\r\n    height: 36px;\r\n    border-radius: 999px;\r\n    background: #afb8c1;\r\n    position: relative;\r\n    z-index: 1;\r\n}\r\n\r\n.styles-module__resizer__2nLNU:hover .styles-module__resizerGrip__WxNf9,\r\n.styles-module__resizer__2nLNU:focus-visible .styles-module__resizerGrip__WxNf9 {\r\n    background: #57606a;\r\n}\r\n\r\n.styles-module__isResizing__beMqt {\r\n    cursor: col-resize;\r\n}\r\n\r\n.styles-module__previewSection__21FTK {\r\n    flex: 1;\r\n    display: flex;\r\n    flex-direction: column;\r\n    min-width: 100%;\r\n    height: 100%;\r\n}\r\n\r\n.styles-module__consoleSection__zwLDJ {\r\n    flex: 0 0 auto;\r\n    display: flex;\r\n    flex-direction: column;\r\n    min-width: 100%;\r\n    border-top: 1px solid var(--cp-border);\r\n}\r\n\r\n.styles-module__sectionHeader__zRs7p {\r\n    padding: 0.5rem 1rem;\r\n    background: #f6f8fa;\r\n    border-bottom: 1px solid var(--cp-border);\r\n    font-size: 0.8rem;\r\n    font-weight: 600;\r\n    color: #57606a;\r\n    text-transform: none;\r\n    letter-spacing: 0.5px;\r\n    flex-shrink: 0;\r\n}\r\n\r\n.styles-module__editorContainer__aQku5 {\r\n    position: relative;\r\n    display: flex;\r\n    flex-direction: column;\r\n    flex: 1;\r\n    overflow: hidden;\r\n}\r\n\r\n.styles-module__previewContainer__I-vCy {\r\n    position: relative;\r\n    background: white;\r\n    padding: 0;\r\n    overflow: hidden;\r\n    flex: 1;\r\n    height: -moz-fit-content;\r\n    height: fit-content;\r\n}\r\n\r\n.styles-module__preview__c5c5u {\r\n    width: 100%;\r\n    min-height: var(--min-height, 200px);\r\n    border: none;\r\n    background: white;\r\n    display: block;\r\n    overflow: hidden;\r\n}\r\n\r\n.styles-module__consoleContainer__seP5q {\r\n    background: #0d1117;\r\n    color: #f0f6fc;\r\n    font-family: monospace;\r\n    padding: 0.75rem 1rem;\r\n    min-height: 80px;\r\n    display: flex;\r\n    flex-direction: column;\r\n    gap: 0.5rem;\r\n    overflow-x: auto;\r\n}\r\n\r\n.styles-module__consoleLine__xZ1IR {\r\n    display: flex;\r\n    align-items: flex-start;\r\n    gap: 0.5rem;\r\n    font-size: 0.85rem;\r\n    line-height: 1.5;\r\n    word-break: break-word;\r\n}\r\n\r\n.styles-module__consoleBullet__mrs6i {\r\n    color: #58a6ff;\r\n    flex: 0 0 auto;\r\n    font-size: 0.8rem;\r\n    margin-top: 0.2rem;\r\n}\r\n\r\n.styles-module__consolePlaceholder__RJDRU {\r\n    font-size: 0.8rem;\r\n    color: rgba(240, 246, 252, 0.65);\r\n}\r\n\r\n@media (max-width: 768px) {\r\n    .styles-module__splitLayout__RxgAU {\r\n        flex-direction: column;\r\n        height: auto;\r\n    }\r\n\r\n    .styles-module__editorsRow__1QYNs {\r\n        flex-direction: column;\r\n    }\r\n\r\n    .styles-module__editorSection__3EN6- {\r\n        border-right: none;\r\n        border-bottom: 1px solid var(--cp-border);\r\n        height: auto;\r\n        width: 100% !important;\r\n        flex-shrink: 1;\r\n    }\r\n\r\n    .styles-module__editorSection__3EN6-:last-child {\r\n        border-bottom: none;\r\n    }\r\n\r\n    .styles-module__previewSection__21FTK {\r\n        height: auto;\r\n        border-top: 1px solid var(--cp-border);\r\n    }\r\n\r\n    .styles-module__resizer__2nLNU {\r\n        display: none;\r\n    }\r\n}\r\n\r\n/* ファイル構造表示 */\r\n.styles-module__fileStructure__UZ6sK {\r\n    background: #f6f8fa;\r\n    border-bottom: 1px solid var(--cp-border);\r\n    padding: 12px 16px;\r\n    font-size: 0.85rem;\r\n    color: #24292f;\r\n}\r\n\r\n.styles-module__fileStructureTitle__X1XCH {\r\n    font-weight: 600;\r\n    margin-bottom: 8px;\r\n    padding-bottom: 6px;\r\n    border-bottom: 1px solid var(--cp-border);\r\n    color: #57606a;\r\n}\r\n\r\n.styles-module__fileTree__QiMGy {\r\n    display: flex;\r\n    flex-direction: column;\r\n    gap: 4px;\r\n}\r\n\r\n.styles-module__fileTreeItem__fkUfV {\r\n    display: flex;\r\n    align-items: center;\r\n    gap: 6px;\r\n    padding: 2px 0;\r\n    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;\r\n}\r\n\r\n.styles-module__fileTreeSubItem__lltX- {\r\n    display: flex;\r\n    align-items: center;\r\n    gap: 6px;\r\n    padding: 2px 0 2px 20px;\r\n    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;\r\n}\r\n\r\n.styles-module__fileTreeFolder__7DC0i {\r\n    display: flex;\r\n    flex-direction: column;\r\n}\r\n\r\n.styles-module__fileIcon__CtHqi {\r\n    font-size: 0.9em;\r\n}\r\n\r\n.styles-module__folderIcon__HqJoN {\r\n    font-size: 0.9em;\r\n}\r\n";
var styles = {"resetProgressCircle":"styles-module__resetProgressCircle__ephif","codePreviewContainer":"styles-module__codePreviewContainer__wRIyG","header":"styles-module__header__I28Qn","title":"styles-module__title__O1f0v","editorsRow":"styles-module__editorsRow__1QYNs","gyoButton":"styles-module__gyoButton__NA4FW","hiddenText":"styles-module__hiddenText__G31SG","splitLayout":"styles-module__splitLayout__RxgAU","editorSection":"styles-module__editorSection__3EN6-","resizer":"styles-module__resizer__2nLNU","resizerGrip":"styles-module__resizerGrip__WxNf9","isResizing":"styles-module__isResizing__beMqt","previewSection":"styles-module__previewSection__21FTK","consoleSection":"styles-module__consoleSection__zwLDJ","sectionHeader":"styles-module__sectionHeader__zRs7p","editorContainer":"styles-module__editorContainer__aQku5","previewContainer":"styles-module__previewContainer__I-vCy","preview":"styles-module__preview__c5c5u","consoleContainer":"styles-module__consoleContainer__seP5q","consoleLine":"styles-module__consoleLine__xZ1IR","consoleBullet":"styles-module__consoleBullet__mrs6i","consolePlaceholder":"styles-module__consolePlaceholder__RJDRU","fileStructure":"styles-module__fileStructure__UZ6sK","fileStructureTitle":"styles-module__fileStructureTitle__X1XCH","fileTree":"styles-module__fileTree__QiMGy","fileTreeItem":"styles-module__fileTreeItem__fkUfV","fileTreeSubItem":"styles-module__fileTreeSubItem__lltX-","fileTreeFolder":"styles-module__fileTreeFolder__7DC0i","fileIcon":"styles-module__fileIcon__CtHqi","folderIcon":"styles-module__folderIcon__HqJoN"};
styleInject(css_248z);

const buildFileStructure = (resolvedHtmlPath, resolvedCssPath, resolvedJsPath, resolvedImages) => {
    const folders = new Map();
    const rootFiles = [];
    const files = [{ path: resolvedHtmlPath }, { path: resolvedCssPath }, { path: resolvedJsPath }];
    // imagesで指定された画像パスも追加
    if (resolvedImages) {
        Object.keys(resolvedImages).forEach((imgPath) => {
            files.push({ path: imgPath });
        });
    }
    files.forEach(({ path }) => {
        if (!path)
            return;
        const normalizedPath = path.replace(/\\/g, '/');
        const parts = normalizedPath.split('/');
        if (parts.length === 1) {
            // ルートファイル
            if (!rootFiles.includes(normalizedPath))
                rootFiles.push(normalizedPath);
        }
        else {
            // フォルダ内のファイル
            const folderPath = parts.slice(0, -1).join('/');
            const fileName = parts[parts.length - 1];
            if (!folders.has(folderPath)) {
                folders.set(folderPath, []);
            }
            if (!folders.get(folderPath).includes(fileName)) {
                folders.get(folderPath).push(fileName);
            }
        }
    });
    return { folders, rootFiles };
};

const FileStructurePanel = ({ resolvedHtmlPath, resolvedCssPath, resolvedJsPath, resolvedImages }) => {
    const { folders, rootFiles } = useMemo(() => buildFileStructure(resolvedHtmlPath, resolvedCssPath, resolvedJsPath, resolvedImages), [resolvedHtmlPath, resolvedCssPath, resolvedJsPath, resolvedImages]);
    return (jsxs("div", { className: styles.fileStructure, children: [jsx("div", { className: styles.fileStructureTitle, children: "\uD83D\uDCC1 \u30D5\u30A1\u30A4\u30EB\u69CB\u9020" }), jsxs("div", { className: styles.fileTree, children: [rootFiles.map((file) => (jsxs("div", { className: styles.fileTreeItem, children: [jsx("span", { className: styles.fileIcon, children: "\uD83D\uDCC4" }), " ", file] }, file))), Array.from(folders.entries()).map(([folderPath, files]) => (jsxs("div", { className: styles.fileTreeFolder, children: [jsxs("div", { className: styles.fileTreeItem, children: [jsx("span", { className: styles.folderIcon, children: "\uD83D\uDCC1" }), " ", folderPath] }), files.map((file) => (jsxs("div", { className: styles.fileTreeSubItem, children: [jsx("span", { className: styles.fileIcon, children: "\uD83D\uDCC4" }), " ", file] }, `${folderPath}/${file}`)))] }, folderPath)))] })] }));
};

const ConsolePanel = ({ logs }) => {
    return (jsxs("div", { className: styles.consoleSection, children: [jsx("div", { className: styles.sectionHeader, children: "\u30B3\u30F3\u30BD\u30FC\u30EB" }), jsx("div", { className: styles.consoleContainer, children: logs.length === 0 ? (jsx("div", { className: styles.consolePlaceholder, children: "\u3053\u3053\u306B console.log \u306E\u7D50\u679C\u304C\u8868\u793A\u3055\u308C\u307E\u3059" })) : (logs.map((log, index) => (jsxs("div", { className: styles.consoleLine, children: [jsx("span", { className: styles.consoleBullet, children: "\u25B6" }), jsx("span", { children: log })] }, index)))) })] }));
};

const ResetButton = ({ resetProgress, onMouseDown, onMouseUp, onMouseLeave }) => {
    return (jsxs("button", { type: "button", className: styles.gyoButton, onMouseDown: onMouseDown, onMouseUp: onMouseUp, onMouseLeave: onMouseLeave, onTouchStart: onMouseDown, onTouchEnd: onMouseUp, title: "\u9577\u62BC\u3057\u3067\u30EA\u30BB\u30C3\u30C8", children: [jsx("span", { className: styles.resetProgressCircle + (resetProgress > 0 ? ' ' + styles.isCharging : ''), "aria-hidden": "true", children: jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", children: [resetProgress > 0 && (jsx("circle", { cx: "12", cy: "12", r: "10", fill: "none", stroke: "#218bff", strokeWidth: "2.2", strokeLinecap: "round", strokeDasharray: 2 * Math.PI * 10, strokeDashoffset: (1 - resetProgress) * 2 * Math.PI * 10, style: { transition: 'stroke-dashoffset 0.05s linear' } })), jsxs("g", { children: [jsx("path", { d: "M12 5a7 7 0 1 1-5.3 2.7", fill: "none", stroke: "#218bff", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" }), jsx("polyline", { points: "6.5,7.5 6.5,4.5 9.5,4.5", fill: "none", stroke: "#218bff", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" })] })] }) }), jsx("span", { className: styles.hiddenText, children: "\u9577\u62BC\u3057\u3067\u30EA\u30BB\u30C3\u30C8" })] }));
};

const ToolbarButton = ({ onClick, pressed, label, icon }) => {
    return (jsxs("button", { type: "button", className: styles.gyoButton, onClick: onClick, "aria-pressed": pressed, title: label, children: [jsx("span", { "aria-hidden": "true", children: icon }), jsx("span", { className: styles.hiddenText, children: label })] }));
};

const Toolbar = ({ resetProgress, showLineNumbers, showFileStructure, onResetMouseDown, onResetMouseUp, onResetMouseLeave, onToggleLineNumbers, onToggleFileStructure }) => {
    return (jsxs(Fragment, { children: [jsx(ResetButton, { resetProgress: resetProgress, onMouseDown: onResetMouseDown, onMouseUp: onResetMouseUp, onMouseLeave: onResetMouseLeave }), jsx(ToolbarButton, { onClick: onToggleLineNumbers, pressed: showLineNumbers, label: showLineNumbers ? '行番号を隠す' : '行番号を表示', icon: "#" }), jsx(ToolbarButton, { onClick: onToggleFileStructure, pressed: showFileStructure, label: showFileStructure ? 'ファイル構造を隠す' : 'ファイル構造を表示', icon: "\uD83D\uDCC1" })] }));
};

const DEFAULT_EDITOR_OPTIONS = {
    minimap: { enabled: false },
    fontSize: 14,
    folding: false,
    padding: { top: 5, bottom: 5 },
    roundedSelection: false,
    wordWrap: 'off',
    tabSize: 2,
    insertSpaces: true,
    scrollBeyondLastLine: false
};
const EditorPanel = ({ config, width, height, theme, showLineNumbers }) => {
    const mergedOptions = useMemo(() => ({
        ...DEFAULT_EDITOR_OPTIONS,
        lineNumbers: showLineNumbers ? 'on' : 'off'
    }), [showLineNumbers]);
    return (jsxs("div", { className: styles.editorSection, style: { width: `${width}%` }, children: [jsx("div", { className: styles.sectionHeader, children: config.label }), jsx("div", { className: styles.editorContainer, children: jsx(Editor, { height: height, defaultLanguage: config.language, value: config.value, onChange: config.onChange, onMount: config.onMount, theme: theme, options: mergedOptions }) })] }));
};

const Resizer = ({ leftKey, rightKey, leftLabel, rightLabel, onMouseDown, onKeyDown, onDoubleClick }) => {
    return (jsx("div", { className: styles.resizer, role: "separator", "aria-orientation": "vertical", "aria-label": `${leftLabel} と ${rightLabel} の幅を調整`, tabIndex: 0, onMouseDown: (event) => onMouseDown(event, leftKey, rightKey), onKeyDown: (event) => onKeyDown(event, leftKey, rightKey), onDoubleClick: onDoubleClick, children: jsx("span", { className: styles.resizerGrip }) }));
};

const EditorSection = ({ layout, state, handlers, editorsRowRef, editorsRowStyle }) => {
    const editorsRowClassName = layout.isResizing ? `${styles.editorsRow} ${styles.isResizing}` : styles.editorsRow;
    return (jsxs("div", { className: editorsRowClassName, style: editorsRowStyle, ref: editorsRowRef, children: [jsx(Toolbar, { resetProgress: handlers.resetProgress, showLineNumbers: layout.showLineNumbers, showFileStructure: state.showFileStructure, onResetMouseDown: handlers.handleResetMouseDown, onResetMouseUp: handlers.handleResetMouseUp, onResetMouseLeave: handlers.handleResetMouseLeave, onToggleLineNumbers: handlers.toggleLineNumbers, onToggleFileStructure: handlers.toggleFileStructure }), layout.visibleEditorConfigs.map((config, index) => {
                const nextConfig = layout.visibleEditorConfigs[index + 1];
                return (jsxs(Fragment$1, { children: [jsx(EditorPanel, { config: config, width: layout.sectionWidths[config.key], height: layout.editorHeight, theme: state.editorTheme, showLineNumbers: layout.showLineNumbers }), nextConfig ? (jsx(Resizer, { leftKey: config.key, rightKey: nextConfig.key, leftLabel: config.label, rightLabel: nextConfig.label, onMouseDown: handlers.handleMouseDown, onKeyDown: handlers.handleResizerKeyDown, onDoubleClick: (event) => {
                                event.preventDefault();
                                handlers.resetSectionWidthsToAuto();
                            } })) : null] }, config.key));
            })] }));
};

const CONSOLE_INTERCEPT_SCRIPT = `
(function () {
if (!window.parent) return;
const logs = [];
const MAX_HTML_LENGTH = 300;
const INTERNAL_SCRIPT_SELECTOR = 'script[data-code-preview-internal]';

const currentScript = document.currentScript;

const removeInternalScripts = root => {
    if (!root || typeof root.querySelectorAll !== 'function') return;
    try {
        const scripts = root.querySelectorAll(INTERNAL_SCRIPT_SELECTOR);
        for (let index = 0; index < scripts.length; index++) {
            const script = scripts[index];
            if (!script || script === currentScript) continue;
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        }
    } catch (error) {
        // noop
    }
};

const removeCurrentScript = () => {
    if (currentScript && currentScript.parentNode) {
        currentScript.parentNode.removeChild(currentScript);
    }
};

removeInternalScripts(document);
removeCurrentScript();

const postLogs = () => {
    try {
        window.parent.postMessage({ type: 'codePreviewConsoleLog', messages: logs.slice() }, '*');
    } catch (error) {
        // noop
    }
};

const extractStackLocation = stack => {
    if (!stack) return '';
    try {
        const text = String(stack);
        const jsMatch = text.match(/(code-preview-js\\.js:\\d+:\\d+)/);
        if (jsMatch && jsMatch[1]) return ' (' + jsMatch[1] + ')';
        const htmlMatch = text.match(/(about:srcdoc:\\d+:\\d+)/);
        if (htmlMatch && htmlMatch[1]) return ' (' + htmlMatch[1] + ')';
    } catch (error) {
        // noop
    }
    return '';
};

const truncate = text => {
    if (typeof text !== 'string') return text;
    if (text.length <= MAX_HTML_LENGTH) return text;
    return text.slice(0, MAX_HTML_LENGTH) + '…';
};

const describeElement = element => {
    try {
        const tag = element.tagName ? element.tagName.toLowerCase() : 'element';
        const id = element.id ? '#' + element.id : '';
        let classInfo = '';
        if (element.className && typeof element.className === 'string' && element.className.trim()) {
            classInfo = '.' + element.className.trim().split(/\\s+/).join('.');
        }
        const summary = '<' + tag + id + classInfo + '>';
        const outer = element.outerHTML;
        if (outer) return truncate(outer);
        return summary;
    } catch (error) {
        return '<要素>';
    }
};

const describeNode = node => {
    if (node === null) return 'null';
    if (node === undefined) return 'undefined';

    if (typeof Node !== 'undefined' && node instanceof Node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const textContent = node.textContent || '';
            return 'テキスト("' + truncate(textContent.trim()) + '")';
        }

        if (node.nodeType === Node.COMMENT_NODE) {
            return '<!-- ' + truncate(node.textContent || '') + ' -->';
        }

        if (typeof Element !== 'undefined' && node instanceof Element) {
            return describeElement(node);
        }

        if (typeof Document !== 'undefined' && node instanceof Document) {
            const html = node.documentElement ? node.documentElement.outerHTML || '' : '';
            return html ? truncate(html) : 'ドキュメント';
        }

        if (typeof DocumentFragment !== 'undefined' && node instanceof DocumentFragment) {
            return 'ドキュメントフラグメント';
        }
    }

    return String(node);
};

const describeCollection = collection => {
    try {
        const arr = Array.from(collection);
        const items = arr.map(item => describeNode(item)).join(', ');
        return '[' + items + ']';
    } catch (error) {
        return String(collection);
    }
};

const formatValue = val => {
    if (val === null) return 'null';
    if (val === undefined) return 'undefined';
    if (typeof val === 'string') return '"' + truncate(val) + '"';
    if (typeof val === 'number') return String(val);
    if (typeof val === 'boolean') return String(val);
    if (typeof val === 'function') return '関数';
    if (Array.isArray(val)) {
        return '[' + val.map(formatValue).join(', ') + ']';
    }
    if (typeof NodeList !== 'undefined' && val instanceof NodeList) return describeCollection(val);
    if (typeof HTMLCollection !== 'undefined' && val instanceof HTMLCollection) return describeCollection(val);
    if (typeof Node !== 'undefined' && val instanceof Node) return describeNode(val);
    
    if (typeof val === 'object') {
        try {
            const keys = Object.keys(val);
            const props = keys.map(k => k + ': ' + formatValue(val[k])).join(', ');
            return '{' + props + '}';
        } catch (e) {
            return String(val);
        }
    }
    return String(val);
};

const originalLog = console.log;
console.log = function (...args) {
    logs.push(args.map(formatValue).join(' '));
    postLogs();
    originalLog.apply(console, args);
};

const originalError = console.error;
console.error = function (...args) {
    logs.push('[エラー] ' + args.map(formatValue).join(' '));
    postLogs();
    originalError.apply(console, args);
};

window.onerror = function (msg, url, line, col, error) {
    logs.push('[エラー] ' + msg + (line ? ' (' + line + '行目)' : ''));
    postLogs();
};
})();
`;
// Script to observe height changes in iframe content and notify parent
// __IFRAME_ID__ will be replaced with actual iframe ID
const HEIGHT_OBSERVER_SCRIPT = `
(function () {
if (!window.parent) return;

const iframeId = '__IFRAME_ID__';
let lastReportedHeight = 0;

// Calculate the maximum height considering all elements including fixed/absolute positioned ones
const getMaxElementHeight = () => {
    let maxHeight = 0;
    
    // Get all elements in the document
    const allElements = document.querySelectorAll('*');
    
    for (let i = 0; i < allElements.length; i++) {
        const el = allElements[i];
        
        // Skip script and style elements
        if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'LINK') continue;
        
        // Skip hidden elements
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        
        const rect = el.getBoundingClientRect();
        
        // For fixed/absolute elements, use their bottom position
        if (style.position === 'fixed' || style.position === 'absolute') {
            // For fixed elements, rect.bottom is relative to viewport
            // For absolute elements within scrolled containers, we need rect.bottom + scroll
            const bottomPos = rect.bottom + window.scrollY;
            if (bottomPos > maxHeight) {
                maxHeight = bottomPos;
            }
        } else {
            // For normal flow elements
            const bottomPos = rect.bottom + window.scrollY;
            if (bottomPos > maxHeight) {
                maxHeight = bottomPos;
            }
        }
    }
    
    return maxHeight;
};

const getDocumentHeight = () => {
    // Get standard document height measures
    const standardHeight = Math.max(
        document.body ? document.body.scrollHeight : 0,
        document.body ? document.body.offsetHeight : 0,
        document.documentElement ? document.documentElement.clientHeight : 0,
        document.documentElement ? document.documentElement.scrollHeight : 0,
        document.documentElement ? document.documentElement.offsetHeight : 0
    );
    
    // Also check all elements for fixed/absolute positioned content
    const elementHeight = getMaxElementHeight();
    
    return Math.max(standardHeight, elementHeight);
};

const reportHeight = (force = false) => {
    const currentHeight = getDocumentHeight();
    if (force || currentHeight > lastReportedHeight) {
        lastReportedHeight = Math.max(lastReportedHeight, currentHeight);
        try {
            window.parent.postMessage({ type: 'codePreviewHeightChange', height: currentHeight, iframeId: iframeId }, '*');
        } catch (error) {
            // noop
        }
    }
};

// Debounce to avoid excessive calculations
let debounceTimer = null;
const debouncedReportHeight = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(reportHeight, 50);
};

// Observe DOM mutations
const mutationObserver = new MutationObserver(() => {
    debouncedReportHeight();
});

// Observe element resizes
const resizeObserver = new ResizeObserver(() => {
    debouncedReportHeight();
});

const startObserving = () => {
    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
    });
    
    resizeObserver.observe(document.body);
    resizeObserver.observe(document.documentElement);
    
    // Initial report
    reportHeight();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserving);
} else {
    startObserving();
}

// Also report on load (for images, etc.)
window.addEventListener('load', reportHeight);

// Periodically check for changes that might be missed (e.g., CSS animations, transitions)
setInterval(reportHeight, 500);

window.addEventListener('message', (event) => {
    if (event.source !== window.parent) return;
    const data = event.data;
    if (!data || typeof data !== 'object') return;
    if (data.type === 'codePreviewHeightRequest') {
        reportHeight(true);
    }
});
})();
`;

const resolvePath = (baseFile, relativePath) => {
    const stack = baseFile.split('/');
    stack.pop(); // ファイル名を除去してディレクトリにする
    const parts = relativePath.split('/');
    for (const part of parts) {
        if (part === '.')
            continue;
        if (part === '..') {
            if (stack.length > 0)
                stack.pop();
        }
        else {
            stack.push(part);
        }
    }
    return stack.join('/');
};

const processCssCode = (code, resolvedImages, cssPath) => {
    if (!resolvedImages)
        return code;
    return code.replace(/url\((['"]?)([^)'"]+)\1\)/g, (match, quote, path) => {
        let resolvedPath = path;
        if (cssPath) {
            // cssPathがある場合は、それに基づき相対パスを解決する
            resolvedPath = resolvePath(cssPath, path);
        }
        else {
            // cssPathがない場合（インラインなど）は、従来の簡易的な正規化を行う（後方互換性のため）
            // ただし、誤った解決を防ぐため、単純な置換は避けるべきだが、
            // 既存の挙動を維持しつつ、明らかに誤ったパス（例: img/fence.png がルートにあると仮定）のみ許容する
            // ここでは、cssPathがない＝ルートにあると仮定して処理する
            resolvedPath = resolvePath('root.css', path);
        }
        if (resolvedImages[resolvedPath]) {
            return `url(${quote}${resolvedImages[resolvedPath]}${quote})`;
        }
        return match;
    });
};

const isAbsoluteUrl = (path) => path.startsWith('/') ||
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:') ||
    path.startsWith('mailto:') ||
    path.startsWith('tel:') ||
    path.startsWith('javascript:') ||
    path.startsWith('#') ||
    path.startsWith('//');
const normalizeRelativePath = (path) => {
    let normalized = path.replace(/^\.\//, '');
    while (normalized.startsWith('../')) {
        normalized = normalized.slice(3);
    }
    return normalized;
};
/**
 * Resolve a URL or path using an optional base URL and virtual image map.
 */
const resolveUrl = (path, resolvedImages, baseFilePath) => {
    if (isAbsoluteUrl(path)) {
        return path;
    }
    if (resolvedImages) {
        const normalized = baseFilePath ? resolvePath(baseFilePath, path) : normalizeRelativePath(path);
        if (resolvedImages[normalized]) {
            return resolvedImages[normalized];
        }
    }
    return path;
};

class DefaultAttributeProcessor {
    process(value, resolvedImages, baseFilePath) {
        return resolveUrl(value, resolvedImages, baseFilePath);
    }
}
class SrcSetAttributeProcessor {
    process(value, resolvedImages, baseFilePath) {
        return value
            .split(',')
            .map((part) => {
            const trimmed = part.trim();
            const spaceIndex = trimmed.indexOf(' ');
            if (spaceIndex === -1) {
                return resolveUrl(trimmed, resolvedImages, baseFilePath);
            }
            const url = trimmed.slice(0, spaceIndex);
            const descriptor = trimmed.slice(spaceIndex);
            return resolveUrl(url, resolvedImages, baseFilePath) + descriptor;
        })
            .join(', ');
    }
}

/**
 * CSSファイルを注入するヘルパー関数
 * @param html HTMLコード
 * @param cssPath CSSファイルのパス
 * @param cssCode CSSコード
 * @returns 処理されたHTMLコード
 */
const injectCss = (html, cssPath, cssCode) => {
    const normalizedPath = cssPath.replace(/^\.\//, '');
    const escapedPath = normalizedPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pathPattern = `(?:\\.\\/)?${escapedPath}`;
    // <link ...> を全て検索
    return html.replace(/<link\s+[^>]*>/gi, (match) => {
        // href属性のチェック
        const hrefRegex = new RegExp(`href\\s*=\\s*["']${pathPattern}["']`, 'i');
        // rel="stylesheet" のチェック (rel='stylesheet' も可)
        const relRegex = /rel\s*=\s*["']stylesheet["']/i;
        if (hrefRegex.test(match) && relRegex.test(match)) {
            return `<style data-from-file="${cssPath}">\n${cssCode}\n</style>`;
        }
        return match;
    });
};
/**
 * JSファイルを注入するヘルパー関数
 * @param html HTMLコード
 * @param jsPath JSファイルのパス
 * @param jsCode JSコード
 * @returns 処理されたHTMLコードと注入されたかどうかのフラグ
 */
const injectJs = (html, jsPath, jsCode) => {
    let injected = false;
    const normalizedPath = jsPath.replace(/^\.\//, '');
    const escapedPath = normalizedPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pathPattern = `(?:\\.\\/)?${escapedPath}`;
    // <script ... src="...">...</script> を探す
    // [\s\S]*? は改行を含む任意の文字にマッチ (dotAll)
    const scriptRegex = /<script\s+([^>]*?)>([\s\S]*?)<\/script>/gi;
    const processed = html.replace(scriptRegex, (match, attrs, _content) => {
        const srcRegex = new RegExp(`src\\s*=\\s*["']${pathPattern}["']`, 'i');
        if (srcRegex.test(attrs)) {
            injected = true;
            return `<script data-from-file="${jsPath}">\n${jsCode}\n</script>`;
        }
        return match;
    });
    return { processed, injected };
};

const RESOLVE_ATTRIBUTES = ['src', 'srcset'];
/**
 * Resolve image-related attribute values in HTML.
 */
const processImagePaths = (code, resolvedImages, htmlPath) => {
    if (!resolvedImages)
        return code;
    const processors = {
        srcset: new SrcSetAttributeProcessor(),
        default: new DefaultAttributeProcessor()
    };
    const attrPattern = RESOLVE_ATTRIBUTES.join('|');
    const attrRegex = new RegExp(`(^|[\\s"'>/])(${attrPattern})(\\s*=\\s*)(["'])(.*?)\\4`, 'gi');
    return code.replace(attrRegex, (match, prefix, attr, equals, quote, value) => {
        const key = String(attr).toLowerCase();
        const processor = key === 'srcset' ? processors.srcset : processors.default;
        const newValue = processor.process(value, resolvedImages, htmlPath);
        return `${prefix}${attr}${equals}${quote}${newValue}${quote}`;
    });
};
/**
 * Escape </script> tags in HTML to prevent premature termination.
 */
const escapeScriptEndTag = (code) => {
    return code.replace(/<\/script>/gi, '<' + '/script>');
};
/**
 * Inline matching CSS/JS file paths into the HTML.
 */
const resolveFilePaths = (html, cssPath, cssCode, jsPath, jsCode) => {
    let processed = html;
    let jsInjected = false;
    if (cssPath && cssCode) {
        processed = injectCss(processed, cssPath, cssCode);
    }
    if (jsPath && jsCode) {
        const result = injectJs(processed, jsPath, jsCode);
        processed = result.processed;
        jsInjected = result.injected;
    }
    return { processed, jsInjected };
};
/**
 * Process HTML with asset resolution and inline file injection.
 */
const processHtmlCode = (code, cssPath, cssCode, jsPath, jsCode, resolvedImages, htmlPath) => {
    const processed = processImagePaths(code, resolvedImages, htmlPath);
    return resolveFilePaths(processed, cssPath, cssCode, jsPath, jsCode);
};

// iframeへ渡すHTML
const generatePreviewDocument = (options) => {
    const { htmlCode, cssCode, jsCode, showPreview, showConsole, showHTMLEditor, showCSSEditor, showJSEditor, resolvedImages, cssPath, jsPath, resolvedHtmlPath, resolvedCssPath, resolvedJsPath } = options;
    // Use resolved paths if available, otherwise fallback to raw paths
    const targetCssPath = resolvedCssPath || cssPath;
    const targetJsPath = resolvedJsPath || jsPath;
    const { processed: processedHtmlRaw, jsInjected } = processHtmlCode(htmlCode, targetCssPath, cssCode, targetJsPath, jsCode, resolvedImages, resolvedHtmlPath);
    const processedHtml = escapeScriptEndTag(processedHtmlRaw);
    const processedCss = processCssCode(cssCode, resolvedImages, targetCssPath);
    const styleTag = processedCss ? `<style>\n${processedCss}\n</style>` : '';
    const extraJs = !jsInjected && jsCode ? `<script>\n${escapeScriptEndTag(jsCode)}\n</script>` : '';
    const consoleScriptTag = showPreview || showConsole || showHTMLEditor || showCSSEditor || showJSEditor
        ? `<script data-code-preview-internal="true">${CONSOLE_INTERCEPT_SCRIPT}</script>`
        : '';
    // Height observer script to notify parent when content height changes dynamically
    const heightObserverScriptTag = showPreview && options.iframeId
        ? `<script data-code-preview-internal="true">${HEIGHT_OBSERVER_SCRIPT.replace('__IFRAME_ID__', options.iframeId)}</script>`
        : '';
    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${styleTag}
${consoleScriptTag}
${heightObserverScriptTag}
</head>
<body>
${processedHtml}
${extraJs}
</body>
</html>`;
};

const PreviewPanel = ({ iframeRef, iframeKey, previewHeight, minHeightCss, visible, generatorOptions }) => {
    const loadedOnClientRef = useRef(false);
    useEffect(() => {
        if (!visible)
            return;
        const iframe = iframeRef.current;
        if (!iframe)
            return;
        if (iframe.dataset.codePreviewHydrationReloaded === '1')
            return;
        if (loadedOnClientRef.current)
            return;
        const doc = iframe.contentDocument;
        if (!doc || doc.readyState !== 'complete')
            return;
        const srcDoc = iframe.getAttribute('srcdoc');
        if (!srcDoc)
            return;
        iframe.dataset.codePreviewHydrationReloaded = '1';
        iframe.srcdoc = srcDoc;
    }, [iframeKey, iframeRef, visible]);
    return (jsx("iframe", { ref: iframeRef, srcDoc: generatePreviewDocument(generatorOptions), onLoad: () => {
            loadedOnClientRef.current = true;
        }, className: visible ? styles.preview : undefined, title: "HTML+CSS Preview", sandbox: "allow-scripts allow-same-origin", style: visible
            ? { height: previewHeight, '--min-height': minHeightCss }
            : { display: 'none' } }, `${visible ? 'visible' : 'hidden'}-${iframeKey}`));
};

const PreviewSection = ({ visibility, state, layout, minHeightCss, cssPath, jsPath, iframeRef }) => {
    const shouldShow = visibility.showPreview ||
        visibility.showHTMLEditor ||
        visibility.showCSSEditor ||
        visibility.showJSEditor ||
        visibility.showConsole;
    if (!shouldShow) {
        return null;
    }
    return (jsxs("div", { className: styles.previewSection, style: { display: visibility.showPreview ? 'flex' : 'none' }, children: [jsx("div", { className: styles.sectionHeader, children: "\u30D7\u30EC\u30D3\u30E5\u30FC" }), jsx("div", { className: styles.previewContainer, children: jsx(PreviewPanel, { iframeRef: iframeRef, iframeKey: state.iframeKey, previewHeight: layout.previewHeight, minHeightCss: minHeightCss, visible: true, generatorOptions: {
                        htmlCode: state.htmlCode,
                        cssCode: state.cssCode,
                        jsCode: state.jsCode,
                        showPreview: visibility.showPreview,
                        showConsole: visibility.showConsole,
                        showHTMLEditor: visibility.showHTMLEditor,
                        showCSSEditor: visibility.showCSSEditor,
                        showJSEditor: visibility.showJSEditor,
                        resolvedImages: state.resolvedImages,
                        cssPath: cssPath,
                        jsPath: jsPath,
                        resolvedHtmlPath: state.resolvedHtmlPath,
                        resolvedCssPath: state.resolvedCssPath,
                        resolvedJsPath: state.resolvedJsPath,
                        iframeId: state.iframeId
                    } }) })] }));
};

const CodePreviewLayout = ({ elementRefs, state, visibility, layout, handlers, title, cssPath, jsPath }) => {
    const { iframeRef, containerRef, editorsRowRef } = elementRefs;
    const splitLayoutStyle = visibility.showPreview ? undefined : { minHeight: 'auto' };
    const editorsRowStyle = visibility.showPreview || visibility.showConsole ? undefined : { borderBottom: 'none' };
    return (jsxs("div", { className: styles.codePreviewContainer, children: [title ? (jsx("div", { className: styles.header, children: jsx("h4", { className: styles.title, children: title }) })) : null, jsxs("div", { className: styles.splitLayout, ref: containerRef, style: splitLayoutStyle, children: [state.showFileStructure && (jsx(FileStructurePanel, { resolvedHtmlPath: state.resolvedHtmlPath, resolvedCssPath: state.resolvedCssPath, resolvedJsPath: state.resolvedJsPath, resolvedImages: state.resolvedImages })), jsx(EditorSection, { layout: layout, state: state, handlers: handlers, editorsRowRef: editorsRowRef, editorsRowStyle: editorsRowStyle }), jsx(PreviewSection, { visibility: visibility, state: state, layout: layout, minHeightCss: layout.minHeightCss, cssPath: cssPath, jsPath: jsPath, iframeRef: iframeRef }), visibility.showConsole && jsx(ConsolePanel, { logs: state.consoleLogs })] })] }));
};

function CodePreviewClient(props) {
    const { children, title, cssPath, jsPath, initialHTML, initialCSS, initialJS, ...rest } = props;
    const parsedSource = useMemo(() => {
        if (!shouldParseCodeBlocksFromChildren(children, initialHTML, initialCSS, initialJS)) {
            return {};
        }
        return parseCodeBlocksFromChildren(children);
    }, [children, initialHTML, initialCSS, initialJS]);
    const resolvedInitialHTML = initialHTML ?? parsedSource.initialHTML;
    const resolvedInitialCSS = initialCSS ?? parsedSource.initialCSS;
    const resolvedInitialJS = initialJS ?? parsedSource.initialJS;
    const hookResult = useCodePreview({
        ...rest,
        cssPath,
        jsPath,
        initialHTML: resolvedInitialHTML,
        initialCSS: resolvedInitialCSS,
        initialJS: resolvedInitialJS
    });
    return jsx(CodePreviewLayout, { ...hookResult, title: title, cssPath: cssPath, jsPath: jsPath });
}

export { CodePreviewClient as C };
//# sourceMappingURL=CodePreviewClient-t8epznlw.esm.js.map
