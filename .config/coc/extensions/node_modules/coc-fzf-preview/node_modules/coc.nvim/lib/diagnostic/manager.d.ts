import { Diagnostic, Disposable, Range } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DiagnosticItem } from '../types';
import DiagnosticCollection from './collection';
export interface DiagnosticConfig {
    enableSign: boolean;
    locationlistUpdate: boolean;
    enableHighlightLineNumber: boolean;
    checkCurrentLine: boolean;
    enableMessage: string;
    displayByAle: boolean;
    srcId: number;
    signOffset: number;
    errorSign: string;
    warningSign: string;
    infoSign: string;
    hintSign: string;
    level: number;
    messageTarget: string;
    messageDelay: number;
    maxWindowHeight: number;
    maxWindowWidth: number;
    refreshAfterSave: boolean;
    refreshOnInsertMode: boolean;
    virtualText: boolean;
    virtualTextCurrentLineOnly: boolean;
    virtualTextSrcId: number;
    virtualTextPrefix: string;
    virtualTextLines: number;
    virtualTextLineSeparator: string;
    filetypeMap: object;
    format?: string;
}
export declare class DiagnosticManager implements Disposable {
    config: DiagnosticConfig;
    enabled: boolean;
    private readonly buffers;
    private lastMessage;
    private floatFactory;
    private collections;
    private disposables;
    private timer;
    init(): void;
    private createDiagnosticBuffer;
    setLocationlist(bufnr: number): Promise<void>;
    setConfigurationErrors(init?: boolean): void;
    /**
     * Create collection by name
     */
    create(name: string): DiagnosticCollection;
    /**
     * Get diagnostics ranges from document
     */
    getSortedRanges(uri: string, severity?: string): Range[];
    /**
     * Get readonly diagnostics for a buffer
     */
    getDiagnostics(uri: string): Diagnostic[];
    getDiagnosticsInRange(document: TextDocument, range: Range): Diagnostic[];
    /**
     * Show diagnostics under curosr in preview window
     */
    preview(): Promise<void>;
    /**
     * Jump to previous diagnostic position
     */
    jumpPrevious(severity?: string): Promise<void>;
    /**
     * Jump to next diagnostic position
     */
    jumpNext(severity?: string): Promise<void>;
    /**
     * All diagnostics of current workspace
     */
    getDiagnosticList(): DiagnosticItem[];
    private getDiagnosticsAt;
    getCurrentDiagnostics(): Promise<Diagnostic[]>;
    /**
     * Echo diagnostic message of currrent position
     */
    echoMessage(truncate?: boolean): Promise<void>;
    jumpRelated(): Promise<void>;
    private disposeBuffer;
    hideFloat(): void;
    dispose(): void;
    private get nvim();
    private setConfiguration;
    private getCollections;
    private shouldValidate;
    clearDiagnostic(bufnr: number): void;
    toggleDiagnostic(): void;
    refreshBuffer(uri: string, force?: boolean): boolean;
}
declare const _default: DiagnosticManager;
export default _default;
