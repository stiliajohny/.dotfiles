import { CancellationToken, Disposable, DocumentSelector, Location, Position } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { TypeDefinitionProvider } from './index';
import Manager from './manager';
export default class TypeDefinitionManager extends Manager<TypeDefinitionProvider> implements Disposable {
    register(selector: DocumentSelector, provider: TypeDefinitionProvider): Disposable;
    provideTypeDefinition(document: TextDocument, position: Position, token: CancellationToken): Promise<Location[] | null>;
    dispose(): void;
}
