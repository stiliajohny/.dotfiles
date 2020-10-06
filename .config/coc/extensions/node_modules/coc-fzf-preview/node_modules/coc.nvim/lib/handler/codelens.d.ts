import { NeovimClient as Neovim } from '@chemzqm/neovim';
import { CodeLens } from 'vscode-languageserver-protocol';
export interface CodeLensInfo {
    codeLenses: CodeLens[];
    version: number;
}
export default class CodeLensManager {
    private nvim;
    private separator;
    private subseparator;
    private srcId;
    private enabled;
    private fetching;
    private disposables;
    private codeLensMap;
    private resolveCodeLens;
    constructor(nvim: Neovim);
    private setConfiguration;
    private fetchDocumentCodeLenses;
    private setVirtualText;
    private _resolveCodeLenses;
    doAction(): Promise<void>;
    private clear;
    private validDocument;
    private get version();
    dispose(): void;
}
