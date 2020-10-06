"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const array_1 = require("../util/array");
const highlight_1 = require("../util/highlight");
const string_1 = require("../util/string");
const workspace_1 = tslib_1.__importDefault(require("../workspace"));
const logger = require('../util/logger')('model-floatBuffer');
class FloatBuffer {
    constructor(nvim) {
        this.nvim = nvim;
        this.lines = [];
        this.positions = [];
        this.enableHighlight = true;
        this.highlightTimeout = 500;
        let config = workspace_1.default.getConfiguration('coc.preferences');
        this.enableHighlight = config.get('enableFloatHighlight', true);
        this.highlightTimeout = config.get('highlightTimeout', 500);
    }
    async setDocuments(docs, width) {
        let fragments = this.calculateFragments(docs, width);
        let { filetype } = docs[0];
        if (!highlight_1.diagnosticFiletypes.includes(filetype)) {
            this.filetype = filetype;
        }
        if (workspace_1.default.isNvim) {
            fragments = fragments.reduce((p, c) => {
                p.push(...this.splitFragment(c, 'sh'));
                return p;
            }, []);
        }
        if (this.enableHighlight) {
            let arr = await Promise.all(fragments.map(f => highlight_1.getHiglights(f.lines, f.filetype, this.highlightTimeout).then(highlights => highlights.map(highlight => Object.assign({}, highlight, { line: highlight.line + f.start })))));
            this.highlights = arr.reduce((p, c) => p.concat(c), []);
        }
        else {
            this.highlights = [];
        }
    }
    splitFragment(fragment, defaultFileType) {
        let res = [];
        let filetype = fragment.filetype;
        let lines = [];
        let curr = fragment.start;
        let inBlock = false;
        for (let line of fragment.lines) {
            let ms = line.match(/^\s*```\s*(\w+)?/);
            if (ms != null) {
                if (lines.length) {
                    res.push({ lines, filetype: fixFiletype(filetype), start: curr - lines.length });
                    lines = [];
                }
                inBlock = !inBlock;
                filetype = inBlock ? ms[1] || defaultFileType : fragment.filetype;
            }
            else {
                lines.push(line);
                curr = curr + 1;
            }
        }
        if (lines.length) {
            res.push({ lines, filetype: fixFiletype(filetype), start: curr - lines.length });
            lines = [];
        }
        return res;
    }
    setLines(bufnr, winid) {
        let { lines, nvim, highlights } = this;
        let buffer = nvim.createBuffer(bufnr);
        nvim.call('clearmatches', winid ? [winid] : [], true);
        // vim will clear text properties
        if (workspace_1.default.isNvim)
            buffer.clearNamespace(-1, 0, -1);
        if (workspace_1.default.isNvim) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            buffer.setLines(lines, { start: 0, end: -1, strictIndexing: false }, true);
        }
        else {
            nvim.call('coc#util#set_buf_lines', [bufnr, lines], true);
        }
        if (highlights && highlights.length) {
            let positions = [];
            for (let highlight of highlights) {
                if (highlight.hlGroup == 'htmlBold') {
                    highlight.hlGroup = 'CocBold';
                }
                buffer.addHighlight(Object.assign({ srcId: workspace_1.default.createNameSpace('coc-float') }, highlight)).logError();
                if (highlight.isMarkdown) {
                    let line = lines[highlight.line];
                    if (line) {
                        let si = string_1.characterIndex(line, highlight.colStart);
                        let ei = string_1.characterIndex(line, highlight.colEnd) - 1;
                        let before = line[si];
                        let after = line[ei];
                        if (before == after && ['_', '`', '*'].includes(before)) {
                            if (before == '_' && line[si + 1] == '_' && line[ei - 1] == '_' && si + 1 < ei - 1) {
                                positions.push([highlight.line + 1, highlight.colStart + 1, 2]);
                                positions.push([highlight.line + 1, highlight.colEnd - 1, 2]);
                            }
                            else {
                                positions.push([highlight.line + 1, highlight.colStart + 1]);
                                positions.push([highlight.line + 1, highlight.colEnd]);
                            }
                        }
                        if (highlight.colEnd - highlight.colStart == 2 && before == '\\') {
                            positions.push([highlight.line + 1, highlight.colStart + 1]);
                        }
                    }
                }
            }
            for (let arr of array_1.group(positions, 8)) {
                if (winid) {
                    nvim.call('win_execute', [winid, `call matchaddpos('Conceal', ${JSON.stringify(arr)},11)`], true);
                }
                else {
                    nvim.call('matchaddpos', ['Conceal', arr, 11], true);
                }
            }
        }
        for (let arr of array_1.group(this.positions || [], 8)) {
            arr = arr.filter(o => o[2] != 0);
            if (arr.length) {
                if (winid) {
                    nvim.call('win_execute', [winid, `call matchaddpos('CocUnderline', ${JSON.stringify(arr)},12)`], true);
                }
                else {
                    nvim.call('matchaddpos', ['CocUnderline', arr, 12], true);
                }
            }
        }
        if (winid && this.enableHighlight && this.filetype) {
            nvim.call('win_execute', [winid, `runtime! syntax/${this.filetype}.vim`], true);
        }
    }
    calculateFragments(docs, width) {
        let fragments = [];
        let idx = 0;
        let currLine = 0;
        let newLines = [];
        let positions = this.positions = [];
        for (let doc of docs) {
            let lines = [];
            let arr = doc.content.split(/\r?\n/);
            for (let str of arr) {
                if (doc.filetype == 'markdown') {
                    // replace `\` surrounded by `__` because bug of markdown highlight in vim.
                    str = str.replace(/__(.+?)__/g, (_, p1) => {
                        return `__${p1.replace(/\\_/g, '_').replace(/\\\\/g, '\\')}__`;
                    });
                }
                lines.push(str);
                if (doc.active) {
                    let part = str.slice(doc.active[0], doc.active[1]);
                    positions.push([currLine + 1, doc.active[0] + 1, string_1.byteLength(part)]);
                }
            }
            fragments.push({
                start: currLine,
                lines,
                filetype: doc.filetype
            });
            let filtered = workspace_1.default.isNvim && doc.filetype === 'markdown' ? lines.filter(s => !/^\s*```/.test(s)) : lines;
            newLines.push(...filtered);
            if (idx != docs.length - 1) {
                newLines.push('—'.repeat(width - 2));
                currLine = newLines.length;
            }
            idx = idx + 1;
        }
        this.lines = newLines;
        return fragments;
    }
    static getDimension(docs, maxWidth, maxHeight) {
        // width contains padding
        if (maxWidth <= 2 || maxHeight == 0)
            return { width: 0, height: 0 };
        let arr = [];
        for (let doc of docs) {
            let lines = doc.content.split(/\r?\n/);
            for (let line of lines) {
                if (workspace_1.default.isNvim && doc.filetype == 'markdown' && /^\s*```/.test(line)) {
                    continue;
                }
                arr.push(string_1.byteLength(line.replace(/\t/g, '  ')) + 2);
            }
        }
        let width = Math.min(Math.max(...arr), maxWidth);
        if (width <= 2)
            return { width: 0, height: 0 };
        let height = docs.length - 1;
        for (let w of arr) {
            height = height + Math.max(Math.ceil((w - 2) / (width - 2)), 1);
        }
        return { width, height: Math.min(height, maxHeight) };
    }
}
exports.default = FloatBuffer;
function fixFiletype(filetype) {
    if (filetype == 'ts')
        return 'typescript';
    if (filetype == 'js')
        return 'javascript';
    if (filetype == 'bash')
        return 'sh';
    return filetype;
}
//# sourceMappingURL=floatBuffer.js.map