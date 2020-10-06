import { CancellationToken, ClientCapabilities, Definition, Disposable, DocumentSelector, Position, ServerCapabilities, TypeDefinitionOptions, TypeDefinitionRegistrationOptions } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { ProviderResult, TypeDefinitionProvider } from '../provider';
import { BaseLanguageClient, TextDocumentFeature } from './client';
export interface ProvideTypeDefinitionSignature {
    (this: void, document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Definition>;
}
export interface TypeDefinitionMiddleware {
    provideTypeDefinition?: (this: void, document: TextDocument, position: Position, token: CancellationToken, next: ProvideTypeDefinitionSignature) => ProviderResult<Definition>;
}
export declare class TypeDefinitionFeature extends TextDocumentFeature<boolean | TypeDefinitionOptions, TypeDefinitionRegistrationOptions, TypeDefinitionProvider> {
    constructor(client: BaseLanguageClient);
    fillClientCapabilities(capabilites: ClientCapabilities): void;
    initialize(capabilities: ServerCapabilities, documentSelector: DocumentSelector): void;
    protected registerLanguageProvider(options: TypeDefinitionRegistrationOptions): [Disposable, TypeDefinitionProvider];
}
