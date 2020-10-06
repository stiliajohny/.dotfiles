import { CancellationToken, Disposable, DocumentSelector, Location, Position, LocationLink } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DeclarationProvider } from './index';
import Manager from './manager';
export default class DeclarationManager extends Manager<DeclarationProvider> implements Disposable {
    register(selector: DocumentSelector, provider: DeclarationProvider): Disposable;
    provideDeclaration(document: TextDocument, position: Position, token: CancellationToken): Promise<Location[] | Location | LocationLink[] | null>;
    dispose(): void;
}
