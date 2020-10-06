import { CancellationToken, ClientCapabilities, Disposable, DocumentSelector, Position, SelectionRange, SelectionRangeClientCapabilities, SelectionRangeOptions, SelectionRangeRegistrationOptions, ServerCapabilities } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { ProviderResult, SelectionRangeProvider } from '../provider';
import { BaseLanguageClient, TextDocumentFeature } from './client';
export interface ProvideSelectionRangeSignature {
    (this: void, document: TextDocument, positions: Position[], token: CancellationToken): ProviderResult<SelectionRange[]>;
}
export interface SelectionRangeProviderMiddleware {
    provideSelectionRanges?: (this: void, document: TextDocument, positions: Position[], token: CancellationToken, next: ProvideSelectionRangeSignature) => ProviderResult<SelectionRange[]>;
}
export declare class SelectionRangeFeature extends TextDocumentFeature<boolean | SelectionRangeOptions, SelectionRangeRegistrationOptions, SelectionRangeProvider> {
    constructor(client: BaseLanguageClient);
    fillClientCapabilities(capabilites: ClientCapabilities & SelectionRangeClientCapabilities): void;
    initialize(capabilities: ServerCapabilities, documentSelector: DocumentSelector): void;
    protected registerLanguageProvider(options: SelectionRangeRegistrationOptions): [Disposable, SelectionRangeProvider];
}
