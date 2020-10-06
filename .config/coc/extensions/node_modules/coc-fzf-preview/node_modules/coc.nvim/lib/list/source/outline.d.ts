import Document from '../../model/document';
import { ListContext, ListItem, ListArgument } from '../../types';
import LocationList from './location';
export default class Outline extends LocationList {
    readonly description = "symbols of current document";
    name: string;
    options: ListArgument[];
    loadItems(context: ListContext): Promise<ListItem[]>;
    doHighlight(): void;
    loadCtagsSymbols(document: Document): Promise<ListItem[]>;
}
