import { Neovim } from '@chemzqm/neovim';
import { Event } from 'vscode-languageserver-protocol';
import { ListItem, ListItemsEvent } from '../types';
import { ListManager } from './manager';
export interface ExtendedItem extends ListItem {
    score: number;
    matches: number[];
    filterLabel: string;
}
export default class Worker {
    private nvim;
    private manager;
    private recentFiles;
    private _loading;
    private timer;
    private interval;
    private totalItems;
    private tokenSource;
    private _onDidChangeItems;
    readonly onDidChangeItems: Event<ListItemsEvent>;
    constructor(nvim: Neovim, manager: ListManager);
    private loadMru;
    private set loading(value);
    get isLoading(): boolean;
    loadItems(reload?: boolean): Promise<void>;
    drawItems(): void;
    stop(): void;
    get length(): number;
    private get input();
    private getItemsHighlight;
    private filterItems;
    private getHighlights;
    private parseListItemAnsi;
    private fixLabel;
}
