/// <reference types="node" />
import { EventEmitter } from 'events';
import { Neovim } from '@chemzqm/neovim';
import { Disposable } from 'vscode-languageserver-protocol';
export declare enum State {
    Waiting = 0,
    Faild = 1,
    Progressing = 2,
    Success = 3
}
export default class InstallBuffer extends EventEmitter implements Disposable {
    private isUpdate;
    private isSync;
    private silent;
    private statMap;
    private messagesMap;
    private names;
    private interval;
    bufnr: number;
    constructor(isUpdate?: boolean, isSync?: boolean, silent?: boolean);
    setExtensions(names: string[]): void;
    addMessage(name: string, msg: string): void;
    startProgress(names: string[]): void;
    finishProgress(name: string, succeed?: boolean): void;
    get remains(): number;
    private getLines;
    getMessages(line: number): string[];
    private draw;
    highlight(nvim: Neovim): void;
    show(nvim: Neovim): Promise<void>;
    dispose(): void;
}
