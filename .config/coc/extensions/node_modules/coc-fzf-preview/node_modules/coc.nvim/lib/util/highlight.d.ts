export interface Highlight {
    line: number;
    colStart: number;
    colEnd: number;
    hlGroup: string;
    isMarkdown?: boolean;
}
export declare const diagnosticFiletypes: string[];
export declare function getHiglights(lines: string[], filetype: string, timeout?: number): Promise<Highlight[]>;
