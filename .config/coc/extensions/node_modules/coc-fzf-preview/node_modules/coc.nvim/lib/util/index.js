"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.concurrent = exports.isDocumentEdit = exports.getKeymapModifier = exports.isRunning = exports.watchFile = exports.runCommand = exports.executable = exports.disposeAll = exports.getUri = exports.wait = exports.escapeSingleQuote = exports.CONFIG_FILE_NAME = exports.platform = void 0;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const debounce_1 = tslib_1.__importDefault(require("debounce"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const isuri_1 = tslib_1.__importDefault(require("isuri"));
const path_1 = tslib_1.__importDefault(require("path"));
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const vscode_uri_1 = require("vscode-uri");
const which_1 = tslib_1.__importDefault(require("which"));
const platform = tslib_1.__importStar(require("./platform"));
exports.platform = platform;
const logger = require('./logger')('util-index');
exports.CONFIG_FILE_NAME = 'coc-settings.json';
function escapeSingleQuote(str) {
    return str.replace(/'/g, "''");
}
exports.escapeSingleQuote = escapeSingleQuote;
function wait(ms) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}
exports.wait = wait;
function getUri(fullpath, id, buftype, isCygwin) {
    if (!fullpath)
        return `untitled:${id}`;
    if (platform.isWindows && !isCygwin)
        fullpath = path_1.default.win32.normalize(fullpath);
    if (path_1.default.isAbsolute(fullpath))
        return vscode_uri_1.URI.file(fullpath).toString();
    if (isuri_1.default.isValid(fullpath))
        return vscode_uri_1.URI.parse(fullpath).toString();
    if (buftype != '')
        return `${buftype}:${id}`;
    return `unknown:${id}`;
}
exports.getUri = getUri;
function disposeAll(disposables) {
    while (disposables.length) {
        const item = disposables.pop();
        if (item) {
            item.dispose();
        }
    }
}
exports.disposeAll = disposeAll;
function executable(command) {
    try {
        which_1.default.sync(command);
    }
    catch (e) {
        return false;
    }
    return true;
}
exports.executable = executable;
function runCommand(cmd, opts = {}, timeout) {
    if (!platform.isWindows) {
        opts.shell = opts.shell || process.env.SHELL;
    }
    opts.maxBuffer = 500 * 1024;
    return new Promise((resolve, reject) => {
        let timer;
        if (timeout) {
            timer = setTimeout(() => {
                reject(new Error(`timeout after ${timeout}s`));
            }, timeout * 1000);
        }
        child_process_1.exec(cmd, opts, (err, stdout, stderr) => {
            if (timer)
                clearTimeout(timer);
            if (err) {
                reject(new Error(`exited with ${err.code}\n${err}\n${stderr}`));
                return;
            }
            resolve(stdout);
        });
    });
}
exports.runCommand = runCommand;
function watchFile(filepath, onChange) {
    let callback = debounce_1.default(onChange, 100);
    try {
        let watcher = fs_1.default.watch(filepath, {
            persistent: true,
            recursive: false,
            encoding: 'utf8'
        }, () => {
            callback();
        });
        return vscode_languageserver_protocol_1.Disposable.create(() => {
            callback.clear();
            watcher.close();
        });
    }
    catch (e) {
        return vscode_languageserver_protocol_1.Disposable.create(() => {
            callback.clear();
        });
    }
}
exports.watchFile = watchFile;
function isRunning(pid) {
    try {
        let res = process.kill(pid, 0);
        return res == true;
    }
    catch (e) {
        return e.code === 'EPERM';
    }
}
exports.isRunning = isRunning;
function getKeymapModifier(mode) {
    if (mode == 'n' || mode == 'o' || mode == 'x' || mode == 'v')
        return '<C-U>';
    if (mode == 'i')
        return '<C-o>';
    if (mode == 's')
        return '<Esc>';
    return '';
}
exports.getKeymapModifier = getKeymapModifier;
// consider textDocument without version to be valid
function isDocumentEdit(edit) {
    if (edit == null)
        return false;
    if (!vscode_languageserver_protocol_1.TextDocumentIdentifier.is(edit.textDocument))
        return false;
    if (!Array.isArray(edit.edits))
        return false;
    return true;
}
exports.isDocumentEdit = isDocumentEdit;
function concurrent(arr, fn, limit = 3) {
    if (arr.length == 0)
        return Promise.resolve();
    let finished = 0;
    let total = arr.length;
    let remain = arr.slice();
    return new Promise(resolve => {
        let run = (val) => {
            let cb = () => {
                finished = finished + 1;
                if (finished == total) {
                    resolve();
                }
                else if (remain.length) {
                    let next = remain.shift();
                    run(next);
                }
            };
            fn(val).then(cb, cb);
        };
        for (let i = 0; i < Math.min(limit, remain.length); i++) {
            let val = remain.shift();
            run(val);
        }
    });
}
exports.concurrent = concurrent;
//# sourceMappingURL=index.js.map