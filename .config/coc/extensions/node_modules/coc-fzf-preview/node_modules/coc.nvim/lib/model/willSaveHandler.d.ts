import { Disposable } from 'vscode-languageserver-protocol';
import { IWorkspace, TextDocumentWillSaveEvent } from '../types';
export declare type Callback = (event: TextDocumentWillSaveEvent) => void;
export declare type PromiseCallback = (event: TextDocumentWillSaveEvent) => Promise<void>;
export default class WillSaveUntilHandler {
    private workspace;
    private callbacks;
    constructor(workspace: IWorkspace);
    addCallback(callback: Callback, thisArg: any, clientId: string): Disposable;
    get hasCallback(): boolean;
    handeWillSaveUntil(event: TextDocumentWillSaveEvent): Promise<void>;
}
