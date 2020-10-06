"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const vscode_uri_1 = require("vscode-uri");
const sources_1 = tslib_1.__importDefault(require("../../sources"));
const workspace_1 = tslib_1.__importDefault(require("../../workspace"));
const basic_1 = tslib_1.__importDefault(require("../basic"));
const logger = require('../../util/logger')('list-sources');
class SourcesList extends basic_1.default {
    constructor(nvim) {
        super(nvim);
        this.defaultAction = 'toggle';
        this.description = 'registered completion sources';
        this.name = 'sources';
        this.addAction('toggle', async (item) => {
            let { name } = item.data;
            sources_1.default.toggleSource(name);
        }, { persist: true, reload: true });
        this.addAction('refresh', async (item) => {
            let { name } = item.data;
            await sources_1.default.refresh(name);
        }, { persist: true, reload: true });
        this.addAction('open', async (item) => {
            let { location } = item;
            if (location)
                await this.jumpTo(location);
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async loadItems(context) {
        let stats = sources_1.default.sourceStats();
        let filetype = await context.buffer.getOption('filetype');
        let map = workspace_1.default.env.disabledSources;
        let disables = map ? map[filetype] || [] : [];
        stats.sort((a, b) => {
            if (a.type != b.type)
                return a.type < b.type ? 1 : -1;
            return a.name > b.name ? -1 : 1;
        });
        return stats.map(stat => {
            let prefix = stat.disabled ? ' ' : '*';
            if (disables && disables.includes(stat.name)) {
                prefix = '-';
            }
            let location;
            if (stat.filepath) {
                location = vscode_languageserver_types_1.Location.create(vscode_uri_1.URI.file(stat.filepath).toString(), vscode_languageserver_types_1.Range.create(0, 0, 0, 0));
            }
            return {
                label: `${prefix} ${fixWidth(stat.name, 22)} ${fixWidth('[' + stat.shortcut + ']', 10)} ${fixWidth(stat.triggerCharacters.join(''), 10)} ${fixWidth(stat.priority.toString(), 3)} ${stat.filetypes.join(',')}`,
                location,
                data: { name: stat.name }
            };
        });
    }
    doHighlight() {
        let { nvim } = this;
        nvim.pauseNotification();
        nvim.command('syntax match CocSourcesPrefix /\\v^./ contained containedin=CocSourcesLine', true);
        nvim.command('syntax match CocSourcesName /\\v%3c\\S+/ contained containedin=CocSourcesLine', true);
        nvim.command('syntax match CocSourcesType /\\v%25v.*%36v/ contained containedin=CocSourcesLine', true);
        nvim.command('syntax match CocSourcesPriority /\\v%46v.*%50v/ contained containedin=CocSourcesLine', true);
        nvim.command('syntax match CocSourcesFileTypes /\\v\\S+$/ contained containedin=CocSourcesLine', true);
        nvim.command('highlight default link CocSourcesPrefix Special', true);
        nvim.command('highlight default link CocSourcesName Type', true);
        nvim.command('highlight default link CocSourcesPriority Number', true);
        nvim.command('highlight default link CocSourcesFileTypes Comment', true);
        nvim.command('highlight default link CocSourcesType Statement', true);
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        nvim.resumeNotification(false, true);
    }
}
exports.default = SourcesList;
function fixWidth(str, width) {
    if (str.length > width) {
        return str.slice(0, width - 1) + '.';
    }
    return str + ' '.repeat(width - str.length);
}
//# sourceMappingURL=sources.js.map