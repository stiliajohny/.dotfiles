import { CancellationToken, Disposable, DocumentSelector, Location, Position } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DefinitionProvider } from './index';
import Manager from './manager';
export default class DefinitionManager extends Manager<DefinitionProvider> implements Disposable {
    register(selector: DocumentSelector, provider: DefinitionProvider): Disposable;
    provideDefinition(document: TextDocument, position: Position, token: CancellationToken): Promise<Location[] | null>;
    dispose(): void;
}
