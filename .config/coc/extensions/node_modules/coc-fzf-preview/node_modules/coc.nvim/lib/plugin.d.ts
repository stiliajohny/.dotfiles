/// <reference types="node" />
import { NeovimClient as Neovim } from '@chemzqm/neovim';
import { EventEmitter } from 'events';
export default class Plugin extends EventEmitter {
    nvim: Neovim;
    private _ready;
    private handler;
    private infoChannel;
    private cursors;
    private actions;
    constructor(nvim: Neovim);
    private addAction;
    addCommand(cmd: {
        id: string;
        cmd: string;
        title?: string;
    }): void;
    init(): Promise<void>;
    get isReady(): boolean;
    get ready(): Promise<void>;
    private get version();
    hasAction(method: string): boolean;
    cocAction(method: string, ...args: any[]): Promise<any>;
    dispose(): void;
}
