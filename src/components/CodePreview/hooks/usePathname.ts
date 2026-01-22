import { useSyncExternalStore } from 'react';

type Listener = () => void;

let initialized = false;
let currentPathname: string | undefined =
    typeof window !== 'undefined' ? window.location.pathname : undefined;
let listeners = new Set<Listener>();
let originalPushState: History['pushState'] | null = null;
let originalReplaceState: History['replaceState'] | null = null;
let notifyScheduled = false;

const scheduleNotify = () => {
    if (notifyScheduled) return;
    notifyScheduled = true;

    const run = () => {
        notifyScheduled = false;
        listeners.forEach(listener => listener());
    };

    if (typeof queueMicrotask === 'function') {
        queueMicrotask(run);
        return;
    }
    setTimeout(run, 0);
};

const notifyListeners = () => {
    if (typeof window === 'undefined') return;
    const nextPathname = window.location.pathname;
    if (nextPathname === currentPathname) return;
    currentPathname = nextPathname;
    scheduleNotify();
};

const ensureInitialized = () => {
    if (initialized || typeof window === 'undefined') return;
    initialized = true;
    currentPathname = window.location.pathname;

    window.addEventListener('popstate', notifyListeners);

    originalPushState = history.pushState;
    originalReplaceState = history.replaceState;

    history.pushState = function pushState(
        ...args: Parameters<History['pushState']>
    ) {
        originalPushState?.apply(this, args);
        notifyListeners();
    };

    history.replaceState = function replaceState(
        ...args: Parameters<History['replaceState']>
    ) {
        originalReplaceState?.apply(this, args);
        notifyListeners();
    };
};

const cleanup = () => {
    if (typeof window === 'undefined') return;
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

const subscribe = (listener: Listener) => {
    if (typeof window === 'undefined') {
        return () => {};
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

export const usePathname = () =>
    useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
