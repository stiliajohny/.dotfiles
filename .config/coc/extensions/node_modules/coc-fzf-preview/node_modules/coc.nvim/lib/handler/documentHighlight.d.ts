import { Neovim } from '@chemzqm/neovim';
import Colors from './colors';
import Document from '../model/document';
import { DocumentHighlight } from 'vscode-languageserver-protocol';
export default class DocumentHighlighter {
    private nvim;
    private colors;
    private disposables;
    private matchIds;
    private cursorMoveTs;
    constructor(nvim: Neovim, colors: Colors);
    clearHighlight(): void;
    highlight(bufnr: number): Promise<void>;
    getHighlights(document: Document | null): Promise<DocumentHighlight[]>;
    dispose(): void;
}
