"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnosticBuffer = void 0;
const tslib_1 = require("tslib");
const debounce_1 = tslib_1.__importDefault(require("debounce"));
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const workspace_1 = tslib_1.__importDefault(require("../workspace"));
const util_1 = require("./util");
const logger = require('../util/logger')('diagnostic-buffer');
const severityNames = ['CocError', 'CocWarning', 'CocInfo', 'CocHint'];
// maintains sign and highlightId
class DiagnosticBuffer {
    constructor(bufnr, uri, config) {
        this.bufnr = bufnr;
        this.uri = uri;
        this.config = config;
        this.signIds = new Set();
        this._onDidRefresh = new vscode_languageserver_protocol_1.Emitter();
        this.matchIds = new Set();
        this.onDidRefresh = this._onDidRefresh.event;
        this.srdId = workspace_1.default.createNameSpace('coc-diagnostic');
        this.refresh = debounce_1.default((diagnostics) => {
            this._refresh(diagnostics).logError();
        }, 300);
    }
    /**
     * Refresh diagnostics without debounce
     */
    forceRefresh(diagnostics) {
        this.refresh.clear();
        this._refresh(diagnostics).logError();
    }
    async _refresh(diagnostics) {
        let { refreshOnInsertMode } = this.config;
        let { nvim } = this;
        let arr = await nvim.eval(`[coc#util#check_refresh(${this.bufnr}),mode(),bufnr("%"),line("."),getloclist(bufwinid(${this.bufnr}),{'title':1})]`);
        if (arr[0] == 0)
            return;
        let mode = arr[1];
        if (!refreshOnInsertMode && mode.startsWith('i') && diagnostics.length)
            return;
        let bufnr = arr[2];
        let lnum = arr[3];
        nvim.pauseNotification();
        this.setDiagnosticInfo(diagnostics);
        this.addSigns(diagnostics);
        this.addHighlight(diagnostics, bufnr);
        this.updateLocationList(arr[4], diagnostics);
        if (this.bufnr == bufnr) {
            this.showVirtualText(diagnostics, lnum);
        }
        if (workspace_1.default.isVim) {
            this.nvim.command('redraw', true);
        }
        let res = await this.nvim.resumeNotification();
        if (Array.isArray(res) && res[1])
            throw new Error(res[1]);
        this._onDidRefresh.fire(void 0);
    }
    clearSigns() {
        let { nvim, signIds, bufnr } = this;
        if (signIds.size > 0) {
            nvim.call('coc#util#unplace_signs', [bufnr, Array.from(signIds)], true);
            signIds.clear();
        }
    }
    async checkSigns() {
        let { nvim, bufnr, signIds } = this;
        try {
            let content = await this.nvim.call('execute', [`sign place buffer=${bufnr}`]);
            let lines = content.split('\n');
            let ids = [];
            for (let line of lines) {
                let ms = line.match(/^\s*line=\d+\s+id=(\d+)\s+name=(\w+)/);
                if (!ms)
                    continue;
                let [, id, name] = ms;
                if (!signIds.has(Number(id)) && severityNames.includes(name)) {
                    ids.push(id);
                }
            }
            await nvim.call('coc#util#unplace_signs', [bufnr, ids]);
        }
        catch (e) {
            // noop
        }
    }
    updateLocationList(curr, diagnostics) {
        if (!this.config.locationlistUpdate)
            return;
        if (!curr || curr.title !== 'Diagnostics of coc')
            return;
        let items = [];
        for (let diagnostic of diagnostics) {
            let item = util_1.getLocationListItem(this.bufnr, diagnostic);
            items.push(item);
        }
        this.nvim.call('setloclist', [0, [], 'r', { title: 'Diagnostics of coc', items }], true);
    }
    addSigns(diagnostics) {
        if (!this.config.enableSign)
            return;
        this.clearSigns();
        let { nvim, bufnr, signIds } = this;
        let signId = this.config.signOffset;
        let lines = new Set();
        for (let diagnostic of diagnostics) {
            let { range, severity } = diagnostic;
            let line = range.start.line;
            if (lines.has(line))
                continue;
            lines.add(line);
            let name = util_1.getNameFromSeverity(severity);
            nvim.command(`sign place ${signId} line=${line + 1} name=${name} buffer=${bufnr}`, true);
            signIds.add(signId);
            signId = signId + 1;
        }
    }
    setDiagnosticInfo(diagnostics) {
        let lnums = [0, 0, 0, 0];
        let info = { error: 0, warning: 0, information: 0, hint: 0, lnums };
        for (let diagnostic of diagnostics) {
            switch (diagnostic.severity) {
                case vscode_languageserver_protocol_1.DiagnosticSeverity.Warning:
                    info.warning = info.warning + 1;
                    lnums[1] = lnums[1] || diagnostic.range.start.line + 1;
                    break;
                case vscode_languageserver_protocol_1.DiagnosticSeverity.Information:
                    info.information = info.information + 1;
                    lnums[2] = lnums[2] || diagnostic.range.start.line + 1;
                    break;
                case vscode_languageserver_protocol_1.DiagnosticSeverity.Hint:
                    info.hint = info.hint + 1;
                    lnums[3] = lnums[3] || diagnostic.range.start.line + 1;
                    break;
                default:
                    lnums[0] = lnums[0] || diagnostic.range.start.line + 1;
                    info.error = info.error + 1;
            }
        }
        this.nvim.call('coc#util#set_buf_var', [this.bufnr, 'coc_diagnostic_info', info], true);
        this.nvim.call('coc#util#do_autocmd', ['CocDiagnosticChange'], true);
    }
    showVirtualText(diagnostics, lnum) {
        let { bufnr, config } = this;
        if (!config.virtualText)
            return;
        let buffer = this.nvim.createBuffer(bufnr);
        let srcId = this.config.virtualTextSrcId;
        let prefix = this.config.virtualTextPrefix;
        if (this.config.virtualTextCurrentLineOnly) {
            diagnostics = diagnostics.filter(d => {
                let { start, end } = d.range;
                return start.line <= lnum - 1 && end.line >= lnum - 1;
            });
        }
        buffer.clearNamespace(srcId);
        for (let diagnostic of diagnostics) {
            let { line } = diagnostic.range.start;
            let highlight = util_1.getNameFromSeverity(diagnostic.severity) + 'VirtualText';
            let msg = diagnostic.message.split(/\n/)
                .map((l) => l.trim())
                .filter((l) => l.length > 0)
                .slice(0, this.config.virtualTextLines)
                .join(this.config.virtualTextLineSeparator);
            buffer.setVirtualText(srcId, line, [[prefix + msg, highlight]], {}).logError();
        }
    }
    clearHighlight() {
        let { matchIds, document } = this;
        if (document) {
            document.clearMatchIds(matchIds);
        }
        this.matchIds.clear();
    }
    addHighlight(diagnostics, bufnr) {
        this.clearHighlight();
        if (diagnostics.length == 0)
            return;
        // can't add highlight for old vim
        if (workspace_1.default.isVim && !workspace_1.default.env.textprop && bufnr != this.bufnr)
            return;
        let { document } = this;
        if (!document)
            return;
        // TODO support DiagnosticTag
        const highlights = new Map();
        for (let diagnostic of diagnostics) {
            let { range, severity } = diagnostic;
            let hlGroup = util_1.getNameFromSeverity(severity) + 'Highlight';
            let ranges = highlights.get(hlGroup) || [];
            ranges.push(range);
            highlights.set(hlGroup, ranges);
        }
        for (let [hlGroup, ranges] of highlights.entries()) {
            let matchIds = document.highlightRanges(ranges, hlGroup, this.srdId);
            for (let id of matchIds)
                this.matchIds.add(id);
        }
    }
    /**
     * Used on buffer unload
     *
     * @public
     * @returns {Promise<void>}
     */
    async clear() {
        this.refresh.clear();
        let { nvim } = this;
        nvim.pauseNotification();
        this.clearHighlight();
        this.clearSigns();
        if (this.config.virtualText) {
            let buffer = nvim.createBuffer(this.bufnr);
            buffer.clearNamespace(this.config.virtualTextSrcId);
        }
        this.setDiagnosticInfo([]);
        await nvim.resumeNotification(false, true);
    }
    hasHighlights() {
        return this.matchIds.size > 0;
    }
    dispose() {
        this.refresh.clear();
        this._onDidRefresh.dispose();
    }
    get document() {
        return workspace_1.default.getDocument(this.uri);
    }
    get nvim() {
        return workspace_1.default.nvim;
    }
}
exports.DiagnosticBuffer = DiagnosticBuffer;
//# sourceMappingURL=buffer.js.map