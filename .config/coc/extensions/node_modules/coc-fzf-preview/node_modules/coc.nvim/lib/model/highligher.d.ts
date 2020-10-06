import { Buffer } from '@chemzqm/neovim';
export interface HighlightItem {
    line: number;
    colStart: number;
    colEnd?: number;
    hlGroup: string;
}
/**
 * Build highlights, with lines and highlights
 */
export default class Highlighter {
    private srcId;
    private lines;
    private highlights;
    constructor(srcId?: number);
    addLine(line: string, hlGroup?: string): void;
    addLines(lines: any): void;
    addText(text: string, hlGroup?: string): void;
    get length(): number;
    getline(line: number): string;
    render(buffer: Buffer, start?: number, end?: number): void;
}
