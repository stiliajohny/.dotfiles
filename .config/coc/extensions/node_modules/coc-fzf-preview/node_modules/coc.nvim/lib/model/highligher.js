"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ansiparse_1 = require("../util/ansiparse");
const string_1 = require("../util/string");
/**
 * Build highlights, with lines and highlights
 */
class Highlighter {
    constructor(srcId = -1) {
        this.srcId = srcId;
        this.lines = [];
        this.highlights = [];
    }
    addLine(line, hlGroup) {
        if (line.includes('\n')) {
            for (let content of line.split(/\r?\n/)) {
                this.addLine(content, hlGroup);
            }
            return;
        }
        if (hlGroup) {
            this.highlights.push({
                line: this.lines.length,
                colStart: line.match(/^\s*/)[0].length,
                colEnd: string_1.byteLength(line),
                hlGroup
            });
        } // '\x1b'
        if (line.includes('\x1b')) {
            let res = ansiparse_1.parseAnsiHighlights(line);
            for (let hl of res.highlights) {
                let { span, hlGroup } = hl;
                if (span[0] != span[1]) {
                    this.highlights.push({
                        line: this.lines.length,
                        colStart: span[0],
                        colEnd: span[1],
                        hlGroup
                    });
                }
            }
            this.lines.push(res.line);
        }
        else {
            this.lines.push(line);
        }
    }
    addLines(lines) {
        this.lines.push(...lines);
    }
    addText(text, hlGroup) {
        let { lines } = this;
        let pre = lines[lines.length - 1] || '';
        if (hlGroup) {
            let colStart = string_1.byteLength(pre);
            this.highlights.push({
                line: lines.length ? lines.length - 1 : 0,
                colStart,
                colEnd: colStart + string_1.byteLength(text),
                hlGroup
            });
        }
        if (lines.length) {
            lines[lines.length - 1] = `${pre}${text}`;
        }
        else {
            lines.push(text);
        }
    }
    get length() {
        return this.lines.length;
    }
    getline(line) {
        return this.lines[line] || '';
    }
    // default to replace
    render(buffer, start = 0, end = -1) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        buffer.setLines(this.lines, { start, end, strictIndexing: false }, true);
        for (let item of this.highlights) {
            buffer.addHighlight({
                hlGroup: item.hlGroup,
                colStart: item.colStart,
                colEnd: item.colEnd == null ? -1 : item.colEnd,
                line: start + item.line,
                srcId: this.srcId
            }).logError();
        }
    }
}
exports.default = Highlighter;
//# sourceMappingURL=highligher.js.map