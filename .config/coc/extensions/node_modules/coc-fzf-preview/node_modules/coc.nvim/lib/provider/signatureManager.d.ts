import { CancellationToken, Disposable, DocumentSelector, Position, SignatureHelp } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { SignatureHelpProvider } from './index';
import Manager from './manager';
export default class SignatureManager extends Manager<SignatureHelpProvider> implements Disposable {
    register(selector: DocumentSelector, provider: SignatureHelpProvider, triggerCharacters?: string[]): Disposable;
    shouldTrigger(document: TextDocument, triggerCharacter: string): boolean;
    provideSignatureHelp(document: TextDocument, position: Position, token: CancellationToken): Promise<SignatureHelp | null>;
    dispose(): void;
}
