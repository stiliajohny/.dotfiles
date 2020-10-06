import { CancellationToken, ClientCapabilities, Declaration, DeclarationOptions, DeclarationRegistrationOptions, Disposable, DocumentSelector, Position, ServerCapabilities } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DeclarationProvider, ProviderResult } from '../provider';
import { BaseLanguageClient, TextDocumentFeature } from './client';
export interface ProvideDeclarationSignature {
    (this: void, document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Declaration>;
}
export interface DeclarationMiddleware {
    provideDeclaration?: (this: void, document: TextDocument, position: Position, token: CancellationToken, next: ProvideDeclarationSignature) => ProviderResult<Declaration>;
}
export declare class DeclarationFeature extends TextDocumentFeature<boolean | DeclarationOptions, DeclarationRegistrationOptions, DeclarationProvider> {
    constructor(client: BaseLanguageClient);
    fillClientCapabilities(capabilites: ClientCapabilities): void;
    initialize(capabilities: ServerCapabilities, documentSelector: DocumentSelector): void;
    protected registerLanguageProvider(options: DeclarationRegistrationOptions): [Disposable, DeclarationProvider];
}
