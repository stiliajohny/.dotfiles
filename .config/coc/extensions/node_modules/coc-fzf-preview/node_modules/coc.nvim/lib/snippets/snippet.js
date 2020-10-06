"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CocSnippet = void 0;
const tslib_1 = require("tslib");
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const position_1 = require("../util/position");
const Snippets = tslib_1.__importStar(require("./parser"));
const string_1 = require("../util/string");
const logger = require('../util/logger')('snippets-snipet');
class CocSnippet {
    constructor(_snippetString, position, _variableResolver) {
        this._snippetString = _snippetString;
        this.position = position;
        this._variableResolver = _variableResolver;
        this._parser = new Snippets.SnippetParser();
        const snippet = this._parser.parse(this._snippetString, true);
        if (_variableResolver) {
            snippet.resolveVariables(_variableResolver);
        }
        this.tmSnippet = snippet;
        this.update();
    }
    adjustPosition(characterCount, lineCount) {
        let { line, character } = this.position;
        this.position = {
            line: line + lineCount,
            character: character + characterCount
        };
        this.update();
    }
    // adjust for edit before snippet
    adjustTextEdit(edit) {
        let { range, newText } = edit;
        if (position_1.comparePosition(this.range.start, range.end) < 0)
            return false;
        // check change of placeholder at beginning
        if (!newText.includes('\n')
            && position_1.comparePosition(range.start, range.end) == 0
            && position_1.comparePosition(this.range.start, range.start) == 0) {
            let idx = this._placeholders.findIndex(o => position_1.comparePosition(o.range.start, range.start) == 0);
            if (idx !== -1)
                return false;
        }
        let changed = position_1.getChangedPosition(this.range.start, edit);
        if (changed.line == 0 && changed.character == 0)
            return true;
        this.adjustPosition(changed.character, changed.line);
        return true;
    }
    get isPlainText() {
        if (this._placeholders.length > 1)
            return false;
        return this._placeholders.every(o => o.value == '');
    }
    get finalCount() {
        return this._placeholders.filter(o => o.isFinalTabstop).length;
    }
    toString() {
        return this.tmSnippet.toString();
    }
    get range() {
        let { position } = this;
        const content = this.tmSnippet.toString();
        const doc = vscode_languageserver_textdocument_1.TextDocument.create('untitled:/1', 'snippet', 0, content);
        const pos = doc.positionAt(content.length);
        const end = pos.line == 0 ? position.character + pos.character : pos.character;
        return vscode_languageserver_protocol_1.Range.create(position, vscode_languageserver_protocol_1.Position.create(position.line + pos.line, end));
    }
    get firstPlaceholder() {
        let index = 0;
        for (let p of this._placeholders) {
            if (p.index == 0)
                continue;
            if (index == 0 || p.index < index) {
                index = p.index;
            }
        }
        return this.getPlaceholder(index);
    }
    get lastPlaceholder() {
        let index = 0;
        for (let p of this._placeholders) {
            if (index == 0 || p.index > index) {
                index = p.index;
            }
        }
        return this.getPlaceholder(index);
    }
    getPlaceholderById(id) {
        return this._placeholders.find(o => o.id == id);
    }
    getPlaceholder(index) {
        let placeholders = this._placeholders.filter(o => o.index == index);
        let filtered = placeholders.filter(o => !o.transform);
        return filtered.length ? filtered[0] : placeholders[0];
    }
    getPrevPlaceholder(index) {
        if (index == 0)
            return this.lastPlaceholder;
        let prev = this.getPlaceholder(index - 1);
        if (!prev)
            return this.getPrevPlaceholder(index - 1);
        return prev;
    }
    getNextPlaceholder(index) {
        let indexes = this._placeholders.map(o => o.index);
        let max = Math.max.apply(null, indexes);
        if (index >= max)
            return this.finalPlaceholder;
        let next = this.getPlaceholder(index + 1);
        if (!next)
            return this.getNextPlaceholder(index + 1);
        return next;
    }
    get finalPlaceholder() {
        return this._placeholders.find(o => o.isFinalTabstop);
    }
    getPlaceholderByRange(range) {
        return this._placeholders.find(o => position_1.rangeInRange(range, o.range));
    }
    insertSnippet(placeholder, snippet, range) {
        let { start } = placeholder.range;
        // let offset = position.character - start.character
        let editStart = vscode_languageserver_protocol_1.Position.create(range.start.line - start.line, range.start.line == start.line ? range.start.character - start.character : range.start.character);
        let editEnd = vscode_languageserver_protocol_1.Position.create(range.end.line - start.line, range.end.line == start.line ? range.end.character - start.character : range.end.character);
        let editRange = vscode_languageserver_protocol_1.Range.create(editStart, editEnd);
        let first = this.tmSnippet.insertSnippet(snippet, placeholder.id, editRange);
        this.update();
        return first;
    }
    // update internal positions, no change of buffer
    // return TextEdit list when needed
    updatePlaceholder(placeholder, edit) {
        let { start, end } = edit.range;
        let { range } = this;
        let { value, id, index } = placeholder;
        let newText = position_1.editRange(placeholder.range, value, edit);
        let delta = 0;
        if (!newText.includes('\n')) {
            for (let p of this._placeholders) {
                if (p.index == index &&
                    p.id < id &&
                    p.line == placeholder.range.start.line) {
                    let text = this.tmSnippet.getPlaceholderText(p.id, newText);
                    delta = delta + string_1.byteLength(text) - string_1.byteLength(p.value);
                }
            }
        }
        if (placeholder.isVariable) {
            this.tmSnippet.updateVariable(id, newText);
        }
        else {
            this.tmSnippet.updatePlaceholder(id, newText);
        }
        let endPosition = position_1.adjustPosition(range.end, edit);
        let snippetEdit = {
            range: vscode_languageserver_protocol_1.Range.create(range.start, endPosition),
            newText: this.tmSnippet.toString()
        };
        this.update();
        return { edits: [snippetEdit], delta };
    }
    update() {
        const snippet = this.tmSnippet;
        const { line, character } = this.position;
        const document = vscode_languageserver_textdocument_1.TextDocument.create('untitled:/1', 'snippet', 0, snippet.toString());
        const { placeholders, variables, maxIndexNumber } = snippet;
        const variableIndexMap = new Map();
        let variableIndex = maxIndexNumber + 1;
        this._placeholders = [...placeholders, ...variables].map((p, idx) => {
            const offset = snippet.offset(p);
            const position = document.positionAt(offset);
            const start = {
                line: line + position.line,
                character: position.line == 0 ? character + position.character : position.character
            };
            let index;
            if (p instanceof Snippets.Variable) {
                let key = p.name;
                if (variableIndexMap.has(key)) {
                    index = variableIndexMap.get(key);
                }
                else {
                    variableIndexMap.set(key, variableIndex);
                    index = variableIndex;
                    variableIndex = variableIndex + 1;
                }
                // variableIndex = variableIndex + 1
            }
            else {
                index = p.index;
            }
            const value = p.toString();
            const lines = value.split('\n');
            let res = {
                range: vscode_languageserver_protocol_1.Range.create(start, {
                    line: start.line + lines.length - 1,
                    character: lines.length == 1 ? start.character + value.length : lines[lines.length - 1].length
                }),
                transform: p.transform != null,
                line: start.line,
                id: idx,
                index,
                value,
                isVariable: p instanceof Snippets.Variable,
                isFinalTabstop: p.index === 0
            };
            Object.defineProperty(res, 'snippet', {
                enumerable: false
            });
            if (p instanceof Snippets.Placeholder && p.choice) {
                let { options } = p.choice;
                if (options && options.length) {
                    res.choice = options.map(o => o.value);
                }
            }
            return res;
        });
    }
}
exports.CocSnippet = CocSnippet;
//# sourceMappingURL=snippet.js.map