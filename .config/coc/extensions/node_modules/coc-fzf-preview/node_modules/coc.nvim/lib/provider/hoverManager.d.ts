import { CancellationToken, Disposable, DocumentSelector, Hover, Position } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { HoverProvider } from './index';
import Manager from './manager';
export default class HoverManager extends Manager<HoverProvider> implements Disposable {
    register(selector: DocumentSelector, provider: HoverProvider): Disposable;
    provideHover(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover[] | null>;
    dispose(): void;
}
