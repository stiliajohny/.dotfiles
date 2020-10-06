"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fast_diff_1 = tslib_1.__importDefault(require("fast-diff"));
const path_1 = tslib_1.__importDefault(require("path"));
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const vscode_uri_1 = require("vscode-uri");
const commands_1 = tslib_1.__importDefault(require("../commands"));
const highligher_1 = tslib_1.__importDefault(require("../model/highligher"));
const util_1 = require("../util");
const fs_1 = require("../util/fs");
const object_1 = require("../util/object");
const string_1 = require("../util/string");
const workspace_1 = tslib_1.__importDefault(require("../workspace"));
const logger = require('../util/logger')('refactor');
// cases: buffer change event
const name = '__coc_refactor__';
const separator = '\u3000';
let refactorId = 0;
class Refactor {
    constructor() {
        this.changing = false;
        this.matchIds = new Set();
        this.disposables = [];
        this.fileItems = [];
        this.nvim = workspace_1.default.nvim;
        if (workspace_1.default.isNvim && this.nvim.hasFunction('nvim_buf_set_virtual_text')) {
            this.srcId = workspace_1.default.createNameSpace('coc-refactor');
        }
        let config = workspace_1.default.getConfiguration('refactor');
        this.config = {
            afterContext: config.get('afterContext', 3),
            beforeContext: config.get('beforeContext', 3),
            openCommand: config.get('openCommand', 'edit')
        };
    }
    get buffer() {
        if (!this.bufnr)
            return null;
        return this.nvim.createBuffer(this.bufnr);
    }
    get document() {
        if (!this.bufnr)
            return null;
        return workspace_1.default.getDocument(this.bufnr);
    }
    async valid() {
        let { buffer } = this;
        if (!buffer)
            return false;
        return await buffer.valid;
    }
    /**
     * Start refactor from workspaceEdit
     */
    async fromWorkspaceEdit(edit, filetype) {
        let items = await this.getItemsFromWorkspaceEdit(edit);
        await this.createRefactorBuffer(filetype);
        await this.addFileItems(items);
    }
    async fromLines(lines) {
        let buf = await this.createRefactorBuffer();
        await buf.setLines(lines, { start: 0, end: -1, strictIndexing: false });
    }
    /**
     * Create initialized refactor buffer
     */
    async createRefactorBuffer(filetype) {
        let { nvim } = this;
        let [fromWinid, cwd] = await nvim.eval('[win_getid(),getcwd()]');
        let { openCommand } = this.config;
        nvim.pauseNotification();
        nvim.command(`${openCommand} ${name}${refactorId++}`, true);
        nvim.command(`setl buftype=acwrite nobuflisted bufhidden=wipe nofen wrap conceallevel=2 concealcursor=n`, true);
        nvim.command(`setl undolevels=-1 nolist nospell noswapfile foldmethod=expr foldexpr=coc#util#refactor_foldlevel(v:lnum)`, true);
        nvim.command(`setl foldtext=coc#util#refactor_fold_text(v:foldstart)`, true);
        nvim.call('setline', [1, ['Save current buffer to make changes', separator]], true);
        nvim.call('matchadd', ['Comment', '\\%1l'], true);
        nvim.call('matchadd', ['Conceal', '^\\%u3000'], true);
        nvim.call('matchadd', ['Label', '^\\%u3000\\zs\\S\\+'], true);
        nvim.command('setl nomod', true);
        if (filetype)
            nvim.command(`runtime! syntax/${filetype}.vim`, true);
        nvim.call('coc#util#do_autocmd', ['CocRefactorOpen'], true);
        workspace_1.default.registerLocalKeymap('n', '<CR>', this.splitOpen.bind(this), true);
        let [, err] = await nvim.resumeNotification();
        if (err) {
            logger.error(err);
            workspace_1.default.showMessage(`Error on open refactor window: ${err}`, 'error');
            return;
        }
        let [bufnr, win] = await nvim.eval('[bufnr("%"),win_getid()]');
        this.fromWinid = fromWinid;
        this.winid = win;
        this.bufnr = bufnr;
        this.cwd = cwd;
        await this.ensureDocument();
        workspace_1.default.onDidChangeTextDocument(this.onBufferChange, this, this.disposables);
        return nvim.createBuffer(bufnr);
    }
    /**
     * Add FileItem to refactor buffer.
     */
    async addFileItems(items) {
        let { document } = this;
        if (!document)
            return;
        if (document.dirty)
            document.forceSync();
        for (let item of items) {
            let fileItem = this.fileItems.find(o => o.filepath == item.filepath);
            if (fileItem) {
                fileItem.ranges.push(...item.ranges);
            }
            else {
                this.fileItems.push(item);
            }
        }
        let count = document.lineCount;
        let highligher = new highligher_1.default();
        let hlRanges = [];
        for (let item of items) {
            for (let range of item.ranges) {
                highligher.addLine(separator);
                highligher.addLine(separator);
                range.lnum = count + highligher.length;
                highligher.addText(`${this.cwd && fs_1.isParentFolder(this.cwd, item.filepath) ? path_1.default.relative(this.cwd, item.filepath) : item.filepath}`);
                // white spaces for conceal texts
                let n = String(range.start + 1).length + String(range.end).length + 4;
                if (!this.srcId)
                    highligher.addText(' '.repeat(n));
                let base = 0 - highligher.length - count;
                if (range.highlights) {
                    hlRanges.push(...range.highlights.map(r => adjustRange(r, base)));
                }
                let { lines } = range;
                if (!lines) {
                    lines = await this.getLines(item.filepath, range.start, range.end);
                    range.lines = lines;
                }
                highligher.addLines(lines);
            }
        }
        let { nvim, buffer } = this;
        this.version = document.version;
        nvim.pauseNotification();
        highligher.render(buffer, count);
        this.highlightLineNr();
        buffer.setOption('modified', false, true);
        buffer.setOption('undolevels', 1000, true);
        if (count == 2 && hlRanges.length) {
            let pos = hlRanges[0].start;
            nvim.call('coc#util#jumpTo', [pos.line, pos.character], true);
        }
        if (workspace_1.default.isVim) {
            nvim.command('redraw', true);
        }
        let [, err] = await nvim.resumeNotification();
        if (err) {
            logger.error(err);
            return;
        }
        await document.patchChange();
        await commands_1.default.executeCommand('editor.action.addRanges', hlRanges);
    }
    async ensureDocument() {
        let { bufnr } = this;
        let doc = workspace_1.default.getDocument(bufnr);
        if (doc)
            return;
        return new Promise((resolve, reject) => {
            let timer = setTimeout(() => {
                reject(new Error('Document create timeout after 2s.'));
            }, 2000);
            let disposable = workspace_1.default.onDidOpenTextDocument(({ uri }) => {
                let doc = workspace_1.default.getDocument(uri);
                if (doc.bufnr == bufnr) {
                    clearTimeout(timer);
                    disposable.dispose();
                    resolve();
                }
            });
        });
    }
    /**
     * Use conceal to add lineNr
     */
    highlightLineNr() {
        let { fileItems, nvim, winid, srcId, bufnr } = this;
        let info = {};
        if (srcId) {
            nvim.call('nvim_buf_clear_namespace', [bufnr, srcId, 0, -1], true);
            for (let item of fileItems) {
                for (let range of item.ranges) {
                    let text = `${range.start + 1}:${range.end}`;
                    info[range.lnum] = [range.start + 1, range.end];
                    nvim.call('nvim_buf_set_virtual_text', [bufnr, srcId, range.lnum - 1, [[text, 'LineNr']], {}], true);
                }
            }
        }
        else {
            if (this.matchIds.size) {
                nvim.call('coc#util#clearmatches', [Array.from(this.matchIds), this.winid], true);
                this.matchIds.clear();
            }
            let id = 2000;
            for (let item of fileItems) {
                let filename = `${this.cwd ? path_1.default.relative(this.cwd, item.filepath) : item.filepath}`;
                let col = string_1.byteLength(filename) + 1;
                for (let range of item.ranges) {
                    let text = `:${range.start + 1}:${range.end}`;
                    for (let i = 0; i < text.length; i++) {
                        let ch = text[i];
                        this.matchIds.add(id);
                        info[range.lnum] = [range.start + 1, range.end];
                        nvim.call('matchaddpos', ['Conceal', [[range.lnum, col + i]], 99, id, { conceal: ch, window: winid }], true);
                        id++;
                    }
                }
            }
        }
        this.buffer.setVar('line_infos', info, true);
    }
    /**
     * Current changed file ranges
     */
    async getFileChanges() {
        let changes = [];
        let { document } = this;
        if (!document)
            return;
        let lines = await document.buffer.lines;
        lines.push(separator);
        // current lines
        let arr = [];
        let fsPath;
        let lnum;
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (line.startsWith(separator)) {
                if (fsPath) {
                    changes.push({
                        filepath: fsPath,
                        lines: arr,
                        lnum
                    });
                    fsPath = undefined;
                    arr = [];
                }
                if (line.length > 1) {
                    let ms = line.match(/^\u3000(.*)/);
                    if (ms) {
                        let filepath = ms[1].replace(/\s+$/, '');
                        fsPath = !path_1.default.isAbsolute(filepath) && this.cwd ? path_1.default.join(this.cwd, filepath) : filepath;
                        lnum = i + 1;
                        arr = [];
                    }
                }
            }
            else {
                arr.push(line);
            }
        }
        return changes;
    }
    /**
     * Save changes to files, return false when no change made.
     */
    async saveRefactor() {
        let { nvim } = this;
        let doc = this.document;
        if (!doc)
            return;
        let { buffer } = doc;
        await doc.patchChange();
        let changes = await this.getFileChanges();
        if (!changes)
            return;
        changes.sort((a, b) => a.lnum - b.lnum);
        // filter changes that not change
        let removeList = [];
        let deltaMap = new Map();
        for (let i = 0; i < changes.length; i++) {
            let change = changes[i];
            let { filepath, lnum } = change;
            let curr = deltaMap.get(filepath) || 0;
            let item = this.fileItems.find(o => o.filepath == filepath);
            let range = item ? item.ranges.find(o => o.lnum == lnum) : null;
            if (!range || object_1.equals(range.lines, change.lines)) {
                removeList.push(i);
                if (curr) {
                    range.start = range.start + curr;
                    range.end = range.end + curr;
                }
                continue;
            }
            change.start = range.start;
            change.end = range.end;
            if (curr != 0)
                range.start = range.start + curr;
            if (change.lines.length != range.lines.length) {
                let delta = change.lines.length - range.lines.length;
                let total = delta + curr;
                deltaMap.set(filepath, total);
                range.end = range.end + total;
            }
            else {
                range.end = range.end + curr;
            }
            range.lines = change.lines;
        }
        if (removeList.length)
            changes = changes.filter((_, i) => !removeList.includes(i));
        if (changes.length == 0) {
            workspace_1.default.showMessage('No change.', 'more');
            await buffer.setOption('modified', false);
            return false;
        }
        let changeMap = {};
        for (let change of changes) {
            let uri = vscode_uri_1.URI.file(change.filepath).toString();
            let edits = changeMap[uri] || [];
            edits.push({
                range: vscode_languageserver_types_1.Range.create(change.start, 0, change.end, 0),
                newText: change.lines.join('\n') + '\n'
            });
            changeMap[uri] = edits;
        }
        this.changing = true;
        await workspace_1.default.applyEdit({ changes: changeMap });
        this.changing = false;
        nvim.pauseNotification();
        buffer.setOption('modified', false, true);
        nvim.command('silent noa wa', true);
        this.highlightLineNr();
        await nvim.resumeNotification();
        return true;
    }
    getFileRange(lnum) {
        for (let item of this.fileItems) {
            for (let r of item.ranges) {
                if (r.lnum == lnum) {
                    return r;
                }
            }
        }
        return null;
    }
    async onBufferChange(e) {
        if (e.bufnr == this.bufnr) {
            return await this.onRefactorChange(e);
        }
        if (this.changing)
            return;
        let { uri } = e.textDocument;
        if (!('range' in e.contentChanges[0]))
            return;
        let { range, text } = e.contentChanges[0];
        let filepath = vscode_uri_1.URI.parse(uri).fsPath;
        let fileItem = this.fileItems.find(o => o.filepath == filepath);
        if (!fileItem)
            return;
        let lineChange = text.split('\n').length - (range.end.line - range.start.line) - 1;
        let edits = [];
        // 4 cases: ignore, change lineNr, reload, remove
        for (let i = 0; i < fileItem.ranges.length; i++) {
            let r = fileItem.ranges[i];
            if (range.start.line >= r.end) {
                continue;
            }
            if (range.end.line < r.start) {
                if (lineChange == 0) {
                    continue;
                }
                else {
                    r.start = r.start + lineChange;
                    r.end = r.end + lineChange;
                }
            }
            else {
                let doc = workspace_1.default.getDocument(uri);
                let newLines = doc.getLines(r.start, r.end);
                if (!newLines.length) {
                    // remove this range
                    fileItem.ranges.splice(i, 1);
                    edits.push({
                        range: this.getFileRangeRange(r, false),
                        newText: ''
                    });
                }
                else {
                    r.end = r.start + newLines.length;
                    // reload lines, reset end
                    edits.push({
                        range: this.getFileRangeRange(r, true),
                        newText: newLines.join('\n') + '\n'
                    });
                }
            }
            let buf = this.document.buffer;
            let mod = await buf.getOption('modified');
            if (edits.length) {
                this.version = this.document.version;
                await this.document.applyEdits(edits);
            }
            this.nvim.pauseNotification();
            this.highlightLineNr();
            if (!mod)
                buf.setOption('modified', false, true);
            await this.nvim.resumeNotification();
        }
    }
    /**
     * Edit range of FileRange
     */
    getFileRangeRange(range, lineOnly = true) {
        let { document } = this;
        if (!document)
            return null;
        let { lnum } = range;
        let first = document.getline(lnum - 1);
        if (!first.startsWith('\u3000'))
            return null;
        let start = lineOnly ? lnum : lnum - 1;
        let end = document.lineCount;
        for (let i = lnum; i < document.lineCount; i++) {
            let line = document.getline(i);
            if (line.startsWith('\u3000')) {
                end = lineOnly ? i : i + 1;
                break;
            }
        }
        return vscode_languageserver_types_1.Range.create(start, 0, end, 0);
    }
    /**
     * Open line under cursor in split window
     */
    async splitOpen() {
        let { nvim } = this;
        let win = nvim.createWindow(this.fromWinid);
        let valid = await win.valid;
        let lines = await nvim.eval('getline(1,line("."))');
        let len = lines.length;
        for (let i = 0; i < len; i++) {
            let line = lines[len - i - 1];
            let ms = line.match(/^\u3000(.+)/);
            if (ms) {
                let filepath = ms[1].trim();
                let r = this.getLinesRange(len - i);
                if (!r)
                    return;
                let lnum = r[0] + i;
                let bufname = filepath.startsWith(workspace_1.default.cwd) ? path_1.default.relative(workspace_1.default.cwd, filepath) : filepath;
                nvim.pauseNotification();
                if (valid) {
                    nvim.call('win_gotoid', [this.fromWinid], true);
                    this.nvim.call('coc#util#jump', ['edit', bufname, [lnum, 1]], true);
                }
                else {
                    this.nvim.call('coc#util#jump', ['belowright vs', bufname, [lnum, 1]], true);
                }
                nvim.command('normal! zz', true);
                let [, err] = await nvim.resumeNotification();
                if (err)
                    workspace_1.default.showMessage(`Error on open ${filepath}: ${err}`, 'error');
                if (!valid) {
                    this.fromWinid = await nvim.call('win_getid');
                }
                break;
            }
        }
    }
    async onRefactorChange(e) {
        let { nvim } = this;
        let doc = this.document;
        if (doc.version - this.version == 1)
            return;
        let { fileItems } = this;
        if (!fileItems.length)
            return;
        let change = e.contentChanges[0];
        if (!('range' in change))
            return;
        let { original } = e;
        if (change.range.end.line < 2)
            return;
        doc.buffer.setOption('modified', true, true);
        let { range, text } = change;
        let lines = text.split('\n');
        let lineChange = lines.length - (range.end.line - range.start.line) - 1;
        if (lineChange == 0)
            return;
        let lineChanges = [];
        if (text.includes('\u3000')) {
            let startLine = range.start.line;
            let diffs = fast_diff_1.default(original, text);
            let offset = 0;
            let orig = vscode_languageserver_textdocument_1.TextDocument.create('file:///1', '', 0, original);
            for (let i = 0; i < diffs.length; i++) {
                let diff = diffs[i];
                let pos = orig.positionAt(offset);
                if (diff[0] == fast_diff_1.default.EQUAL) {
                    offset = offset + diff[1].length;
                }
                else if (diff[0] == fast_diff_1.default.DELETE) {
                    let end = orig.positionAt(offset + diff[1].length);
                    if (diffs[i + 1] && diffs[i + 1][0] == fast_diff_1.default.INSERT) {
                        let delta = diffs[i + 1][1].split('\n').length - (end.line - pos.line) - 1;
                        if (delta != 0)
                            lineChanges.push({ delta, lnum: pos.line + startLine });
                        i = i + 1;
                    }
                    else {
                        let delta = -(end.line - pos.line);
                        if (delta != 0)
                            lineChanges.push({ delta, lnum: pos.line + startLine });
                    }
                    offset = offset + diff[1].length;
                }
                else if (diff[0] == fast_diff_1.default.INSERT) {
                    let delta = diff[1].split('\n').length - 1;
                    if (delta != 0)
                        lineChanges.push({ delta, lnum: pos.line + startLine });
                }
            }
        }
        else {
            lineChanges = [{ delta: lineChange, lnum: range.start.line }];
        }
        let changed = false;
        // adjust LineNr highlights
        for (let item of fileItems) {
            for (let range of item.ranges) {
                let arr = lineChanges.filter(o => o.lnum < range.lnum - 1);
                if (arr.length) {
                    let total = arr.reduce((p, c) => p + c.delta, 0);
                    range.lnum = range.lnum + total;
                    changed = true;
                }
            }
        }
        if (!changed || this.srcId)
            return;
        let winid = await nvim.call('win_getid');
        if (winid != this.winid) {
            await nvim.call('win_gotoid', [winid]);
        }
        nvim.pauseNotification();
        this.highlightLineNr();
        await nvim.resumeNotification();
    }
    async getItemsFromWorkspaceEdit(edit) {
        let res = [];
        let { beforeContext, afterContext } = this.config;
        let { changes, documentChanges } = edit;
        if (!changes) {
            changes = {};
            for (let change of documentChanges || []) {
                if (vscode_languageserver_types_1.TextDocumentEdit.is(change)) {
                    let { textDocument, edits } = change;
                    changes[textDocument.uri] = edits;
                }
            }
        }
        for (let key of Object.keys(changes)) {
            let max = await this.getLineCount(key);
            let edits = changes[key];
            let ranges = [];
            // start end highlights
            let start = null;
            let end = null;
            let highlights = [];
            edits.sort((a, b) => a.range.start.line - b.range.start.line);
            for (let edit of edits) {
                let { line } = edit.range.start;
                let s = Math.max(0, line - beforeContext);
                if (start != null && s < end) {
                    end = Math.min(max, line + afterContext + 1);
                    highlights.push(adjustRange(edit.range, start));
                }
                else {
                    if (start != null)
                        ranges.push({ start, end, highlights });
                    start = s;
                    end = Math.min(max, line + afterContext + 1);
                    highlights = [adjustRange(edit.range, start)];
                }
            }
            if (start != null)
                ranges.push({ start, end, highlights });
            res.push({
                ranges,
                filepath: vscode_uri_1.URI.parse(key).fsPath
            });
        }
        return res;
    }
    async getLineCount(uri) {
        let doc = workspace_1.default.getDocument(uri);
        if (doc)
            return doc.lineCount;
        return await fs_1.getFileLineCount(vscode_uri_1.URI.parse(uri).fsPath);
    }
    async getLines(fsPath, start, end) {
        let uri = vscode_uri_1.URI.file(fsPath).toString();
        let doc = workspace_1.default.getDocument(uri);
        if (doc)
            return doc.getLines(start, end);
        return await fs_1.readFileLines(fsPath, start, end - 1);
    }
    getLinesRange(lnum) {
        for (let item of this.fileItems) {
            for (let range of item.ranges) {
                if (range.lnum == lnum) {
                    return [range.start, range.end];
                }
            }
        }
        return null;
    }
    dispose() {
        this.fileItems = [];
        util_1.disposeAll(this.disposables);
    }
    /**
     * Refactor from workspaceEdit.
     */
    static async createFromWorkspaceEdit(edit, filetype) {
        if (!edit || emptyWorkspaceEdit(edit))
            return null;
        let refactor = new Refactor();
        await refactor.fromWorkspaceEdit(edit, filetype);
        return refactor;
    }
    /**
     * Refactor from locations.
     */
    static async createFromLocations(locations, filetype) {
        if (!locations || locations.length == 0)
            return null;
        let changes = {};
        let edit = { changes };
        for (let location of locations) {
            let edits = changes[location.uri] || [];
            edits.push({ range: location.range, newText: '' });
            changes[location.uri] = edits;
        }
        let refactor = new Refactor();
        await refactor.fromWorkspaceEdit(edit, filetype);
        return refactor;
    }
    static async createFromLines(lines) {
        let refactor = new Refactor();
        await refactor.fromLines(lines);
        return refactor;
    }
}
exports.default = Refactor;
function adjustRange(range, offset) {
    let { start, end } = range;
    return vscode_languageserver_types_1.Range.create(start.line - offset, start.character, end.line - offset, end.character);
}
function emptyWorkspaceEdit(edit) {
    let { changes, documentChanges } = edit;
    if (documentChanges && documentChanges.length)
        return false;
    if (changes && Object.keys(changes).length)
        return false;
    return true;
}
//# sourceMappingURL=refactor.js.map