"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const logger = require('../util/logger')('cursors-range');
// edit range
class TextRange {
    constructor(line, start, end, text, 
    // range count at this line before, shuld be updated on range add
    preCount) {
        this.line = line;
        this.start = start;
        this.end = end;
        this.text = text;
        this.preCount = preCount;
        this.currStart = start;
        this.currEnd = end;
    }
    add(offset, add) {
        let { text, preCount } = this;
        let pre = offset == 0 ? '' : text.slice(0, offset);
        let post = text.slice(offset);
        this.text = `${pre}${add}${post}`;
        this.currStart = this.currStart + preCount * add.length;
        this.currEnd = this.currEnd + (preCount + 1) * add.length;
    }
    replace(begin, end, add = '') {
        let { text, preCount } = this;
        let pre = begin == 0 ? '' : text.slice(0, begin);
        let post = text.slice(end);
        this.text = pre + add + post;
        let l = end - begin - add.length;
        this.currStart = this.currStart - preCount * l;
        this.currEnd = this.currEnd - (preCount + 1) * l;
    }
    get range() {
        return vscode_languageserver_types_1.Range.create(this.line, this.start, this.line, this.end);
    }
    get currRange() {
        return vscode_languageserver_types_1.Range.create(this.line, this.currStart, this.line, this.currEnd);
    }
    applyEdit(edit) {
        let { range, newText } = edit;
        let start = range.start.character;
        let end = range.end.character;
        let isAdd = start == end;
        if (isAdd) {
            this.add(start - this.currStart, newText);
        }
        else {
            this.replace(start - this.currStart, end - this.currStart, newText);
        }
    }
    get textEdit() {
        return {
            range: this.range,
            newText: this.text
        };
    }
}
exports.default = TextRange;
//# sourceMappingURL=range.js.map