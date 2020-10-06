import { ClientCapabilities, InitializeParams, RPCMessageType, ServerCapabilities, WorkspaceFolder, WorkspaceFoldersChangeEvent, WorkspaceFoldersRequest } from 'vscode-languageserver-protocol';
import { BaseLanguageClient, DynamicFeature, NextSignature, RegistrationData } from './client';
export interface WorkspaceFolderWorkspaceMiddleware {
    workspaceFolders?: WorkspaceFoldersRequest.MiddlewareSignature;
    didChangeWorkspaceFolders?: NextSignature<WorkspaceFoldersChangeEvent, void>;
}
export declare class WorkspaceFoldersFeature implements DynamicFeature<undefined> {
    private _client;
    private _listeners;
    private _initialFolders;
    constructor(_client: BaseLanguageClient);
    get messages(): RPCMessageType;
    private asProtocol;
    fillInitializeParams(params: InitializeParams): void;
    fillClientCapabilities(capabilities: ClientCapabilities): void;
    initialize(capabilities: ServerCapabilities): void;
    private doSendEvent;
    protected sendInitialEvent(currentWorkspaceFolders: WorkspaceFolder[] | undefined): void;
    register(_message: RPCMessageType, data: RegistrationData<undefined>): void;
    unregister(id: string): void;
    dispose(): void;
}
