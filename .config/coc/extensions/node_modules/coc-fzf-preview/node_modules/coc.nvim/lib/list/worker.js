"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const vscode_uri_1 = require("vscode-uri");
const ansiparse_1 = require("../util/ansiparse");
const diff_1 = require("../util/diff");
const fzy_1 = require("../util/fzy");
const score_1 = require("../util/score");
const string_1 = require("../util/string");
const workspace_1 = tslib_1.__importDefault(require("../workspace"));
const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const logger = require('../util/logger')('list-worker');
const controlCode = '\x1b';
// perform loading task
class Worker {
    constructor(nvim, manager) {
        this.nvim = nvim;
        this.manager = manager;
        this.recentFiles = [];
        this._loading = false;
        this.totalItems = [];
        this._onDidChangeItems = new vscode_languageserver_protocol_1.Emitter();
        this.onDidChangeItems = this._onDidChangeItems.event;
        let { prompt } = manager;
        prompt.onDidChangeInput(() => {
            let { listOptions } = manager;
            let { interactive } = listOptions;
            let time = manager.getConfig('interactiveDebounceTime', 100);
            if (this.timer)
                clearTimeout(this.timer);
            // reload or filter items
            if (interactive) {
                this.stop();
                this.timer = setTimeout(async () => {
                    await this.loadItems();
                }, time);
            }
            else if (this.length) {
                let wait = Math.max(Math.min(Math.floor(this.length / 200), 300), 50);
                this.timer = setTimeout(() => {
                    this.drawItems();
                }, wait);
            }
        });
    }
    loadMru() {
        let mru = workspace_1.default.createMru('mru');
        mru.load().then(files => {
            this.recentFiles = files;
        }).logError();
    }
    set loading(loading) {
        if (this._loading == loading)
            return;
        this._loading = loading;
        let { nvim } = this;
        if (loading) {
            this.interval = setInterval(() => {
                let idx = Math.floor((new Date()).getMilliseconds() / 100);
                nvim.pauseNotification();
                nvim.setVar('coc_list_loading_status', frames[idx], true);
                nvim.command('redraws', true);
                nvim.resumeNotification(false, true).logError();
            }, 100);
        }
        else {
            if (this.interval) {
                clearInterval(this.interval);
                nvim.pauseNotification();
                nvim.setVar('coc_list_loading_status', '', true);
                nvim.command('redraws', true);
                nvim.resumeNotification(false, true).logError();
            }
        }
    }
    get isLoading() {
        return this._loading;
    }
    async loadItems(reload = false) {
        let { context, list, listOptions } = this.manager;
        if (!list)
            return;
        this.loadMru();
        if (this.timer)
            clearTimeout(this.timer);
        this.loading = true;
        let { interactive } = listOptions;
        let source = this.tokenSource = new vscode_languageserver_protocol_1.CancellationTokenSource();
        let token = source.token;
        let items = await list.loadItems(context, token);
        if (token.isCancellationRequested)
            return;
        if (!items || Array.isArray(items)) {
            items = (items || []);
            this.totalItems = items.map(item => {
                item.label = this.fixLabel(item.label);
                this.parseListItemAnsi(item);
                return item;
            });
            this.loading = false;
            let highlights = [];
            if (!interactive) {
                let res = this.filterItems(items);
                items = res.items;
                highlights = res.highlights;
            }
            else {
                highlights = this.getItemsHighlight(items);
            }
            this._onDidChangeItems.fire({
                items,
                highlights,
                reload
            });
        }
        else {
            let task = items;
            let totalItems = this.totalItems = [];
            let count = 0;
            let currInput = context.input;
            let timer;
            let lastTs;
            let _onData = () => {
                lastTs = Date.now();
                if (token.isCancellationRequested || !this.manager.isActivated)
                    return;
                if (count >= totalItems.length)
                    return;
                let inputChanged = this.input != currInput;
                if (interactive && inputChanged)
                    return;
                if (count == 0 || inputChanged) {
                    currInput = this.input;
                    count = totalItems.length;
                    let items;
                    let highlights = [];
                    if (interactive) {
                        items = totalItems.slice();
                        highlights = this.getItemsHighlight(items);
                    }
                    else {
                        let res = this.filterItems(totalItems);
                        items = res.items;
                        highlights = res.highlights;
                    }
                    this._onDidChangeItems.fire({ items, highlights, reload, append: false });
                }
                else {
                    let remain = totalItems.slice(count);
                    count = totalItems.length;
                    let items;
                    let highlights = [];
                    if (!interactive) {
                        let res = this.filterItems(remain);
                        items = res.items;
                        highlights = res.highlights;
                    }
                    else {
                        items = remain;
                        highlights = this.getItemsHighlight(remain);
                    }
                    this._onDidChangeItems.fire({ items, highlights, append: true });
                }
            };
            task.on('data', item => {
                if (timer)
                    clearTimeout(timer);
                if (token.isCancellationRequested)
                    return;
                if (interactive && this.input != currInput)
                    return;
                item.label = this.fixLabel(item.label);
                this.parseListItemAnsi(item);
                totalItems.push(item);
                if (this.input != currInput)
                    return;
                if ((!lastTs && totalItems.length == 500)
                    || Date.now() - lastTs > 200) {
                    _onData();
                }
                else {
                    timer = setTimeout(_onData, 50);
                }
            });
            let disposable = token.onCancellationRequested(() => {
                this.loading = false;
                disposable.dispose();
                if (timer)
                    clearTimeout(timer);
                if (task) {
                    task.dispose();
                    task = null;
                }
            });
            task.on('error', async (error) => {
                task = null;
                this.loading = false;
                disposable.dispose();
                if (timer)
                    clearTimeout(timer);
                await this.manager.cancel();
                workspace_1.default.showMessage(`Task error: ${error.toString()}`, 'error');
                logger.error(error);
            });
            task.on('end', () => {
                task = null;
                this.loading = false;
                disposable.dispose();
                if (timer)
                    clearTimeout(timer);
                if (token.isCancellationRequested)
                    return;
                if (totalItems.length == 0) {
                    this._onDidChangeItems.fire({ items: [], highlights: [] });
                }
                else {
                    _onData();
                }
            });
        }
    }
    // draw all items with filter if necessary
    drawItems() {
        let { totalItems } = this;
        let { listOptions, isActivated } = this.manager;
        if (!isActivated)
            return;
        let { interactive } = listOptions;
        let items = totalItems;
        let highlights = [];
        if (!interactive) {
            let res = this.filterItems(totalItems);
            items = res.items;
            highlights = res.highlights;
        }
        else {
            highlights = this.getItemsHighlight(items);
        }
        this._onDidChangeItems.fire({ items, highlights });
    }
    stop() {
        if (this.tokenSource) {
            this.tokenSource.cancel();
            this.tokenSource = null;
        }
        this.loading = false;
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }
    get length() {
        return this.totalItems.length;
    }
    get input() {
        return this.manager.prompt.input;
    }
    getItemsHighlight(items) {
        let { input } = this;
        if (!input)
            return [];
        return items.map(item => {
            let filterLabel = getFilterLabel(item);
            if (filterLabel == '')
                return null;
            let res = score_1.getMatchResult(filterLabel, input);
            if (!res || !res.score)
                return null;
            return this.getHighlights(filterLabel, res.matches);
        });
    }
    filterItems(items) {
        let { input } = this.manager.prompt;
        let highlights = [];
        let { sort, matcher, ignorecase } = this.manager.listOptions;
        if (input.length == 0) {
            let filtered = items.slice();
            let sort = filtered.length && typeof filtered[0].recentScore == 'number';
            return {
                items: sort ? filtered.sort((a, b) => b.recentScore - a.recentScore) : filtered,
                highlights
            };
        }
        let extended = this.manager.getConfig('extendedSearchMode', true);
        let filtered;
        if (input.length > 0) {
            let inputs = extended ? input.split(/\s+/) : [input];
            if (matcher == 'strict') {
                filtered = items.filter(item => {
                    let spans = [];
                    let filterLabel = getFilterLabel(item);
                    for (let input of inputs) {
                        let idx = ignorecase ? filterLabel.toLowerCase().indexOf(input.toLowerCase()) : filterLabel.indexOf(input);
                        if (idx == -1)
                            return false;
                        spans.push([string_1.byteIndex(filterLabel, idx), string_1.byteIndex(filterLabel, idx + string_1.byteLength(input))]);
                    }
                    highlights.push({ spans });
                    return true;
                });
            }
            else if (matcher == 'regex') {
                let flags = ignorecase ? 'iu' : 'u';
                let regexes = inputs.reduce((p, c) => {
                    try {
                        let regex = new RegExp(c, flags);
                        p.push(regex);
                    }
                    catch (e) { }
                    return p;
                }, []);
                filtered = items.filter(item => {
                    let spans = [];
                    let filterLabel = getFilterLabel(item);
                    for (let regex of regexes) {
                        let ms = filterLabel.match(regex);
                        if (ms == null)
                            return false;
                        spans.push([string_1.byteIndex(filterLabel, ms.index), string_1.byteIndex(filterLabel, ms.index + string_1.byteLength(ms[0]))]);
                    }
                    highlights.push({ spans });
                    return true;
                });
            }
            else {
                filtered = items.filter(item => {
                    let filterText = item.filterText || item.label;
                    return inputs.every(s => fzy_1.hasMatch(s, filterText));
                });
                filtered = filtered.map(item => {
                    let filterLabel = getFilterLabel(item);
                    let matchScore = 0;
                    let matches = [];
                    for (let input of inputs) {
                        matches.push(...fzy_1.positions(input, filterLabel));
                        matchScore += fzy_1.score(input, filterLabel);
                    }
                    let { recentScore } = item;
                    if (!recentScore && item.location) {
                        let uri = getItemUri(item);
                        if (uri.startsWith('file')) {
                            let fsPath = vscode_uri_1.URI.parse(uri).fsPath;
                            recentScore = -this.recentFiles.indexOf(fsPath);
                        }
                    }
                    return Object.assign({}, item, {
                        filterLabel,
                        score: matchScore,
                        recentScore,
                        matches
                    });
                });
                if (sort && items.length) {
                    filtered.sort((a, b) => {
                        if (a.score != b.score)
                            return b.score - a.score;
                        if (input.length && a.recentScore != b.recentScore) {
                            return (a.recentScore || -Infinity) - (b.recentScore || -Infinity);
                        }
                        if (a.location && b.location) {
                            let au = getItemUri(a);
                            let bu = getItemUri(b);
                            return au > bu ? 1 : -1;
                        }
                        return a.label > b.label ? 1 : -1;
                    });
                }
                for (let item of filtered) {
                    if (!item.matches)
                        continue;
                    let hi = this.getHighlights(item.filterLabel, item.matches);
                    highlights.push(hi);
                }
            }
        }
        return {
            items: filtered,
            highlights
        };
    }
    getHighlights(text, matches) {
        let spans = [];
        if (matches.length) {
            let start = matches.shift();
            let next = matches.shift();
            let curr = start;
            while (next) {
                if (next == curr + 1) {
                    curr = next;
                    next = matches.shift();
                    continue;
                }
                spans.push([string_1.byteIndex(text, start), string_1.byteIndex(text, curr) + 1]);
                start = next;
                curr = start;
                next = matches.shift();
            }
            spans.push([string_1.byteIndex(text, start), string_1.byteIndex(text, curr) + 1]);
        }
        return { spans };
    }
    // set correct label, add ansi highlights
    parseListItemAnsi(item) {
        let { label } = item;
        if (item.ansiHighlights || !label.includes(controlCode))
            return;
        let { line, highlights } = ansiparse_1.parseAnsiHighlights(label);
        item.label = line;
        item.ansiHighlights = highlights;
    }
    fixLabel(label) {
        let { columns } = workspace_1.default.env;
        label = label.split('\n').join(' ');
        return label.slice(0, columns * 2);
    }
}
exports.default = Worker;
function getFilterLabel(item) {
    return item.filterText != null ? diff_1.patchLine(item.filterText, item.label) : item.label;
}
function getItemUri(item) {
    let { location } = item;
    if (typeof location == 'string')
        return location;
    return location.uri;
}
//# sourceMappingURL=worker.js.map