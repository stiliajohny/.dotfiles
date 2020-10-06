import { Neovim } from '@chemzqm/neovim';
import { Documentation, Fragment } from '../types';
export interface Dimension {
    width: number;
    height: number;
}
export default class FloatBuffer {
    private nvim;
    private lines;
    private highlights;
    private positions;
    private enableHighlight;
    private highlightTimeout;
    private filetype;
    constructor(nvim: Neovim);
    setDocuments(docs: Documentation[], width: number): Promise<void>;
    splitFragment(fragment: Fragment, defaultFileType: string): Fragment[];
    setLines(bufnr: number, winid?: number): void;
    private calculateFragments;
    static getDimension(docs: Documentation[], maxWidth: number, maxHeight: number): Dimension;
}
