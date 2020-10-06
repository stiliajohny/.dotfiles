import { Diagnostic, Event } from 'vscode-languageserver-protocol';
import { DiagnosticConfig } from './manager';
export declare class DiagnosticBuffer {
    readonly bufnr: number;
    readonly uri: string;
    private config;
    private readonly srdId;
    private readonly signIds;
    private readonly _onDidRefresh;
    readonly matchIds: Set<number>;
    readonly onDidRefresh: Event<void>;
    /**
     * Refresh diagnostics with debounce
     */
    refresh: Function & {
        clear(): void;
    };
    constructor(bufnr: number, uri: string, config: DiagnosticConfig);
    /**
     * Refresh diagnostics without debounce
     */
    forceRefresh(diagnostics: ReadonlyArray<Diagnostic>): void;
    private _refresh;
    private clearSigns;
    checkSigns(): Promise<void>;
    updateLocationList(curr: {
        title: string;
    }, diagnostics: ReadonlyArray<Diagnostic>): void;
    addSigns(diagnostics: ReadonlyArray<Diagnostic>): void;
    setDiagnosticInfo(diagnostics: ReadonlyArray<Diagnostic>): void;
    showVirtualText(diagnostics: ReadonlyArray<Diagnostic>, lnum: number): void;
    clearHighlight(): void;
    addHighlight(diagnostics: ReadonlyArray<Diagnostic>, bufnr: number): void;
    /**
     * Used on buffer unload
     *
     * @public
     * @returns {Promise<void>}
     */
    clear(): Promise<void>;
    hasHighlights(): boolean;
    dispose(): void;
    private get document();
    private get nvim();
}
