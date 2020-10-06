"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeSnippetString = exports.SnippetSession = void 0;
const tslib_1 = require("tslib");
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const completion_1 = tslib_1.__importDefault(require("../completion"));
const position_1 = require("../util/position");
const string_1 = require("../util/string");
const workspace_1 = tslib_1.__importDefault(require("../workspace"));
const snippet_1 = require("./snippet");
const variableResolve_1 = require("./variableResolve");
const logger = require('../util/logger')('snippets-session');
class SnippetSession {
    constructor(nvim, bufnr) {
        this.nvim = nvim;
        this.bufnr = bufnr;
        this._isActive = false;
        this._currId = 0;
        // Get state of line where we inserted
        this.applying = false;
        this.preferComplete = false;
        this._snippet = null;
        this._onCancelEvent = new vscode_languageserver_protocol_1.Emitter();
        this.onCancel = this._onCancelEvent.event;
        let config = workspace_1.default.getConfiguration('coc.preferences');
        let suggest = workspace_1.default.getConfiguration('suggest');
        this.preferComplete = config.get('preferCompleteThanJumpPlaceholder', suggest.get('preferCompleteThanJumpPlaceholder', false));
    }
    async start(snippetString, select = true, range) {
        const { document } = this;
        if (!document || !document.attached)
            return false;
        if (!range) {
            let position = await workspace_1.default.getCursorPosition();
            range = vscode_languageserver_protocol_1.Range.create(position, position);
        }
        let position = range.start;
        const formatOptions = await workspace_1.default.getFormatOptions(this.document.uri);
        const currentLine = document.getline(position.line);
        const currentIndent = currentLine.match(/^\s*/)[0];
        let inserted = normalizeSnippetString(snippetString, currentIndent, formatOptions);
        const resolver = new variableResolve_1.SnippetVariableResolver();
        await resolver.init(document);
        const snippet = new snippet_1.CocSnippet(inserted, position, resolver);
        const edit = vscode_languageserver_protocol_1.TextEdit.replace(range, snippet.toString());
        if (snippetString.endsWith('\n')
            && currentLine.slice(position.character).length) {
            // make next line same indent
            edit.newText = edit.newText + currentIndent;
            inserted = inserted + currentIndent;
        }
        await document.patchChange();
        this.applying = true;
        await document.applyEdits([edit]);
        this.applying = false;
        if (this._isActive) {
            // find valid placeholder
            let placeholder = this.findPlaceholder(range);
            // insert to placeholder
            if (placeholder && !placeholder.isFinalTabstop) {
                // don't repeat snippet insert
                let index = this.snippet.insertSnippet(placeholder, inserted, range);
                let p = this.snippet.getPlaceholder(index);
                this._currId = p.id;
                if (select)
                    await this.selectPlaceholder(p);
                return true;
            }
        }
        if (snippet.isPlainText) {
            this.deactivate();
            let placeholder = snippet.finalPlaceholder;
            await workspace_1.default.moveTo(placeholder.range.start);
            return false;
        }
        // new snippet
        this._snippet = snippet;
        this._currId = snippet.firstPlaceholder.id;
        if (select)
            await this.selectPlaceholder(snippet.firstPlaceholder);
        this.activate();
        return true;
    }
    activate() {
        if (this._isActive)
            return;
        this._isActive = true;
        this.nvim.call('coc#snippet#enable', [], true);
    }
    deactivate() {
        if (this._isActive) {
            this._isActive = false;
            this._snippet = null;
            this.nvim.call('coc#snippet#disable', [], true);
            logger.debug("[SnippetManager::cancel]");
        }
        this._onCancelEvent.fire(void 0);
        this._onCancelEvent.dispose();
    }
    get isActive() {
        return this._isActive;
    }
    async nextPlaceholder() {
        if (!this.isActive)
            return;
        await this.document.patchChange();
        let curr = this.placeholder;
        let next = this.snippet.getNextPlaceholder(curr.index);
        await this.selectPlaceholder(next);
    }
    async previousPlaceholder() {
        if (!this.isActive)
            return;
        await this.document.patchChange();
        let curr = this.placeholder;
        let prev = this.snippet.getPrevPlaceholder(curr.index);
        await this.selectPlaceholder(prev);
    }
    async synchronizeUpdatedPlaceholders(change) {
        if (!this.isActive || !this.document || this.applying)
            return;
        let edit = { range: change.range, newText: change.text };
        let { snippet } = this;
        // change outside range
        let adjusted = snippet.adjustTextEdit(edit);
        if (adjusted)
            return;
        if (position_1.comparePosition(edit.range.start, snippet.range.end) > 0) {
            if (!edit.newText)
                return;
            logger.info('Content change after snippet, cancelling snippet session');
            this.deactivate();
            return;
        }
        let placeholder = this.findPlaceholder(edit.range);
        if (!placeholder) {
            logger.info('Change outside placeholder, cancelling snippet session');
            this.deactivate();
            return;
        }
        if (placeholder.isFinalTabstop && snippet.finalCount <= 1) {
            logger.info('Change final placeholder, cancelling snippet session');
            this.deactivate();
            return;
        }
        this._currId = placeholder.id;
        let { edits, delta } = snippet.updatePlaceholder(placeholder, edit);
        if (!edits.length)
            return;
        this.applying = true;
        await this.document.applyEdits(edits);
        this.applying = false;
        if (delta) {
            await this.nvim.call('coc#util#move_cursor', delta);
        }
    }
    async selectCurrentPlaceholder(triggerAutocmd = true) {
        let placeholder = this.snippet.getPlaceholderById(this._currId);
        if (placeholder)
            await this.selectPlaceholder(placeholder, triggerAutocmd);
    }
    async selectPlaceholder(placeholder, triggerAutocmd = true) {
        let { nvim, document } = this;
        if (!document || !placeholder)
            return;
        let { start, end } = placeholder.range;
        const len = end.character - start.character;
        const col = string_1.byteLength(document.getline(start.line).slice(0, start.character)) + 1;
        this._currId = placeholder.id;
        if (placeholder.choice) {
            await nvim.call('coc#snippet#show_choices', [start.line + 1, col, len, placeholder.choice]);
            if (triggerAutocmd)
                nvim.call('coc#util#do_autocmd', ['CocJumpPlaceholder'], true);
        }
        else {
            await this.select(placeholder, triggerAutocmd);
        }
    }
    async select(placeholder, triggerAutocmd = true) {
        let { range, value, isFinalTabstop } = placeholder;
        let { document, nvim } = this;
        let { start, end } = range;
        let { textDocument } = document;
        let len = textDocument.offsetAt(end) - textDocument.offsetAt(start);
        let line = document.getline(start.line);
        let col = line ? string_1.byteLength(line.slice(0, start.character)) : 0;
        let endLine = document.getline(end.line);
        let endCol = endLine ? string_1.byteLength(endLine.slice(0, end.character)) : 0;
        nvim.setVar('coc_last_placeholder', {
            current_text: value,
            start: { line: start.line, col },
            end: { line: end.line, col: endCol }
        }, true);
        let [ve, selection, pumvisible, mode] = await nvim.eval('[&virtualedit, &selection, pumvisible(), mode()]');
        let move_cmd = '';
        if (pumvisible && this.preferComplete) {
            let pre = completion_1.default.hasSelected() ? '' : '\\<C-n>';
            await nvim.eval(`feedkeys("${pre}\\<C-y>", 'in')`);
            return;
        }
        // create move cmd
        if (mode != 'n')
            move_cmd += "\\<Esc>";
        if (len == 0) {
            if (col == 0 || (!mode.startsWith('i') && col < string_1.byteLength(line))) {
                move_cmd += 'i';
            }
            else {
                move_cmd += 'a';
            }
        }
        else {
            move_cmd += 'v';
            endCol = await this.getVirtualCol(end.line + 1, endCol);
            if (selection == 'inclusive') {
                if (end.character == 0) {
                    move_cmd += `${end.line}G`;
                }
                else {
                    move_cmd += `${end.line + 1}G${endCol}|`;
                }
            }
            else if (selection == 'old') {
                move_cmd += `${end.line + 1}G${endCol}|`;
            }
            else {
                move_cmd += `${end.line + 1}G${endCol + 1}|`;
            }
            col = await this.getVirtualCol(start.line + 1, col);
            move_cmd += `o${start.line + 1}G${col + 1}|o\\<c-g>`;
        }
        if (mode == 'i' && move_cmd == "\\<Esc>a") {
            move_cmd = '';
        }
        nvim.pauseNotification();
        nvim.setOption('virtualedit', 'onemore', true);
        nvim.call('cursor', [start.line + 1, col + (move_cmd == 'a' ? 0 : 1)], true);
        if (move_cmd) {
            nvim.call('eval', [`feedkeys("${move_cmd}", 'in')`], true);
        }
        if (mode == 'i') {
            nvim.call('coc#_cancel', [], true);
        }
        nvim.setOption('virtualedit', ve, true);
        if (isFinalTabstop) {
            if (this.snippet.finalCount == 1) {
                logger.info('Jump to final placeholder, cancelling snippet session');
                this.deactivate();
            }
            else {
                nvim.call('coc#snippet#disable', [], true);
            }
        }
        if (workspace_1.default.env.isVim)
            nvim.command('redraw', true);
        await nvim.resumeNotification();
        if (triggerAutocmd)
            nvim.call('coc#util#do_autocmd', ['CocJumpPlaceholder'], true);
    }
    async getVirtualCol(line, col) {
        let { nvim } = this;
        return await nvim.eval(`virtcol([${line}, ${col}])`);
    }
    async checkPosition() {
        if (!this.isActive)
            return;
        let position = await workspace_1.default.getCursorPosition();
        if (this.snippet && position_1.positionInRange(position, this.snippet.range) != 0) {
            logger.info('Cursor insert out of range, cancelling snippet session');
            this.deactivate();
        }
    }
    findPlaceholder(range) {
        if (!this.snippet)
            return null;
        let { placeholder } = this;
        if (placeholder && position_1.rangeInRange(range, placeholder.range))
            return placeholder;
        return this.snippet.getPlaceholderByRange(range) || null;
    }
    get placeholder() {
        if (!this.snippet)
            return null;
        return this.snippet.getPlaceholderById(this._currId);
    }
    get snippet() {
        return this._snippet;
    }
    get document() {
        return workspace_1.default.getDocument(this.bufnr);
    }
}
exports.SnippetSession = SnippetSession;
function normalizeSnippetString(snippet, indent, opts) {
    let lines = snippet.split(/\r?\n/);
    let ind = opts.insertSpaces ? ' '.repeat(opts.tabSize) : '\t';
    let tabSize = opts.tabSize || 2;
    lines = lines.map((line, idx) => {
        let space = line.match(/^\s*/)[0];
        let pre = space;
        let isTab = space.startsWith('\t');
        if (isTab && opts.insertSpaces) {
            pre = ind.repeat(space.length);
        }
        else if (!isTab && !opts.insertSpaces) {
            pre = ind.repeat(space.length / tabSize);
        }
        return (idx == 0 || line.length == 0 ? '' : indent) + pre + line.slice(space.length);
    });
    return lines.join('\n');
}
exports.normalizeSnippetString = normalizeSnippetString;
//# sourceMappingURL=session.js.map