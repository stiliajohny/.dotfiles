import { Buffer, Neovim } from '@chemzqm/neovim';
import { CancellationToken, Event, Position, Range, TextEdit } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DidChangeTextDocumentParams, Env } from '../types';
import { Chars } from './chars';
export declare type LastChangeType = 'insert' | 'change' | 'delete';
export default class Document {
    readonly buffer: Buffer;
    private env;
    private maxFileSize;
    buftype: string;
    isIgnored: boolean;
    chars: Chars;
    textDocument: TextDocument;
    fireContentChanges: Function & {
        clear(): void;
    };
    fetchContent: Function & {
        clear(): void;
    };
    private colorId;
    private size;
    private nvim;
    private eol;
    private variables;
    private lines;
    private _attached;
    private _previewwindow;
    private _winid;
    private _filetype;
    private _uri;
    private _changedtick;
    private _words;
    private _onDocumentChange;
    private _onDocumentDetach;
    private disposables;
    readonly onDocumentChange: Event<DidChangeTextDocumentParams>;
    readonly onDocumentDetach: Event<number>;
    constructor(buffer: Buffer, env: Env, maxFileSize: number | null);
    /**
     * Check if current document should be attached for changes.
     *
     * Currently only attach for empty and `acwrite` buftype.
     */
    get shouldAttach(): boolean;
    get isCommandLine(): boolean;
    get enabled(): boolean;
    /**
     * All words, extracted by `iskeyword` option.
     */
    get words(): string[];
    /**
     * Map filetype for languageserver.
     */
    convertFiletype(filetype: string): string;
    /**
     * Get current buffer changedtick.
     */
    get changedtick(): number;
    /**
     * Scheme of document.
     */
    get schema(): string;
    /**
     * Line count of current buffer.
     */
    get lineCount(): number;
    /**
     * Window ID when buffer create, could be -1 when no window associated.
     */
    get winid(): number;
    /**
     * Returns if current document is opended with previewwindow
     */
    get previewwindow(): boolean;
    /**
     * Initialize document model.
     *
     * @internal
     */
    init(nvim: Neovim, token: CancellationToken): Promise<boolean>;
    private attach;
    private onChange;
    /**
     * Make sure current document synced correctly
     */
    checkDocument(): Promise<void>;
    /**
     * Check if document changed after last synchronize
     */
    get dirty(): boolean;
    private _fireContentChanges;
    /**
     * Buffer number
     */
    get bufnr(): number;
    /**
     * Content of textDocument.
     */
    get content(): string;
    /**
     * Coverted filetype.
     */
    get filetype(): string;
    get uri(): string;
    get version(): number;
    applyEdits(edits: TextEdit[]): Promise<void>;
    changeLines(lines: [number, string][], sync?: boolean, check?: boolean): void;
    /**
     * Force document synchronize and emit change event when necessary.
     */
    forceSync(): void;
    /**
     * Get offset from lnum & col
     */
    getOffset(lnum: number, col: number): number;
    /**
     * Check string is word.
     */
    isWord(word: string): boolean;
    /**
     * Generate more words by split word with `-`
     */
    getMoreWords(): string[];
    /**
     * Current word for replacement
     */
    getWordRangeAtPosition(position: Position, extraChars?: string, current?: boolean): Range | null;
    private gitCheck;
    private createDocument;
    private _fetchContent;
    /**
     * Get and synchronize change
     */
    patchChange(currentLine?: boolean): Promise<void>;
    /**
     * Get ranges of word in textDocument.
     */
    getSymbolRanges(word: string): Range[];
    /**
     * Adjust col with new valid character before position.
     */
    fixStartcol(position: Position, valids: string[]): number;
    /**
     * Use matchaddpos for highlight ranges, must use `redraw` command on vim
     */
    matchAddRanges(ranges: Range[], hlGroup: string, priority?: number): number[];
    /**
     * Highlight ranges in document, return match id list.
     *
     * Note: match id could by namespace id or vim's match id.
     */
    highlightRanges(ranges: Range[], hlGroup: string, srcId: number, priority?: number): number[];
    /**
     * Clear match id list, for vim support namespace, list should be namespace id list.
     */
    clearMatchIds(ids: Set<number> | number[]): void;
    /**
     * Get cwd of this document.
     */
    getcwd(): Promise<string>;
    /**
     * Real current line
     */
    getline(line: number, current?: boolean): string;
    /**
     * Get lines, zero indexed, end exclude.
     */
    getLines(start: number, end: number): string[];
    /**
     * Get current content text.
     */
    getDocumentContent(): string;
    /**
     * Get variable value by key, defined by `b:coc_{key}`
     */
    getVar<T>(key: string, defaultValue?: T): T;
    /**
     * Get position from lnum & col
     */
    getPosition(lnum: number, col: number): Position;
    /**
     * Get end offset from cursor position.
     * For normal mode, use offset -1 when possible
     */
    getEndOffset(lnum: number, col: number, insert: boolean): number;
    /**
     * Recreate document with new filetype.
     *
     * @internal
     */
    setFiletype(filetype: string): void;
    /**
     * Change iskeyword option of document
     *
     * @internal
     */
    setIskeyword(iskeyword: string): void;
    /**
     * Detach document.
     *
     * @internal
     */
    detach(): void;
    get attached(): boolean;
    /**
     * Get localify bonus map.
     *
     * @internal
     */
    getLocalifyBonus(sp: Position, ep: Position): Map<string, number>;
}
