import { Disposable, CancellationToken } from 'vscode-languageserver-protocol';
import { CompleteOption, ISource, SourceStat, VimCompleteItem, SourceConfig } from './types';
export declare class Sources {
    private sourceMap;
    private disposables;
    private remoteSourcePaths;
    private get nvim();
    private createNativeSources;
    private createVimSourceExtension;
    private createRemoteSources;
    private createVimSources;
    init(): void;
    get names(): string[];
    get sources(): ISource[];
    has(name: any): boolean;
    getSource(name: string): ISource | null;
    doCompleteResolve(item: VimCompleteItem, token: CancellationToken): Promise<void>;
    doCompleteDone(item: VimCompleteItem, opt: CompleteOption): Promise<void>;
    shouldCommit(item: VimCompleteItem, commitCharacter: string): boolean;
    getCompleteSources(opt: CompleteOption): ISource[];
    /**
     * Get sources should be used without trigger.
     *
     * @param {string} filetype
     * @returns {ISource[]}
     */
    getNormalSources(filetype: string): ISource[];
    private checkTrigger;
    shouldTrigger(pre: string, languageId: string): boolean;
    getTriggerSources(pre: string, languageId: string): ISource[];
    addSource(source: ISource): Disposable;
    removeSource(source: ISource | string): void;
    refresh(name?: string): Promise<void>;
    toggleSource(name: string): void;
    sourceStats(): SourceStat[];
    private onDocumentEnter;
    createSource(config: SourceConfig): Disposable;
    private disabledByLanguageId;
    dispose(): void;
}
declare const _default: Sources;
export default _default;
