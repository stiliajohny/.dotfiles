"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const await_semaphore_1 = require("await-semaphore");
const child_process_1 = require("child_process");
const events_1 = require("events");
const path_1 = tslib_1.__importDefault(require("path"));
const readline_1 = tslib_1.__importDefault(require("readline"));
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const which_1 = tslib_1.__importDefault(require("which"));
const highligher_1 = tslib_1.__importDefault(require("../model/highligher"));
const ansiparse_1 = require("../util/ansiparse");
const workspace_1 = tslib_1.__importDefault(require("../workspace"));
const logger = require('../util/logger')('handler-search');
const defaultArgs = ['--color', 'ansi', '--colors', 'path:fg:black', '--colors', 'line:fg:green', '--colors', 'match:fg:red', '--no-messages', '--heading', '-n'];
const controlCode = '\x1b';
// emit FileItem
class Task extends events_1.EventEmitter {
    start(cmd, args, cwd) {
        this.process = child_process_1.spawn(cmd, args, { cwd });
        this.process.on('error', e => {
            this.emit('error', e.message);
        });
        const rl = readline_1.default.createInterface(this.process.stdout);
        let start;
        let fileItem;
        let lines = [];
        let highlights = [];
        let create = true;
        rl.on('line', content => {
            if (content.includes(controlCode)) {
                let items = ansiparse_1.ansiparse(content);
                if (items[0].foreground == 'black') {
                    fileItem = { filepath: path_1.default.join(cwd, items[0].text), ranges: [] };
                    return;
                }
                let normalLine = items[0].foreground == 'green';
                if (normalLine) {
                    let lnum = parseInt(items[0].text, 10) - 1;
                    let padlen = items[0].text.length + 1;
                    if (create) {
                        start = lnum;
                        create = false;
                    }
                    let line = '';
                    for (let item of items) {
                        if (item.foreground == 'red') {
                            let l = lnum - start;
                            let c = line.length - padlen;
                            highlights.push(vscode_languageserver_types_1.Range.create(l, c, l, c + item.text.length));
                        }
                        line += item.text;
                    }
                    let currline = line.slice(padlen);
                    lines.push(currline);
                }
            }
            else {
                let fileEnd = content.trim().length == 0;
                if (fileItem && (fileEnd || content.trim() == '--')) {
                    let fileRange = {
                        lines,
                        highlights,
                        start,
                        end: start + lines.length
                    };
                    fileItem.ranges.push(fileRange);
                }
                if (fileEnd) {
                    this.emit('item', fileItem);
                    fileItem = null;
                }
                lines = [];
                highlights = [];
                create = true;
            }
        });
        rl.on('close', () => {
            if (fileItem) {
                if (lines.length) {
                    let fileRange = {
                        lines,
                        highlights,
                        start,
                        end: start + lines.length
                    };
                    fileItem.ranges.push(fileRange);
                }
                this.emit('item', fileItem);
            }
            lines = highlights = fileItem = null;
            this.emit('end');
        });
    }
    dispose() {
        if (this.process) {
            this.process.kill();
        }
    }
}
class Search {
    constructor(nvim, cmd = 'rg') {
        this.nvim = nvim;
        this.cmd = cmd;
    }
    run(args, cwd, refactor) {
        let { nvim, cmd } = this;
        let { afterContext, beforeContext } = refactor.config;
        let argList = ['-A', afterContext.toString(), '-B', beforeContext.toString()].concat(defaultArgs, args);
        argList.push('--', './');
        try {
            cmd = which_1.default.sync(cmd);
        }
        catch (e) {
            workspace_1.default.showMessage('Please install ripgrep and make sure rg is in your $PATH', 'error');
            return Promise.reject(e);
        }
        this.task = new Task();
        this.task.start(cmd, argList, cwd);
        let mutex = new await_semaphore_1.Mutex();
        let files = 0;
        let matches = 0;
        let start = Date.now();
        // remaining items
        let fileItems = [];
        const addFileItems = async () => {
            if (fileItems.length == 0)
                return;
            let items = fileItems.slice();
            fileItems = [];
            const release = await mutex.acquire();
            try {
                await refactor.addFileItems(items);
            }
            catch (e) {
                logger.error(e);
            }
            release();
        };
        return new Promise((resolve, reject) => {
            let interval = setInterval(addFileItems, 100);
            this.task.on('item', async (fileItem) => {
                files++;
                matches = matches + fileItem.ranges.reduce((p, r) => p + r.highlights.length, 0);
                fileItems.push(fileItem);
            });
            this.task.on('error', message => {
                clearInterval(interval);
                workspace_1.default.showMessage(`Error on command "${cmd}": ${message}`, 'error');
                this.task = null;
                reject(new Error(message));
            });
            this.task.on('end', async () => {
                clearInterval(interval);
                try {
                    await addFileItems();
                    const release = await mutex.acquire();
                    release();
                    this.task.removeAllListeners();
                    this.task = null;
                    let { document } = refactor;
                    if (document) {
                        let buf = document.buffer;
                        nvim.pauseNotification();
                        if (files == 0) {
                            // eslint-disable-next-line @typescript-eslint/no-floating-promises
                            buf.setLines(['No match found'], { start: 1, end: 2, strictIndexing: false }, true);
                            buf.addHighlight({ line: 1, srcId: -1, colEnd: -1, colStart: 0, hlGroup: 'Error' }).logError();
                            buf.setOption('modified', false, true);
                        }
                        else {
                            let highligher = new highligher_1.default();
                            highligher.addText('Files', 'MoreMsg');
                            highligher.addText(': ');
                            highligher.addText(`${files} `, 'Number');
                            highligher.addText('Matches', 'MoreMsg');
                            highligher.addText(': ');
                            highligher.addText(`${matches} `, 'Number');
                            highligher.addText('Duration', 'MoreMsg');
                            highligher.addText(': ');
                            highligher.addText(`${Date.now() - start}ms`, 'Number');
                            highligher.render(buf, 1, 2);
                        }
                        buf.setOption('modified', false, true);
                        await nvim.resumeNotification(false, true);
                    }
                }
                catch (e) {
                    reject(e);
                    return;
                }
                resolve();
            });
        });
    }
}
exports.default = Search;
//# sourceMappingURL=search.js.map