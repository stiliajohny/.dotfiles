import { ChangedLines } from '../types';
interface Change {
    start: number;
    end: number;
    newText: string;
}
export declare function diffLines(oldLines: string[], newLines: string[]): ChangedLines;
export declare function getChange(oldStr: string, newStr: string, cursorEnd?: number): Change;
export declare function patchLine(from: string, to: string, fill?: string): string;
export {};
