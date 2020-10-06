import { CancellationToken } from 'vscode-jsonrpc';
import { Documentation, PumBounding } from '../types';
export interface FloatingConfig {
    srcId: number;
    maxPreviewWidth: number;
    enable: boolean;
}
export default class Floating {
    private winid;
    private bufnr;
    private floatBuffer;
    private config;
    constructor();
    show(docs: Documentation[], bounding: PumBounding, token: CancellationToken): Promise<void>;
    private showDocumentationFloating;
    close(): void;
    private calculateBounding;
}
