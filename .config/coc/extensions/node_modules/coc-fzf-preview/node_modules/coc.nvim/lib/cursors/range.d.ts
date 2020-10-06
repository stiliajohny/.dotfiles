import { Range, TextEdit } from 'vscode-languageserver-types';
export default class TextRange {
    line: number;
    readonly start: number;
    readonly end: number;
    text: string;
    preCount: number;
    private currStart;
    private currEnd;
    constructor(line: number, start: number, end: number, text: string, preCount: number);
    add(offset: number, add: string): void;
    replace(begin: number, end: number, add?: string): void;
    get range(): Range;
    get currRange(): Range;
    applyEdit(edit: TextEdit): void;
    get textEdit(): TextEdit;
}
