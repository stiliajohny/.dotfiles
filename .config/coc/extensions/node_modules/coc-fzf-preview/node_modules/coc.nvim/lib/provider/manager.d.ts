import { Definition, DocumentSelector, Location } from 'vscode-languageserver-protocol';
import { TextDocument } from 'vscode-languageserver-textdocument';
export interface ProviderItem<T> {
    id: string;
    selector: DocumentSelector;
    provider: T;
    [index: string]: any;
}
export default class Manager<T> {
    protected providers: Set<ProviderItem<T>>;
    hasProvider(document: TextDocument): boolean;
    protected getProvider(document: TextDocument): ProviderItem<T>;
    protected poviderById(id: any): T;
    protected getProviders(document: TextDocument): ProviderItem<T>[];
    protected mergeDefinitions(arr: Definition[]): Location[];
}
