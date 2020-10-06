import { Position, Range, TextEdit } from 'vscode-languageserver-protocol';
import { VariableResolver } from './parser';
export interface CocSnippetPlaceholder {
    index: number;
    id: number;
    line: number;
    range: Range;
    value: string;
    isFinalTabstop: boolean;
    transform: boolean;
    isVariable: boolean;
    choice?: string[];
}
export declare class CocSnippet {
    private _snippetString;
    private position;
    private _variableResolver?;
    private _parser;
    private _placeholders;
    private tmSnippet;
    constructor(_snippetString: string, position: Position, _variableResolver?: VariableResolver);
    adjustPosition(characterCount: number, lineCount: number): void;
    adjustTextEdit(edit: TextEdit): boolean;
    get isPlainText(): boolean;
    get finalCount(): number;
    toString(): string;
    get range(): Range;
    get firstPlaceholder(): CocSnippetPlaceholder | null;
    get lastPlaceholder(): CocSnippetPlaceholder;
    getPlaceholderById(id: number): CocSnippetPlaceholder;
    getPlaceholder(index: number): CocSnippetPlaceholder;
    getPrevPlaceholder(index: number): CocSnippetPlaceholder;
    getNextPlaceholder(index: number): CocSnippetPlaceholder;
    get finalPlaceholder(): CocSnippetPlaceholder;
    getPlaceholderByRange(range: Range): CocSnippetPlaceholder;
    insertSnippet(placeholder: CocSnippetPlaceholder, snippet: string, range: Range): number;
    updatePlaceholder(placeholder: CocSnippetPlaceholder, edit: TextEdit): {
        edits: TextEdit[];
        delta: number;
    };
    private update;
}
