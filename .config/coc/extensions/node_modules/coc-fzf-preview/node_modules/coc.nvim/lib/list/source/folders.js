"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const vscode_uri_1 = require("vscode-uri");
const mkdirp_1 = tslib_1.__importDefault(require("mkdirp"));
const fs_1 = require("../../util/fs");
const workspace_1 = tslib_1.__importDefault(require("../../workspace"));
const basic_1 = tslib_1.__importDefault(require("../basic"));
class FoldList extends basic_1.default {
    constructor(nvim) {
        super(nvim);
        this.defaultAction = 'edit';
        this.description = 'list of current workspace folders';
        this.name = 'folders';
        this.addAction('edit', async (item) => {
            let newPath = await nvim.call('input', ['Folder: ', item.label, 'dir']);
            let stat = await fs_1.statAsync(newPath);
            if (!stat || !stat.isDirectory()) {
                workspace_1.default.showMessage(`invalid path: ${newPath}`, 'error');
                return;
            }
            workspace_1.default.renameWorkspaceFolder(item.label, newPath);
        });
        this.addAction('delete', async (item) => {
            workspace_1.default.removeWorkspaceFolder(item.label);
        }, { reload: true, persist: true });
        this.addAction('newfile', async (item) => {
            let file = await workspace_1.default.requestInput('File name', item.label + '/');
            let dir = path_1.default.dirname(file);
            let stat = await fs_1.statAsync(dir);
            if (!stat || !stat.isDirectory()) {
                let success = await mkdirp_1.default(dir);
                if (!success) {
                    workspace_1.default.showMessage(`Error creating new directory ${dir}`, 'error');
                    return;
                }
            }
            await workspace_1.default.createFile(file, { overwrite: false, ignoreIfExists: true });
            await this.jumpTo(vscode_uri_1.URI.file(file).toString());
        });
    }
    async loadItems(_context) {
        return workspace_1.default.folderPaths.map(p => ({ label: p }));
    }
}
exports.default = FoldList;
//# sourceMappingURL=folders.js.map