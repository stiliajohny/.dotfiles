"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnippetVariableResolver = void 0;
const tslib_1 = require("tslib");
const path = tslib_1.__importStar(require("path"));
const workspace_1 = tslib_1.__importDefault(require("../workspace"));
const vscode_uri_1 = require("vscode-uri");
const clipboardy_1 = tslib_1.__importDefault(require("clipboardy"));
const logger = require('../util/logger')('snippets-variable');
class SnippetVariableResolver {
    constructor() {
        this._variableToValue = {};
        const currentDate = new Date();
        this._variableToValue = {
            CURRENT_YEAR: currentDate.getFullYear().toString(),
            CURRENT_YEAR_SHORT: currentDate
                .getFullYear()
                .toString()
                .slice(-2),
            CURRENT_MONTH: (currentDate.getMonth() + 1).toString(),
            CURRENT_DATE: currentDate.getDate().toString(),
            CURRENT_HOUR: currentDate.getHours().toString(),
            CURRENT_MINUTE: currentDate.getMinutes().toString(),
            CURRENT_SECOND: currentDate.getSeconds().toString(),
            CURRENT_DAY_NAME: currentDate.toLocaleString("en-US", { weekday: "long" }),
            CURRENT_DAY_NAME_SHORT: currentDate.toLocaleString("en-US", { weekday: "short" }),
            CURRENT_MONTH_NAME: currentDate.toLocaleString("en-US", { month: "long" }),
            CURRENT_MONTH_NAME_SHORT: currentDate.toLocaleString("en-US", { month: "short" })
        };
    }
    get nvim() {
        return workspace_1.default.nvim;
    }
    async init(document) {
        let filepath = vscode_uri_1.URI.parse(document.uri).fsPath;
        let [lnum, line, cword, selected, yank] = await this.nvim.eval(`[line('.'),getline('.'),expand('<cword>'),get(g:,'coc_selected_text', ''),getreg('"')]`);
        let clipboard = '';
        try {
            clipboard = await clipboardy_1.default.read();
        }
        catch (e) {
            logger.error(`Error with clipboardy:`, e.message);
        }
        Object.assign(this._variableToValue, {
            YANK: yank || undefined,
            CLIPBOARD: clipboard || undefined,
            TM_CURRENT_LINE: line,
            TM_SELECTED_TEXT: selected || undefined,
            TM_CURRENT_WORD: cword,
            TM_LINE_INDEX: (lnum - 1).toString(),
            TM_LINE_NUMBER: lnum.toString(),
            TM_FILENAME: path.basename(filepath),
            TM_FILENAME_BASE: path.basename(filepath, path.extname(filepath)),
            TM_DIRECTORY: path.dirname(filepath),
            TM_FILEPATH: filepath,
        });
    }
    resolve(variable) {
        const variableName = variable.name;
        if (this._variableToValue.hasOwnProperty(variableName)) {
            return this._variableToValue[variableName] || '';
        }
        if (variable.children && variable.children.length) {
            return variable.toString();
        }
        return variableName;
    }
}
exports.SnippetVariableResolver = SnippetVariableResolver;
//# sourceMappingURL=variableResolve.js.map