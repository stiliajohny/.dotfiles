import { Variable, VariableResolver } from "./parser";
import Document from '../model/document';
export declare class SnippetVariableResolver implements VariableResolver {
    private _variableToValue;
    private get nvim();
    init(document: Document): Promise<void>;
    constructor();
    resolve(variable: Variable): string;
}
