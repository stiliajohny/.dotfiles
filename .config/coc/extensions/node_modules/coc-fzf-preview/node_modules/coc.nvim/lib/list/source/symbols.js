"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const minimatch_1 = tslib_1.__importDefault(require("minimatch"));
const vscode_uri_1 = require("vscode-uri");
const languages_1 = tslib_1.__importDefault(require("../../languages"));
const workspace_1 = tslib_1.__importDefault(require("../../workspace"));
const location_1 = tslib_1.__importDefault(require("./location"));
const convert_1 = require("../../util/convert");
const fs_1 = require("../../util/fs");
const fzy_1 = require("../../util/fzy");
const logger = require('../../util/logger')('list-symbols');
class Symbols extends location_1.default {
    constructor() {
        super(...arguments);
        this.interactive = true;
        this.description = 'search workspace symbols';
        this.detail = 'Symbols list is provided by server, it works on interactive mode only.';
        this.name = 'symbols';
        this.options = [{
                name: '-k, -kind KIND',
                description: 'Filter symbols by kind.',
                hasValue: true
            }];
    }
    async loadItems(context) {
        let buf = await context.window.buffer;
        let document = workspace_1.default.getDocument(buf.id);
        if (!document)
            return null;
        let { input } = context;
        let args = this.parseArguments(context.args);
        let filterKind = args.kind ? args.kind.toLowerCase() : '';
        if (!context.options.interactive) {
            throw new Error('Symbols only works on interactive mode');
        }
        let symbols = await languages_1.default.getWorkspaceSymbols(document.textDocument, input);
        if (!symbols) {
            throw new Error('Workspace symbols provider not found for current document');
        }
        let config = this.getConfig();
        let excludes = config.get('excludes', []);
        let items = [];
        for (let s of symbols) {
            let kind = convert_1.getSymbolKind(s.kind);
            if (filterKind && kind.toLowerCase() != filterKind) {
                continue;
            }
            let file = vscode_uri_1.URI.parse(s.location.uri).fsPath;
            if (fs_1.isParentFolder(workspace_1.default.cwd, file)) {
                file = path_1.default.relative(workspace_1.default.cwd, file);
            }
            if (excludes.some(p => minimatch_1.default(file, p))) {
                continue;
            }
            items.push({
                label: `${s.name} [${kind}]\t${file}`,
                filterText: `${s.name}`,
                location: s.location,
                data: { original: s, kind: s.kind, file, score: fzy_1.score(input, s.name) }
            });
        }
        items.sort((a, b) => {
            if (a.data.score != b.data.score) {
                return b.data.score - a.data.score;
            }
            if (a.data.kind != b.data.kind) {
                return a.data.kind - b.data.kind;
            }
            return a.data.file.length - b.data.file.length;
        });
        return items;
    }
    async resolveItem(item) {
        let s = item.data.original;
        if (!s)
            return null;
        let resolved = await languages_1.default.resolveWorkspaceSymbol(s);
        if (!resolved)
            return null;
        let kind = convert_1.getSymbolKind(resolved.kind);
        let file = vscode_uri_1.URI.parse(resolved.location.uri).fsPath;
        if (fs_1.isParentFolder(workspace_1.default.cwd, file)) {
            file = path_1.default.relative(workspace_1.default.cwd, file);
        }
        return {
            label: `${s.name} [${kind}]\t${file}`,
            filterText: `${s.name}`,
            location: s.location
        };
    }
    doHighlight() {
        let { nvim } = this;
        nvim.pauseNotification();
        nvim.command('syntax match CocSymbolsName /\\v^\\s*\\S+/ contained containedin=CocSymbolsLine', true);
        nvim.command('syntax match CocSymbolsKind /\\[\\w\\+\\]\\t/ contained containedin=CocSymbolsLine', true);
        nvim.command('syntax match CocSymbolsFile /\\S\\+$/ contained containedin=CocSymbolsLine', true);
        nvim.command('highlight default link CocSymbolsName Normal', true);
        nvim.command('highlight default link CocSymbolsKind Typedef', true);
        nvim.command('highlight default link CocSymbolsFile Comment', true);
        nvim.resumeNotification().catch(_e => {
            // noop
        });
    }
}
exports.default = Symbols;
//# sourceMappingURL=symbols.js.map