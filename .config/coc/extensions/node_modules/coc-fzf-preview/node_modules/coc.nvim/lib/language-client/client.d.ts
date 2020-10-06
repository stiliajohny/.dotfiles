import { CancellationToken, ClientCapabilities, CodeAction, CodeActionContext, CodeActionRequest, CodeLens, Command, CompletionContext, CompletionItem, CompletionList, CompletionRequest, DeclarationRequest, Definition, DefinitionRequest, Diagnostic, DidChangeTextDocumentNotification, DidChangeTextDocumentParams, DidCloseTextDocumentNotification, DidOpenTextDocumentNotification, DidSaveTextDocumentNotification, Disposable, DocumentColorRequest, DocumentFormattingRequest, DocumentHighlight, DocumentHighlightRequest, DocumentLink, DocumentLinkRequest, DocumentOnTypeFormattingRequest, DocumentRangeFormattingRequest, DocumentSelector, DocumentSymbol, Event, FileEvent, FoldingRangeRequest, FormattingOptions, GenericNotificationHandler, GenericRequestHandler, Hover, HoverRequest, ImplementationRequest, InitializeError, InitializeParams, InitializeResult, Location, Logger, Message, MessageReader, MessageWriter, NotificationHandler, NotificationHandler0, NotificationType, NotificationType0, Position, ProgressType, Proposed, Range, ReferencesRequest, RenameRequest, RequestHandler, RequestHandler0, RequestType, RequestType0, ResponseError, RPCMessageType, SelectionRangeRequest, ServerCapabilities, SignatureHelp, SignatureHelpRequest, StaticRegistrationOptions, SymbolInformation, TextDocument, TextDocumentRegistrationOptions, TextEdit, Trace, TypeDefinitionRequest, WillSaveTextDocumentNotification, WillSaveTextDocumentWaitUntilRequest, WorkspaceEdit, WorkspaceFolder, WorkspaceSymbolRequest } from 'vscode-languageserver-protocol';
import FileWatcher from '../model/fileSystemWatcher';
import { CodeActionProvider, CompletionItemProvider, DeclarationProvider, DefinitionProvider, DocumentColorProvider, DocumentFormattingEditProvider, DocumentHighlightProvider, DocumentLinkProvider, DocumentRangeFormattingEditProvider, FoldingRangeProvider, HoverProvider, ImplementationProvider, OnTypeFormattingEditProvider, ProviderResult, ReferenceProvider, RenameProvider, SelectionRangeProvider, SignatureHelpProvider, TypeDefinitionProvider, WorkspaceSymbolProvider } from '../provider';
import { DiagnosticCollection, OutputChannel, TextDocumentWillSaveEvent, Thenable } from '../types';
import { ColorProviderMiddleware } from './colorProvider';
import { ConfigurationWorkspaceMiddleware } from './configuration';
import { DeclarationMiddleware } from './declaration';
import { FoldingRangeProviderMiddleware } from './foldingRange';
import { ImplementationMiddleware } from './implementation';
import { SelectionRangeProviderMiddleware } from './selectionRange';
import { TypeDefinitionMiddleware } from './typeDefinition';
import { WorkspaceFolderWorkspaceMiddleware } from './workspaceFolders';
export declare class NullLogger implements Logger {
    error(_message: string): void;
    warn(_message: string): void;
    info(_message: string): void;
    log(_message: string): void;
}
/**
 * An action to be performed when the connection is producing errors.
 */
export declare enum ErrorAction {
    /**
     * Continue running the server.
     */
    Continue = 1,
    /**
     * Shutdown the server.
     */
    Shutdown = 2
}
/**
 * An action to be performed when the connection to a server got closed.
 */
export declare enum CloseAction {
    /**
     * Don't restart the server. The connection stays closed.
     */
    DoNotRestart = 1,
    /**
     * Restart the server.
     */
    Restart = 2
}
/**
 * A pluggable error handler that is invoked when the connection is either
 * producing errors or got closed.
 */
