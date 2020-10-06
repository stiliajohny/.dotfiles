import { Buffer } from '@chemzqm/neovim';
import { Location, Range, WorkspaceEdit } from 'vscode-languageserver-types';
import Document from '../model/document';
export interface LineChange {
    lnum: number;
    delta: number;
}
export interface FileRange {
    lnum?: number;
    start: number;
    end: number;
    highlights?: Range[];
    lines?: string[];
}
export interface FileChange {
    lnum: number;
    start?: number;
    end?: number;
    filepath: string;
    lines: string[];
}
export interface FileItem {
    filepath: string;
    ranges: FileRange[];
}
export interface RefactorConfig {
    openCommand: string;
    beforeContext: number;
    afterContext: number;
}
export default class Refactor {
    private nvim;
    private cwd;
    private bufnr;
    private winid;
    private srcId;
    private version;
    private fromWinid;
    private changing;
    private matchIds;
    private disposables;
    private fileItems;
    readonly config: RefactorConfig;
    constructor();
    get buffer(): Buffer;
    get document(): Document | null;
    valid(): Promise<boolean>;
    /**
     * Start refactor from workspaceEdit
     */
    fromWorkspaceEdit(edit: WorkspaceEdit, filetype?: string): Promise<void>;
    fromLines(lines: string[]): Promise<void>;
    /**
     * Create initialized refactor buffer
     */
    createRefactorBuffer(filetype?: string): Promise<Buffer>;
    /**
     * Add FileItem to refactor buffer.
     */
    addFileItems(items: FileItem[]): Promise<void>;
    private ensureDocument;
    /**
     * Use conceal to add lineNr
     */
    private highlightLineNr;
    /**
     * Current changed file ranges
     */
    getFileChanges(): Promise<FileChange[]>;
    /**
     * Save changes to files, return false when no change made.
     */
    saveRefactor(): Promise<boolean>;
    getFileRange(lnum: number): FileRange;
    private onBufferChange;
    /**
     * Edit range of FileRange
     */
    private getFileRangeRange;
    /**
     * Open line under cursor in split window
     */
    splitOpen(): Promise<void>;
    private onRefactorChange;
    private getItemsFromWorkspaceEdit;
    private getLineCount;
    private getLines;
    private getLinesRange;
    dispose(): void;
    /**
     * Refactor from workspaceEdit.
     */
    static createFromWorkspaceEdit(edit: WorkspaceEdit, filetype?: string): Promise<Refactor>;
    /**
     * Refactor from locations.
     */
    static createFromLocations(locations: Location[], filetype?: string): Promise<Refactor>;
    static createFromLines(lines: string[]): Promise<Refactor>;
}
