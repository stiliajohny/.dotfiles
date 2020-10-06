import { AnsiItem, AnsiHighlight } from '../types';
export declare function parseAnsiHighlights(line: string): {
    line: string;
    highlights: AnsiHighlight[];
};
export declare function ansiparse(str: string): AnsiItem[];
