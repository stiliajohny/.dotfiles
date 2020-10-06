import { Disposable } from 'vscode-languageserver-protocol';
import Source from '../model/source';
import { CompleteOption, CompleteResult, ISource, VimCompleteItem } from '../types';
export default class File extends Source {
    constructor();
    private resolveEnvVariables;
    private getPathOption;
    private getFileItem;
    filterFiles(files: string[]): string[];
    getItemsFromRoot(pathstr: string, root: string): Promise<VimCompleteItem[]>;
    get trimSameExts(): string[];
    doComplete(opt: CompleteOption): Promise<CompleteResult>;
}
export declare function regist(sourceMap: Map<string, ISource>): Disposable;
