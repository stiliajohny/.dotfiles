import { CancellationToken, Disposable, DocumentSelector, FormattingOptions, Range, TextEdit } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DocumentRangeFormattingEditProvider } from './index';
import Manager from './manager';
export default class FormatRangeManager extends Manager<DocumentRangeFormattingEditProvider> implements Disposable {
    register(selector: DocumentSelector, provider: DocumentRangeFormattingEditProvider, priority?: number): Disposable;
    provideDocumentRangeFormattingEdits(document: TextDocument, range: Range, options: FormattingOptions, token: CancellationToken): Promise<TextEdit[]>;
    dispose(): void;
}
