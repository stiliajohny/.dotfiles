import { Neovim } from '@chemzqm/neovim';
import { OutputChannel } from '../types';
export default class BufferChannel implements OutputChannel {
    name: string;
    private nvim;
    private _content;
    private disposables;
    private _showing;
    private promise;
    constructor(name: string, nvim: Neovim);
    get content(): string;
    private _append;
    append(value: string): void;
    appendLine(value: string): void;
    clear(keep?: number): void;
    hide(): void;
    dispose(): void;
    private get buffer();
    private openBuffer;
    show(preserveFocus?: boolean): void;
}
