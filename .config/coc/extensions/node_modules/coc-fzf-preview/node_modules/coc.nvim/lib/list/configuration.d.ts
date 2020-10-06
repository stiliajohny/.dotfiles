/// <reference types="node" />
import { EventEmitter } from 'events';
export declare const validKeys: string[];
export default class ListConfiguration extends EventEmitter {
    private configuration;
    private disposable;
    constructor();
    get<T>(key: string, defaultValue?: T): T;
    get previousKey(): string;
    get nextKey(): string;
    dispose(): void;
    fixKey(key: string): string;
}
