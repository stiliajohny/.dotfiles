import { CancellationToken, Disposable, DocumentSelector, FoldingRange } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { FoldingContext, FoldingRangeProvider } from './index';
import Manager from './manager';
export default class FoldingRangeManager extends Manager<FoldingRangeProvider> implements Disposable {
    register(selector: DocumentSelector, provider: FoldingRangeProvider): Disposable;
    provideFoldingRanges(document: TextDocument, context: FoldingContext, token: CancellationToken): Promise<FoldingRange[] | null>;
    dispose(): void;
}
