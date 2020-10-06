import { Disposable, Event } from 'vscode-languageserver-protocol';
import { Extension, ExtensionInfo, ExtensionState, ExtensionType } from './types';
import './util/extensions';
export declare type API = {
    [index: string]: any;
} | void | null | undefined;
export interface PropertyScheme {
    type: string;
    default: any;
    description: string;
    enum?: string[];
    items?: any;
    [key: string]: any;
}
export interface ExtensionItem {
    id: Readonly<string>;
    type: Readonly<ExtensionType>;
    extension: Extension<API>;
    deactivate: () => void | Promise<void>;
    filepath?: string;
    directory?: string;
    isLocal: Readonly<boolean>;
}
export declare class Extensions {
    private extensions;
    private disabled;
    private db;
    private memos;
    private root;
    private _onDidLoadExtension;
    private _onDidActiveExtension;
    private _onDidUnloadExtension;
    private _additionalSchemes;
    private activated;
    private installBuffer;
    private disposables;
    ready: boolean;
    readonly onDidLoadExtension: Event<Extension<API>>;
    readonly onDidActiveExtension: Event<Extension<API>>;
    readonly onDidUnloadExtension: Event<string>;
    constructor();
    init(): Promise<void>;
    activateExtensions(): Promise<void>;
    updateExtensions(sync?: boolean, silent?: boolean): Promise<Disposable | null>;
    private checkExtensions;
    /**
     * Install extensions, can be called without initialize.
     */
    installExtensions(list?: string[]): Promise<void>;
    /**
     * Get list of extensions in package.json that not installed
     */
    getMissingExtensions(): string[];
    get npm(): string;
    /**
     * Get all loaded extensions.
     */
    get all(): Extension<API>[];
    getExtension(id: string): ExtensionItem;
    getExtensionState(id: string): ExtensionState;
    getExtensionStates(): Promise<ExtensionInfo[]>;
    getLockedList(): Promise<string[]>;
    toggleLock(id: string): Promise<void>;
    toggleExtension(id: string): Promise<void>;
    reloadExtension(id: string): Promise<void>;
    /**
     * Unload & remove all global extensions, return removed extensions.
     */
    cleanExtensions(): Promise<string[]>;
    uninstallExtension(ids: string[]): Promise<void>;
    isDisabled(id: string): boolean;
    has(id: string): boolean;
    isActivated(id: string): boolean;
    /**
     * Load extension from folder, folder should contains coc extension.
     */
    loadExtension(folder: string): Promise<boolean>;
    private loadFileExtensions;
    /**
     * Load single javascript file as extension.
     */
    loadExtensionFile(filepath: string): Promise<void>;
    /**
     * Activate extension, throw error if disabled or not exists
     * Returns true if extension successfully activated.
     */
    activate(id: any): Promise<boolean>;
    deactivate(id: any): Promise<boolean>;
    call(id: string, method: string, args: any[]): Promise<any>;
    getExtensionApi(id: string): API | null;
    registerExtension(extension: Extension<API>, deactivate?: () => void): void;
    get globalExtensions(): string[];
    private globalExtensionStats;
    private localExtensionStats;
    private loadJson;
    get schemes(): {
        [key: string]: PropertyScheme;
    };
    addSchemeProperty(key: string, def: PropertyScheme): void;
    private setupActiveEvents;
    private createExtension;
    filterGlobalExtensions(names: string[]): string[];
    private get modulesFolder();
    private canActivate;
    /**
     * Deactive & unregist extension
     */
    private unloadExtension;
    /**
     * Check if folder contains extension, return Error
     */
    private checkDirectory;
    dispose(): void;
}
declare const _default: Extensions;
export default _default;
