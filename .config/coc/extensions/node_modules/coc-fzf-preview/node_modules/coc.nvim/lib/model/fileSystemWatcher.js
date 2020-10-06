"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const vscode_uri_1 = require("vscode-uri");
const minimatch_1 = tslib_1.__importDefault(require("minimatch"));
const path_1 = tslib_1.__importDefault(require("path"));
const util_1 = require("../util");
const array_1 = require("../util/array");
const logger = require('../util/logger')('filesystem-watcher');
class FileSystemWatcher {
    constructor(clientPromise, globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents) {
        this.globPattern = globPattern;
        this.ignoreCreateEvents = ignoreCreateEvents;
        this.ignoreChangeEvents = ignoreChangeEvents;
        this.ignoreDeleteEvents = ignoreDeleteEvents;
        this._onDidCreate = new vscode_languageserver_protocol_1.Emitter();
        this._onDidChange = new vscode_languageserver_protocol_1.Emitter();
        this._onDidDelete = new vscode_languageserver_protocol_1.Emitter();
        this._onDidRename = new vscode_languageserver_protocol_1.Emitter();
        this.onDidCreate = this._onDidCreate.event;
        this.onDidChange = this._onDidChange.event;
        this.onDidDelete = this._onDidDelete.event;
        this.onDidRename = this._onDidRename.event;
        this.disposables = [];
        if (!clientPromise)
            return;
        clientPromise.then(client => {
            if (client)
                return this.listen(client);
        }).catch(error => {
            logger.error('watchman initialize failed');
            logger.error(error.stack);
        });
    }
    async listen(client) {
        let { globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents } = this;
        let disposable = await client.subscribe(globPattern, (change) => {
            let { root, files } = change;
            files = files.filter(f => f.type == 'f' && minimatch_1.default(f.name, globPattern, { dot: true }));
            for (let file of files) {
                let uri = vscode_uri_1.URI.file(path_1.default.join(root, file.name));
                if (!file.exists) {
                    if (!ignoreDeleteEvents)
                        this._onDidDelete.fire(uri);
                }
                else {
                    if (file.new === true) {
                        if (!ignoreCreateEvents)
                            this._onDidCreate.fire(uri);
                    }
                    else {
                        if (!ignoreChangeEvents)
                            this._onDidChange.fire(uri);
                    }
                }
            }
            // file rename
            if (files.length == 2 && !files[0].exists && files[1].exists) {
                let oldFile = files[0];
                let newFile = files[1];
                if (oldFile.size == newFile.size) {
                    this._onDidRename.fire({
                        oldUri: vscode_uri_1.URI.file(path_1.default.join(root, oldFile.name)),
                        newUri: vscode_uri_1.URI.file(path_1.default.join(root, newFile.name))
                    });
                }
            }
            // detect folder rename
            if (files.length >= 2) {
                let [oldFiles, newFiles] = array_1.splitArray(files, o => o.exists === false);
                if (oldFiles.length == newFiles.length) {
                    for (let oldFile of oldFiles) {
                        let newFile = newFiles.find(o => o.size == oldFile.size && o.mtime_ms == oldFile.mtime_ms);
                        if (newFile) {
                            this._onDidRename.fire({
                                oldUri: vscode_uri_1.URI.file(path_1.default.join(root, oldFile.name)),
                                newUri: vscode_uri_1.URI.file(path_1.default.join(root, newFile.name))
                            });
                        }
                    }
                }
            }
        });
        this.disposables.push(disposable);
        return disposable;
    }
    dispose() {
        util_1.disposeAll(this.disposables);
    }
}
exports.default = FileSystemWatcher;
//# sourceMappingURL=fileSystemWatcher.js.map