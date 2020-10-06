import { CancellationToken, ClientCapabilities, Definition, Disposable, DocumentSelector, ImplementationOptions, ImplementationRegistrationOptions, Position, ServerCapabilities } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { ImplementationProvider, ProviderResult } from '../provider';
import { BaseLanguageClient, TextDocumentFeature } from './client';
export interface ProvideImplementationSignature {
    (this: void, document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Definition>;
}
export interface ImplementationMiddleware {
    provideImplementation?: (this: void, document: TextDocument, position: Position, token: CancellationToken, next: ProvideImplementationSignature) => ProviderResult<Definition>;
}
export declare class ImplementationFeature extends TextDocumentFeature<boolean | ImplementationOptions, ImplementationRegistrationOptions, ImplementationProvider> {
    constructor(client: BaseLanguageClient);
    fillClientCapabilities(capabilites: ClientCapabilities): void;
    initialize(capabilities: ServerCapabilities, documentSelector: DocumentSelector): void;
    protected registerLanguageProvider(options: ImplementationRegistrationOptions): [Disposable, ImplementationProvider];
}
