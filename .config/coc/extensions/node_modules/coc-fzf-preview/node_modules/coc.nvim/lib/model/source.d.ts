import { Neovim } from '@chemzqm/neovim';
import { CancellationToken } from 'vscode-languageserver-protocol';
import { CompleteOption, CompleteResult, ISource, SourceConfig, SourceType, VimCompleteItem } from '../types';
export default class Source implements ISource {
    readonly name: string;
    readonly filepath: string;
    readonly sourceType: SourceType;
    readonly isSnippet: boolean;
    protected readonly nvim: Neovim;
    private _disabled;
    private defaults;
    constructor(option: Partial<SourceConfig>);
    /**
     * Priority of source, higher priority makes items lower index.
     */
    get priority(): number;
    /**
     * When triggerOnly is true, not trigger completion on keyword character insert.
     */
    get triggerOnly(): boolean;
    get triggerCharacters(): string[];
    get optionalFns(): string[];
    get triggerPatterns(): RegExp[] | null;
    get shortcut(): string;
    get enable(): boolean;
    get filetypes(): string[] | null;
    get disableSyntaxes(): string[];
    getConfig<T>(key: string, defaultValue?: T): T | null;
    toggle(): void;
    get firstMatch(): boolean;
    get menu(): string;
    /**
     * Filter words that too short or doesn't match input
     */
    protected filterWords(words: string[], opt: CompleteOption): string[];
    /**
     * fix start column for new valid characters
     *
     * @protected
     * @param {CompleteOption} opt
     * @param {string[]} valids - valid charscters
     * @returns {number}
     */
    protected fixStartcol(opt: CompleteOption, valids: string[]): number;
    shouldComplete(opt: CompleteOption): Promise<boolean>;
    refresh(): Promise<void>;
    onCompleteDone(item: VimCompleteItem, opt: CompleteOption): Promise<void>;
    doComplete(opt: CompleteOption, token: CancellationToken): Promise<CompleteResult | null>;
}
