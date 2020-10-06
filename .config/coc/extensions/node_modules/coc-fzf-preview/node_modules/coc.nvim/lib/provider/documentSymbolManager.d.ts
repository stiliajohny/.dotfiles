import { CancellationToken, Disposable, DocumentSelector, DocumentSymbol, SymbolInformation } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DocumentSymbolProvider } from './index';
import Manager from './manager';
export default class DocumentSymbolManager extends Manager<DocumentSymbolProvider> implements Disposable {
    register(selector: DocumentSelector, provider: DocumentSymbolProvider): Disposable;
    provideDocumentSymbols(document: TextDocument, token: CancellationToken): Promise<SymbolInformation[] | DocumentSymbol[]>;
    dispose(): void;
}
