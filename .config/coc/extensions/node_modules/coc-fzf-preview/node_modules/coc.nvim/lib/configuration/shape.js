"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const jsonc_parser_1 = require("jsonc-parser");
const path_1 = tslib_1.__importDefault(require("path"));
const vscode_uri_1 = require("vscode-uri");
const util_1 = require("../util");
const logger = require('../util/logger')('configuration-shape');
class ConfigurationProxy {
    constructor(workspace) {
        this.workspace = workspace;
    }
    get nvim() {
        return this.workspace.nvim;
    }
    async modifyConfiguration(target, key, value) {
        let { nvim, workspace } = this;
        let file = workspace.getConfigFile(target);
        if (!file)
            return;
        let formattingOptions = { tabSize: 2, insertSpaces: true };
        let content = fs_1.default.readFileSync(file, 'utf8');
        value = value == null ? undefined : value;
        let edits = jsonc_parser_1.modify(content, [key], value, { formattingOptions });
        content = jsonc_parser_1.applyEdits(content, edits);
        fs_1.default.writeFileSync(file, content, 'utf8');
        let doc = workspace.getDocument(vscode_uri_1.URI.file(file).toString());
        if (doc)
            nvim.command('checktime', true);
        return;
    }
    get workspaceConfigFile() {
        let folder = path_1.default.join(this.workspace.root, '.vim');
        return path_1.default.join(folder, util_1.CONFIG_FILE_NAME);
    }
    $updateConfigurationOption(target, key, value) {
        this.modifyConfiguration(target, key, value).logError();
    }
    $removeConfigurationOption(target, key) {
        this.modifyConfiguration(target, key).logError();
    }
}
exports.default = ConfigurationProxy;
//# sourceMappingURL=shape.js.map