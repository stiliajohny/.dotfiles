import { Neovim } from '@chemzqm/neovim';
import { CancellationToken, Disposable, Location } from 'vscode-languageserver-protocol';
import { ProviderResult } from '../provider';
import { IList, ListAction, ListContext, ListItem, ListTask, LocationWithLine, WorkspaceConfiguration, ListArgument, PreiewOptions } from '../types';
import ListConfiguration from './configuration';
interface ActionOptions {
    persist?: boolean;
    reload?: boolean;
    parallel?: boolean;
}
export default abstract class BasicList implements IList, Disposable {
    protected nvim: Neovim;
    name: string;
    defaultAction: string;
    readonly actions: ListAction[];
    options: ListArgument[];
    protected disposables: Disposable[];
    private optionMap;
    config: ListConfiguration;
    constructor(nvim: Neovim);
    protected get hlGroup(): string;
    protected get previewHeight(): number;
    protected get splitRight(): boolean;
    parseArguments(args: string[]): {
        [key: string]: string | boolean;
    };
    protected getConfig(): WorkspaceConfiguration;
    protected addAction(name: string, fn: (item: ListItem, context: ListContext) => ProviderResult<void>, options?: ActionOptions): void;
    protected addMultipleAction(name: string, fn: (item: ListItem[], context: ListContext) => ProviderResult<void>, options?: ActionOptions): void;
    addLocationActions(): void;
    convertLocation(location: Location | LocationWithLine | string): Promise<Location>;
    jumpTo(location: Location | LocationWithLine | string, command?: string): Promise<void>;
    private createAction;
    protected previewLocation(location: Location, context: ListContext): Promise<void>;
    preview(options: PreiewOptions, context: ListContext): Promise<void>;
    protected getPreviewCommand(context: ListContext): string;
    abstract loadItems(context: ListContext, token?: CancellationToken): Promise<ListItem[] | ListTask | null | undefined>;
    doHighlight(): void;
    dispose(): void;
}
export {};
