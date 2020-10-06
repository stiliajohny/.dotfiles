import { Neovim } from '@chemzqm/neovim';
import { Range } from 'vscode-languageserver-types';
export default class Cursors {
    private nvim;
    private _activated;
    private _changed;
    private ranges;
    private disposables;
    private bufnr;
    private winid;
    private matchIds;
    private textDocument;
    private changing;
    private config;
    constructor(nvim: Neovim);
    private loadConfig;
    select(bufnr: number, kind: string, mode: string): Promise<void>;
    private activate;
    private doHighlights;
    cancel(): void;
    private unmap;
    addRanges(ranges: Range[]): Promise<void>;
    get activated(): boolean;
    /**
     * Find single range from edit
     */
    private getTextRange;
    private applySingleEdit;
    private applyComposedEdit;
    private adjustChange;
    private addRange;
    private get lastPosition();
    private get firstPosition();
}
