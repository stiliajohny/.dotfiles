import { CancellationToken, Disposable, DocumentSelector, Position, Range, WorkspaceEdit } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { RenameProvider } from './index';
import Manager from './manager';
export default class RenameManager extends Manager<RenameProvider> implements Disposable {
    register(selector: DocumentSelector, provider: RenameProvider): Disposable;
    provideRenameEdits(document: TextDocument, position: Position, newName: string, token: CancellationToken): Promise<WorkspaceEdit | null>;
    prepareRename(document: TextDocument, position: Position, token: CancellationToken): Promise<Range | {
        range: Range;
        placeholder: string;
    } | false>;
    dispose(): void;
}