export interface ErrorHandler {
    /**
     * An error has occurred while writing or reading from the connection.
     *
     * @param error - the error received
     * @param message - the message to be delivered to the server if know.
     * @param count - a count indicating how often an error is received. Will
     *  be reset if a message got successfully send or received.
     */
    error(error: Error, message: Message, count: number): ErrorAction;
    /**
     * The connection to the server got closed.
     */
    closed(): CloseAction;
}
export interface InitializationFailedHandler {
    (error: ResponseError<InitializeError> | Error | any): boolean;
}
export interface SynchronizeOptions {
    configurationSection?: string | string[];
    fileEvents?: FileWatcher | FileWatcher[];
}
export declare enum RevealOutputChannelOn {
    Info = 1,
    Warn = 2,
    Error = 3,
    Never = 4
}
export interface HandleDiagnosticsSignature {
    (this: void, uri: string, diagnostics: Diagnostic[]): void;
}
export interface ProvideCompletionItemsSignature {
    (this: void, document: TextDocument, position: Position, context: CompletionContext, token: CancellationToken): ProviderResult<CompletionItem[] | CompletionList>;
}
export interface ResolveCompletionItemSignature {
    (this: void, item: CompletionItem, token: CancellationToken): ProviderResult<CompletionItem>;
}
export interface ProvideHoverSignature {
    (this: void, document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Hover>;
}
export interface ProvideSignatureHelpSignature {
    (this: void, document: TextDocument, position: Position, token: CancellationToken): ProviderResult<SignatureHelp>;
}
export interface ProvideDefinitionSignature {
    (this: void, document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Definition>;
}
export interface ProvideReferencesSignature {
    (this: void, document: TextDocument, position: Position, options: {
        includeDeclaration: boolean;
    }, token: CancellationToken): ProviderResult<Location[]>;
}
export interface ProvideDocumentHighlightsSignature {
    (this: void, document: TextDocument, position: Position, token: CancellationToken): ProviderResult<DocumentHighlight[]>;
}
export interface ProvideDocumentSymbolsSignature {
    (this: void, document: TextDocument, token: CancellationToken): ProviderResult<SymbolInformation[] | DocumentSymbol[]>;
}
export interface ProvideWorkspaceSymbolsSignature {
    (this: void, query: string, token: CancellationToken): ProviderResult<SymbolInformation[]>;
}
export interface ProvideCodeActionsSignature {
    (this: void, document: TextDocument, range: Range, context: CodeActionContext, token: CancellationToken): ProviderResult<(Command | CodeAction)[]>;
}
export interface ProvideCodeLensesSignature {
    (this: void, document: TextDocument, token: CancellationToken): ProviderResult<CodeLens[]>;
}
export interface ResolveCodeLensSignature {
    (this: void, codeLens: CodeLens, token: CancellationToken): ProviderResult<CodeLens>;
}
export interface ProvideDocumentFormattingEditsSignature {
    (this: void, document: TextDocument, options: FormattingOptions, token: CancellationToken): ProviderResult<TextEdit[]>;
}
export interface ProvideDocumentRangeFormattingEditsSignature {
    (this: void, document: TextDocument, range: Range, options: FormattingOptions, token: CancellationToken): ProviderResult<TextEdit[]>;
}
export interface ProvideOnTypeFormattingEditsSignature {
    (this: void, document: TextDocument, position: Position, ch: string, options: FormattingOptions, token: CancellationToken): ProviderResult<TextEdit[]>;
}
export interface PrepareRenameSignature {
    (this: void, document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Range | {
        range: Range;
        placeholder: string;
    }>;
}
export interface ProvideRenameEditsSignature {
    (this: void, document: TextDocument, position: Position, newName: string, token: CancellationToken): ProviderResult<WorkspaceEdit>;
}
export interface ProvideDocumentLinksSignature {
    (this: void, document: TextDocument, token: CancellationToken): ProviderResult<DocumentLink[]>;
}
export interface ResolveDocumentLinkSignature {
    (this: void, link: DocumentLink, token: CancellationToken): ProviderResult<DocumentLink>;
}
export interface ExecuteCommandSignature {
    (this: void, command: string, args: any[]): ProviderResult<any>;
}
export interface NextSignature<P, R> {
    (this: void, data: P, next: (data: P) => R): R;
}
export interface DidChangeConfigurationSignature {
    (this: void, sections: string[] | undefined): void;
}
export interface DidChangeWatchedFileSignature {
    (this: void, event: FileEvent): void;
}
export interface _WorkspaceMiddleware {
    didChangeConfiguration?: (this: void, sections: string[] | undefined, next: DidChangeConfigurationSignature) => void;
    didChangeWatchedFile?: (this: void, event: FileEvent, next: DidChangeWatchedFileSignature) => void;
}
export declare type WorkspaceMiddleware = _WorkspaceMiddleware & ConfigurationWorkspaceMiddleware & WorkspaceFolderWorkspaceMiddleware;
/**
 * The Middleware lets extensions intercept the request and notications send and received
 * from the server
 */
export interface _Middleware {
    didOpen?: NextSignature<TextDocument, void>;
    didChange?: NextSignature<DidChangeTextDocumentParams, void>;
    willSave?: NextSignature<TextDocumentWillSaveEvent, void>;
    willSaveWaitUntil?: NextSignature<TextDocumentWillSaveEvent, Thenable<TextEdit[]>>;
    didSave?: NextSignature<TextDocument, void>;
    didClose?: NextSignature<TextDocument, void>;
    handleDiagnostics?: (this: void, uri: string, diagnostics: Diagnostic[], next: HandleDiagnosticsSignature) => void;
    provideCompletionItem?: (this: void, document: TextDocument, position: Position, context: CompletionContext, token: CancellationToken, next: ProvideCompletionItemsSignature) => ProviderResult<CompletionItem[] | CompletionList>;
    resolveCompletionItem?: (this: void, item: CompletionItem, token: CancellationToken, next: ResolveCompletionItemSignature) => ProviderResult<CompletionItem>;
    provideHover?: (this: void, document: TextDocument, position: Position, token: CancellationToken, next: ProvideHoverSignature) => ProviderResult<Hover>;
    provideSignatureHelp?: (this: void, document: TextDocument, position: Position, token: CancellationToken, next: ProvideSignatureHelpSignature) => ProviderResult<SignatureHelp>;
    provideDefinition?: (this: void, document: TextDocument, position: Position, token: CancellationToken, next: ProvideDefinitionSignature) => ProviderResult<Definition>;
    provideReferences?: (this: void, document: TextDocument, position: Position, options: {
        includeDeclaration: boolean;
    }, token: CancellationToken, next: ProvideReferencesSignature) => ProviderResult<Location[]>;
    provideDocumentHighlights?: (this: void, document: TextDocument, position: Position, token: CancellationToken, next: ProvideDocumentHighlightsSignature) => ProviderResult<DocumentHighlight[]>;
    provideDocumentSymbols?: (this: void, document: TextDocument, token: CancellationToken, next: ProvideDocumentSymbolsSignature) => ProviderResult<SymbolInformation[] | DocumentSymbol[]>;
    provideWorkspaceSymbols?: (this: void, query: string, token: CancellationToken, next: ProvideWorkspaceSymbolsSignature) => ProviderResult<SymbolInformation[]>;
    provideCodeActions?: (this: void, document: TextDocument, range: Range, context: CodeActionContext, token: CancellationToken, next: ProvideCodeActionsSignature) => ProviderResult<(Command | CodeAction)[]>;
    provideCodeLenses?: (this: void, document: TextDocument, token: CancellationToken, next: ProvideCodeLensesSignature) => ProviderResult<CodeLens[]>;
    resolveCodeLens?: (this: void, codeLens: CodeLens, token: CancellationToken, next: ResolveCodeLensSignature) => ProviderResult<CodeLens>;
    provideDocumentFormattingEdits?: (this: void, document: TextDocument, options: FormattingOptions, token: CancellationToken, next: ProvideDocumentFormattingEditsSignature) => ProviderResult<TextEdit[]>;
    provideDocumentRangeFormattingEdits?: (this: void, document: TextDocument, range: Range, options: FormattingOptions, token: CancellationToken, next: ProvideDocumentRangeFormattingEditsSignature) => ProviderResult<TextEdit[]>;
    provideOnTypeFormattingEdits?: (this: void, document: TextDocument, position: Position, ch: string, options: FormattingOptions, token: CancellationToken, next: ProvideOnTypeFormattingEditsSignature) => ProviderResult<TextEdit[]>;
    prepareRename?: (this: void, document: TextDocument, position: Position, token: CancellationToken, next: PrepareRenameSignature) => ProviderResult<Range | {
        range: Range;
        placeholder: string;
    }>;
    provideRenameEdits?: (this: void, document: TextDocument, position: Position, newName: string, token: CancellationToken, next: ProvideRenameEditsSignature) => ProviderResult<WorkspaceEdit>;
    provideDocumentLinks?: (this: void, document: TextDocument, token: CancellationToken, next: ProvideDocumentLinksSignature) => ProviderResult<DocumentLink[]>;
    resolveDocumentLink?: (this: void, link: DocumentLink, token: CancellationToken, next: ResolveDocumentLinkSignature) => ProviderResult<DocumentLink>;
    executeCommand?: (this: void, command: string, args: any[], next: ExecuteCommandSignature) => ProviderResult<any>;
    workspace?: WorkspaceMiddleware;
}
export declare type Middleware = _Middleware & TypeDefinitionMiddleware & ImplementationMiddleware & ColorProviderMiddleware & DeclarationMiddleware & FoldingRangeProviderMiddleware & SelectionRangeProviderMiddleware;
export interface LanguageClientOptions {
    ignoredRootPaths?: string[];
    documentSelector?: DocumentSelector | string[];
    synchronize?: SynchronizeOptions;
    diagnosticCollectionName?: string;
    disableDynamicRegister?: boolean;
    disableWorkspaceFolders?: boolean;
    disableSnippetCompletion?: boolean;
    disableDiagnostics?: boolean;
    disableCompletion?: boolean;
    formatterPriority?: number;
    outputChannelName?: string;
    outputChannel?: OutputChannel;
    revealOutputChannelOn?: RevealOutputChannelOn;
    /**
     * The encoding use to read stdout and stderr. Defaults
     * to 'utf8' if ommitted.
     */
    stdioEncoding?: string;
    initializationOptions?: any | (() => any);
    initializationFailedHandler?: InitializationFailedHandler;
    progressOnInitialization?: boolean;
    errorHandler?: ErrorHandler;
    middleware?: Middleware;
    workspaceFolder?: WorkspaceFolder;
}
export declare enum State {
    Stopped = 1,
    Running = 2,
    Starting = 3
}
export interface StateChangeEvent {
    oldState: State;
    newState: State;
}
export declare enum ClientState {
    Initial = 0,
    Starting = 1,
    StartFailed = 2,
    Running = 3,
    Stopping = 4,
    Stopped = 5
}
export interface RegistrationData<T> {
    id: string;
    registerOptions: T;
}
/**
 * A static feature. A static feature can't be dynamically activate via the
 * server. It is wired during the initialize sequence.
 */
export interface StaticFeature {
    /**
     * Called to fill the initialize params.
     *
     * @params the initialize params.
     */
    fillInitializeParams?: (params: InitializeParams) => void;
    /**
     * Called to fill in the client capabilities this feature implements.
     *
     * @param capabilities The client capabilities to fill.
     */
    fillClientCapabilities(capabilities: ClientCapabilities): void;
    /**
     * Initialize the feature. This method is called on a feature instance
     * when the client has successfully received the initalize request from
     * the server and before the client sends the initialized notification
     * to the server.
     *
     * @param capabilities the server capabilities
     * @param documentSelector the document selector pass to the client's constuctor.
     *  May be `undefined` if the client was created without a selector.
     */
    initialize(capabilities: ServerCapabilities, documentSelector: DocumentSelector | undefined): void;
}
export interface DynamicFeature<T> {
    /**
     * The message for which this features support dynamic activation / registration.
     */
    messages: RPCMessageType | RPCMessageType[];
    /**
     * Called to fill the initialize params.
     *
     * @params the initialize params.
     */
    fillInitializeParams?: (params: InitializeParams) => void;
    /**
     * Called to fill in the client capabilities this feature implements.
     *
     * @param capabilities The client capabilities to fill.
     */
    fillClientCapabilities(capabilities: ClientCapabilities): void;
    /**
     * Initialize the feature. This method is called on a feature instance
     * when the client has successfully received the initalize request from
     * the server and before the client sends the initialized notification
     * to the server.
     *
     * @param capabilities the server capabilities.
     * @param documentSelector the document selector pass to the client's constuctor.
     *  May be `undefined` if the client was created without a selector.
     */
    initialize(capabilities: ServerCapabilities, documentSelector: DocumentSelector | undefined): void;
    /**
     * Is called when the server send a register request for the given message.
     *
     * @param message the message to register for.
     * @param data additional registration data as defined in the protocol.
     */
    register(message: RPCMessageType, data: RegistrationData<T>): void;
    /**
     * Is called when the server wants to unregister a feature.
     *
     * @param id the id used when registering the feature.
     */
    unregister(id: string): void;
    /**
     * Called when the client is stopped to dispose this feature. Usually a feature
     * unregisters listeners registerd hooked up with the VS Code extension host.
     */
    dispose(): void;
}
export interface NotificationFeature<T extends Function> {
    /**
     * Triggers the corresponding RPC method.
     */
    getProvider(document: TextDocument): {
        send: T;
    };
}
export interface TextDocumentProviderFeature<T> {
    /**
     * Triggers the corresponding RPC method.
     */
    getProvider(textDocument: TextDocument): T;
}
export declare abstract class TextDocumentFeature<PO, RO extends TextDocumentRegistrationOptions & PO, PR> implements DynamicFeature<RO> {
    protected _client: BaseLanguageClient;
    private _message;
    private _registrations;
    constructor(_client: BaseLanguageClient, _message: RPCMessageType);
    get messages(): RPCMessageType;
    abstract fillClientCapabilities(capabilities: ClientCapabilities): void;
    abstract initialize(capabilities: ServerCapabilities, documentSelector: DocumentSelector): void;
    register(message: RPCMessageType, data: RegistrationData<RO>): void;
    protected abstract registerLanguageProvider(options: RO): [Disposable, PR];
    unregister(id: string): void;
    dispose(): void;
    protected getRegistration(documentSelector: DocumentSelector | undefined, capability: undefined | PO | (RO & StaticRegistrationOptions)): [string | undefined, (RO & {
        documentSelector: DocumentSelector;
    }) | undefined];
    protected getRegistrationOptions(documentSelector: DocumentSelector | undefined, capability: undefined | PO): (RO & {
        documentSelector: DocumentSelector;
    }) | undefined;
    getProvider(textDocument: TextDocument): PR;
}
export interface WorkspaceProviderFeature<PR> {
    getProviders(): PR[];
}
export interface ProvideResolveFeature<T1 extends Function, T2 extends Function> {
    provide: T1;
    resolve: T2;
}
export interface MessageTransports {
    reader: MessageReader;
    writer: MessageWriter;
    detached?: boolean;
}
export declare namespace MessageTransports {
    function is(value: any): value is MessageTransports;
}
export declare abstract class BaseLanguageClient {
    private _id;
    private _name;
    private _clientOptions;
    protected _state: ClientState;
    private _onReady;
    private _onReadyCallbacks;
    private _onStop;
    private _connectionPromise;
    private _resolvedConnection;
    private _initializeResult;
    private _outputChannel;
    private _capabilities;
    private _listeners;
    private _providers;
    private _diagnostics;
    private _syncedDocuments;
    private _fileEvents;
    private _fileEventDelayer;
    private _stateChangeEmitter;
    private _traceFormat;
    private _trace;
    private _tracer;
    constructor(id: string, name: string, clientOptions: LanguageClientOptions);
    private get state();
    get id(): string;
    get name(): string;
    private set state(value);
    getPublicState(): State;
    get initializeResult(): InitializeResult | undefined;
    sendRequest<R, E, RO>(type: RequestType0<R, E, RO>, token?: CancellationToken): Promise<R>;
    sendRequest<P, R, E, RO>(type: RequestType<P, R, E, RO>, params: P, token?: CancellationToken): Promise<R>;
    sendRequest<R>(method: string, token?: CancellationToken): Promise<R>;
    sendRequest<R>(method: string, param: any, token?: CancellationToken): Promise<R>;
    onRequest<R, E, RO>(type: RequestType0<R, E, RO>, handler: RequestHandler0<R, E>): void;
    onRequest<P, R, E, RO>(type: RequestType<P, R, E, RO>, handler: RequestHandler<P, R, E>): void;
    onRequest<R, E>(method: string, handler: GenericRequestHandler<R, E>): void;
    sendNotification<RO>(type: NotificationType0<RO>): void;
    sendNotification<P, RO>(type: NotificationType<P, RO>, params?: P): void;
    sendNotification(method: string): void;
    sendNotification(method: string, params: any): void;
    onNotification<RO>(type: NotificationType0<RO>, handler: NotificationHandler0): void;
    onNotification<P, RO>(type: NotificationType<P, RO>, handler: NotificationHandler<P>): void;
    onNotification(method: string, handler: GenericNotificationHandler): void;
    onProgress<P>(type: ProgressType<P>, token: string | number, handler: NotificationHandler<P>): Disposable;
    sendProgress<P>(type: ProgressType<P>, token: string | number, value: P): void;
    get clientOptions(): LanguageClientOptions;
    get onDidChangeState(): Event<StateChangeEvent>;
    get outputChannel(): OutputChannel;
    get diagnostics(): DiagnosticCollection | undefined;
    createDefaultErrorHandler(): ErrorHandler;
    set trace(value: Trace);
    private logObjectTrace;
    private data2String;
    private _appendOutput;
    info(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, data?: any): void;
    private logTrace;
    needsStart(): boolean;
    needsStop(): boolean;
    onReady(): Promise<void>;
    get started(): boolean;
    private isConnectionActive;
    start(): Disposable;
    private resolveConnection;
    private resolveRootPath;
    private initialize;
    private doInitialize;
    stop(): Promise<void>;
    private cleanUp;
    private cleanUpChannel;
    private notifyFileEvent;
    private handleDiagnostics;
    private setDiagnostics;
    protected abstract createMessageTransports(encoding: string): Promise<MessageTransports | null>;
    private createConnection;
    protected handleConnectionClosed(): void;
    restart(): void;
    private handleConnectionError;
    private hookConfigurationChanged;
    private refreshTrace;
    private hookFileEvents;
    private readonly _features;
    private readonly _method2Message;
    private readonly _dynamicFeatures;
    registerFeatures(features: (StaticFeature | DynamicFeature<any>)[]): void;
    registerFeature(feature: StaticFeature | DynamicFeature<any>): void;
    getFeature(request: typeof DidOpenTextDocumentNotification.method): DynamicFeature<TextDocumentRegistrationOptions> & NotificationFeature<(textDocument: TextDocument) => void>;
    getFeature(request: typeof DidChangeTextDocumentNotification.method): DynamicFeature<TextDocumentRegistrationOptions> & NotificationFeature<(textDocument: TextDocument) => void>;
    getFeature(request: typeof WillSaveTextDocumentNotification.method): DynamicFeature<TextDocumentRegistrationOptions> & NotificationFeature<(textDocument: TextDocument) => void>;
    getFeature(request: typeof WillSaveTextDocumentWaitUntilRequest.method): DynamicFeature<TextDocumentRegistrationOptions> & NotificationFeature<(textDocument: TextDocument) => ProviderResult<TextEdit[]>>;
    getFeature(request: typeof DidSaveTextDocumentNotification.method): DynamicFeature<TextDocumentRegistrationOptions> & NotificationFeature<(textDocument: TextDocument) => void>;
    getFeature(request: typeof DidCloseTextDocumentNotification.method): DynamicFeature<TextDocumentRegistrationOptions> & NotificationFeature<(textDocument: TextDocument) => void>;
    getFeature(request: typeof CompletionRequest.method): DynamicFeature<TextDocumentRegistrationOptions> & TextDocumentProviderFeature<CompletionItemProvider>;
    getFeature(request: typeof HoverRequest.method): DynamicFeature<TextDocumentRegistrationOptions> & TextDocumentProviderFeature<HoverProvider>;
    getFeature(request: typeof SignatureHelpRequest.method): DynamicFeature<TextDocumentRegistrationOptions> & TextDocumentProviderFeature<SignatureHelpProvider>;
    getFeature(request: typeof DefinitionRequest.method): DynamicFeature<TextDocumentRegistrationOptions> & TextDocumentProviderFeature<DefinitionProvider>;
    getFeature(request: typeof ReferencesRequest.method): DynamicFeature<TextDocumentRegistrationOptions> & TextDocumentProviderFeature<ReferenceProvider>;
    getFeature(request: typeof DocumentHighlightRequest.method): DynamicFeature<TextDocumentRegistrationOptions> & TextDocumentProviderFeature<DocumentHighlightProvider>;
    getFeature(request: typeof CodeActionRequest.method): DynamicFeature<TextDocumentRegistrationOptions> & TextDocumentProviderFeature<CodeActionProvider>;
    getFeature(request: typeof DocumentFormattingRequest.method): DynamicFeature<TextDocumentRegistrationOptions> & TextDocumentProviderFeature<DocumentFormattingEditProvider>;
    getFeature(request: typeof DocumentRangeFormattingRequest.method): DynamicFeature<TextDocumentRegistrationOptions> & TextDocumentProviderFeature<DocumentRangeFormattingEditProvider>;
    getFeature(request: typeof DocumentOnTypeFormattingRequest.method): DynamicFeature<TextDocumentRegistrationOptions> & TextDocumentProviderFeature<OnTypeFormattingEditProvider>;
    getFeature(request: typeof RenameRequest.method): DynamicFeature<TextDocumentRegistrationOptions> & TextDocumentProviderFeature<RenameProvider>;
    getFeature(request: typeof DocumentLinkRequest.method): DynamicFeature<TextDocumentRegistrationOptions> & TextDocumentProviderFeature<DocumentLinkProvider>;
    getFeature(request: typeof DocumentColorRequest.method): DynamicFeature<TextDocumentRegistrationOptions> & TextDocumentProviderFeature<DocumentColorProvider>;
    getFeature(request: typeof DeclarationRequest.method): DynamicFeature<TextDocumentRegistrationOptions> & TextDocumentProviderFeature<DeclarationProvider>;
    getFeature(request: typeof FoldingRangeRequest.method): DynamicFeature<TextDocumentRegistrationOptions> & TextDocumentProviderFeature<FoldingRangeProvider>;
    getFeature(request: typeof ImplementationRequest.method): DynamicFeature<TextDocumentRegistrationOptions> & TextDocumentProviderFeature<ImplementationProvider>;
    getFeature(request: typeof SelectionRangeRequest.method): DynamicFeature<TextDocumentRegistrationOptions> & TextDocumentProviderFeature<SelectionRangeProvider>;
    getFeature(request: typeof TypeDefinitionRequest.method): DynamicFeature<TextDocumentRegistrationOptions> & TextDocumentProviderFeature<TypeDefinitionProvider>;
    getFeature(request: typeof Proposed.CallHierarchyPrepareRequest.method): DynamicFeature<TextDocumentRegistrationOptions> & TextDocumentProviderFeature<TypeDefinitionProvider>;
    getFeature(request: typeof WorkspaceSymbolRequest.method): DynamicFeature<TextDocumentRegistrationOptions> & WorkspaceProviderFeature<WorkspaceSymbolProvider>;
    protected registerBuiltinFeatures(): void;
    private fillInitializeParams;
    private computeClientCapabilities;
    private initializeFeatures;
    private handleRegistrationRequest;
    private handleUnregistrationRequest;
    private handleApplyWorkspaceEdit;
    logFailedRequest(type: RPCMessageType, error: any): void;
}
