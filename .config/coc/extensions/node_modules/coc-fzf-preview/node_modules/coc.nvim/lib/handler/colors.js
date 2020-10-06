"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const debounce_1 = tslib_1.__importDefault(require("debounce"));
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const events_1 = tslib_1.__importDefault(require("../events"));
const languages_1 = tslib_1.__importDefault(require("../languages"));
const util_1 = require("../util");
const object_1 = require("../util/object");
const workspace_1 = tslib_1.__importDefault(require("../workspace"));
const highlighter_1 = tslib_1.__importStar(require("./highlighter"));
const logger = require('../util/logger')('colors');
class Colors {
    constructor(nvim) {
        this.nvim = nvim;
        this._enabled = true;
        this.srcId = 1090;
        this.disposables = [];
        this.highlighters = new Map();
        this.highlightCurrent = debounce_1.default(() => {
            this._highlightCurrent().catch(e => {
                logger.error('highlight error:', e.stack);
            });
        }, 200);
        let config = workspace_1.default.getConfiguration('coc.preferences');
        this._enabled = config.get('colorSupport', true);
        this.srcId = workspace_1.default.createNameSpace('coc-colors');
        let timer = setTimeout(async () => {
            // wait for extensions
            await this._highlightCurrent();
        }, 2000);
        this.disposables.push(vscode_languageserver_protocol_1.Disposable.create(() => {
            clearTimeout(timer);
        }));
        events_1.default.on('BufEnter', async () => {
            if (global.hasOwnProperty('__TEST__'))
                return;
            this.highlightCurrent();
        }, null, this.disposables);
        events_1.default.on('InsertLeave', async () => {
            this.highlightCurrent();
        }, null, this.disposables);
        events_1.default.on('BufUnload', async (bufnr) => {
            let highlighter = this.highlighters.get(bufnr);
            if (highlighter) {
                highlighter.dispose();
                this.highlighters.delete(bufnr);
            }
        }, null, this.disposables);
        workspace_1.default.onDidChangeTextDocument(async ({ textDocument }) => {
            if (workspace_1.default.insertMode)
                return;
            let doc = workspace_1.default.getDocument(textDocument.uri);
            if (doc && doc.bufnr == workspace_1.default.bufnr) {
                await util_1.wait(50);
                await this.highlightColors(doc);
            }
        }, null, this.disposables);
        workspace_1.default.onDidChangeConfiguration(async (e) => {
            if (e.affectsConfiguration('coc.preferences.colorSupport')) {
                let config = workspace_1.default.getConfiguration('coc.preferences');
                this._enabled = config.get('colorSupport', true);
            }
        }, null, this.disposables);
    }
    async _highlightCurrent() {
        if (!this.enabled)
            return;
        let { bufnr } = workspace_1.default;
        let doc = workspace_1.default.getDocument(bufnr);
        if (doc)
            await this.highlightColors(doc);
    }
    async highlightColors(document, force = false) {
        if (!this.enabled)
            return;
        if (['help', 'terminal', 'quickfix'].includes(document.buftype))
            return;
        let { version, changedtick } = document;
        let highlighter = this.getHighlighter(document.bufnr);
        if (!highlighter || (highlighter.version == version && !force))
            return;
        let colors;
        try {
            colors = await languages_1.default.provideDocumentColors(document.textDocument);
            colors = colors || [];
            if (changedtick != document.changedtick)
                return;
            if (!force && object_1.equals(highlighter.colors, colors))
                return;
            await highlighter.highlight(colors);
        }
        catch (e) {
            logger.error(e.stack);
        }
    }
    async pickPresentation() {
        let info = await this.currentColorInfomation();
        if (!info)
            return workspace_1.default.showMessage('Color not found at current position', 'warning');
        let document = await workspace_1.default.document;
        let presentations = await languages_1.default.provideColorPresentations(info, document.textDocument);
        if (!presentations || presentations.length == 0)
            return;
        let res = await workspace_1.default.showQuickpick(presentations.map(o => o.label), 'choose a color presentation:');
        if (res == -1)
            return;
        let presentation = presentations[res];
        let { textEdit, additionalTextEdits, label } = presentation;
        if (!textEdit)
            textEdit = { range: info.range, newText: label };
        await document.applyEdits([textEdit]);
        if (additionalTextEdits) {
            await document.applyEdits(additionalTextEdits);
        }
    }
    async pickColor() {
        let info = await this.currentColorInfomation();
        if (!info)
            return workspace_1.default.showMessage('Color not found at current position', 'warning');
        let { color } = info;
        let colorArr = [(color.red * 255).toFixed(0), (color.green * 255).toFixed(0), (color.blue * 255).toFixed(0)];
        let res = await this.nvim.call('coc#util#pick_color', [colorArr]);
        if (res === false) {
            // cancel
            return;
        }
        if (!res || res.length != 3) {
            workspace_1.default.showMessage('Failed to get color', 'warning');
            return;
        }
        let hex = highlighter_1.toHexString({
            red: (res[0] / 65535),
            green: (res[1] / 65535),
            blue: (res[2] / 65535),
            alpha: 1
        });
        let document = await workspace_1.default.document;
        await document.applyEdits([{
                range: info.range,
                newText: `#${hex}`
            }]);
    }
    get enabled() {
        return this._enabled;
    }
    clearHighlight(bufnr) {
        let highlighter = this.highlighters.get(bufnr);
        if (!highlighter)
            return;
        highlighter.clearHighlight();
    }
    hasColor(bufnr) {
        let highlighter = this.highlighters.get(bufnr);
        if (!highlighter)
            return false;
        return highlighter.hasColor();
    }
    hasColorAtPostion(bufnr, position) {
        let highlighter = this.highlighters.get(bufnr);
        if (!highlighter)
            return false;
        return highlighter.hasColorAtPostion(position);
    }
    dispose() {
        this.highlightCurrent.clear();
        for (let highlighter of this.highlighters.values()) {
            highlighter.dispose();
        }
        util_1.disposeAll(this.disposables);
    }
    getHighlighter(bufnr) {
        let obj = this.highlighters.get(bufnr);
        if (obj)
            return obj;
        let doc = workspace_1.default.getDocument(bufnr);
        if (!doc)
            return null;
        obj = new highlighter_1.default(this.nvim, doc, this.srcId);
        this.highlighters.set(bufnr, obj);
        return obj;
    }
    async currentColorInfomation() {
        let bufnr = await this.nvim.call('bufnr', '%');
        let highlighter = this.highlighters.get(bufnr);
        if (!highlighter)
            return;
        let position = await workspace_1.default.getCursorPosition();
        for (let info of highlighter.colors) {
            let { range } = info;
            let { start, end } = range;
            if (position.line == start.line
                && position.character >= start.character
                && position.character <= end.character) {
                return info;
            }
        }
        return null;
    }
}
exports.default = Colors;
//# sourceMappingURL=colors.js.map