"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchLine = exports.getChange = exports.diffLines = void 0;
const tslib_1 = require("tslib");
const fast_diff_1 = tslib_1.__importDefault(require("fast-diff"));
const string_1 = require("./string");
const logger = require('./logger')('util-diff');
function diffLines(oldLines, newLines) {
    let start = 0;
    let end = oldLines.length;
    let oldLen = end;
    let len = newLines.length;
    for (let i = 0; i <= end; i++) {
        if (newLines[i] !== oldLines[i]) {
            start = i;
            break;
        }
        if (i == end) {
            start = end;
        }
    }
    if (start != newLines.length) {
        let maxRemain = Math.min(end - start, len - start);
        for (let j = 0; j < maxRemain; j++) {
            if (oldLines[oldLen - j - 1] != newLines[len - j - 1]) {
                break;
            }
            end = end - 1;
        }
    }
    return {
        start,
        end,
        replacement: newLines.slice(start, len - (oldLen - end))
    };
}
exports.diffLines = diffLines;
function getChange(oldStr, newStr, cursorEnd) {
    let ol = oldStr.length;
    let nl = newStr.length;
    let max = Math.min(ol, nl);
    let newText = '';
    let startOffset = 0;
    let endOffset = -1;
    let shouldLimit = false;
    // find first endOffset, could <= this. one
    for (let i = 0; i <= max; i++) {
        if (cursorEnd != null && i == cursorEnd) {
            endOffset = i;
            shouldLimit = true;
            break;
        }
        if (oldStr[ol - i - 1] != newStr[nl - i - 1]) {
            endOffset = i;
            break;
        }
    }
    if (endOffset == -1)
        return null;
    // find start offset
    let remain = max - endOffset;
    if (remain == 0) {
        startOffset = 0;
    }
    else {
        for (let i = 0; i <= remain; i++) {
            if (oldStr[i] != newStr[i] || i == remain) {
                startOffset = i;
                break;
            }
        }
    }
    // limit to minimal change
    remain = remain - startOffset;
    if (shouldLimit && remain > 0) {
        let end = endOffset;
        for (let i = 0; i < remain; i++) {
            let oc = oldStr[ol - end - 1 - i];
            let nc = newStr[nl - end - 1 - i];
            if (oc == nc) {
                endOffset = endOffset + 1;
            }
            else {
                break;
            }
        }
    }
    let end = ol - endOffset;
    if (ol == nl && startOffset == end)
        return null;
    newText = newStr.slice(startOffset, nl - endOffset);
    // optimize for add new line(s)
    if (startOffset == end) {
        let pre = startOffset == 0 ? '' : newStr[startOffset - 1];
        if (pre && pre != '\n'
            && oldStr[startOffset] == '\n'
            && newText.startsWith('\n')) {
            return { start: startOffset + 1, end: end + 1, newText: newText.slice(1) + '\n' };
        }
    }
    return { start: startOffset, end, newText };
}
exports.getChange = getChange;
function patchLine(from, to, fill = ' ') {
    if (from == to)
        return to;
    let idx = to.indexOf(from);
    if (idx !== -1)
        return fill.repeat(idx) + from;
    let result = fast_diff_1.default(from, to);
    let str = '';
    for (let item of result) {
        if (item[0] == fast_diff_1.default.DELETE) {
            // not allowed
            return to;
        }
        else if (item[0] == fast_diff_1.default.INSERT) {
            str = str + fill.repeat(string_1.byteLength(item[1]));
        }
        else {
            str = str + item[1];
        }
    }
    return str;
}
exports.patchLine = patchLine;
//# sourceMappingURL=diff.js.map