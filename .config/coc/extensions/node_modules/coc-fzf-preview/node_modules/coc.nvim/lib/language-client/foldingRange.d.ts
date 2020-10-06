import { CancellationToken, ClientCapabilities, Disposable, DocumentSelector, FoldingRange, FoldingRangeOptions, FoldingRangeRegistrationOptions, ServerCapabilities } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { FoldingContext, FoldingRangeProvider, ProviderResult } from '../provider';
import { BaseLanguageClient, TextDocumentFeature } from './client';
export declare type ProvideFoldingRangeSignature = (this: void, document: TextDocument, context: FoldingContext, token: CancellationToken) => ProviderResult<FoldingRange[]>;
export interface FoldingRangeProviderMiddleware {
    provideFoldingRanges?: (this: void, document: TextDocument, context: FoldingContext, token: CancellationToken, next: ProvideFoldingRangeSignature) => ProviderResult<FoldingRange[]>;
}
export declare class FoldingRangeFeature extends TextDocumentFeature<boolean | FoldingRangeOptions, FoldingRangeRegistrationOptions, FoldingRangeProvider> {
    constructor(client: BaseLanguageClient);
    fillClientCapabilities(capabilites: ClientCapabilities): void;
    initialize(capabilities: ServerCapabilities, documentSelector: DocumentSelector): void;
    protected registerLanguageProvider(options: FoldingRangeRegistrationOptions): [Disposable, FoldingRangeProvider];
}
