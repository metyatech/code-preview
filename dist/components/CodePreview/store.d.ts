import { SourceCodeState } from './types';
export type StoreListener = () => void;
export interface ISourceCodeStore {
    get(sourceId: string): SourceCodeState | undefined;
    set(sourceId: string, state: SourceCodeState): void;
    subscribe(sourceId: string, listener: StoreListener): () => void;
    notify(sourceId: string): void;
}
export declare class SourceCodeStore implements ISourceCodeStore {
    private store;
    private listeners;
    get(sourceId: string): SourceCodeState | undefined;
    set(sourceId: string, state: SourceCodeState): void;
    subscribe(sourceId: string, listener: StoreListener): () => void;
    notify(sourceId: string): void;
}
export declare const globalSourceCodeStore: SourceCodeStore;
export declare const getStoredSource: (sourceId: string) => SourceCodeState | undefined;
export declare const setStoredSource: (sourceId: string, state: SourceCodeState) => void;
export declare const subscribeToStore: (sourceId: string, listener: StoreListener) => () => void;
export declare const notifyStoreUpdate: (sourceId: string) => void;
