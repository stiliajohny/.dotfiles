import { SelectionRange, CancellationToken, Disposable, DocumentSelector, Position } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { SelectionRangeProvider } from './index';
import Manager from './manager';
export default class SelectionRangeManager extends Manager<SelectionRangeProvider> implements Disposable {
    register(selector: DocumentSelector, provider: SelectionRangeProvider): Disposable;
    provideSelectionRanges(document: TextDocument, positions: Position[], token: CancellationToken): Promise<SelectionRange[] | null>;
    dispose(): void;
}
