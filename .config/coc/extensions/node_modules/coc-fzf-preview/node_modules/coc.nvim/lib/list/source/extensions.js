"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const rimraf_1 = tslib_1.__importDefault(require("rimraf"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const os_1 = tslib_1.__importDefault(require("os"));
const path_1 = tslib_1.__importDefault(require("path"));
const vscode_uri_1 = require("vscode-uri");
const extensions_1 = tslib_1.__importDefault(require("../../extensions"));
const util_1 = require("../../util");
const fs_2 = require("../../util/fs");
const workspace_1 = tslib_1.__importDefault(require("../../workspace"));
const basic_1 = tslib_1.__importDefault(require("../basic"));
const logger = require('../../util/logger')('list-extensions');
class ExtensionList extends basic_1.default {
    constructor(nvim) {
        super(nvim);
        this.defaultAction = 'toggle';
        this.description = 'manage coc extensions';
        this.name = 'extensions';
        this.addAction('toggle', async (item) => {
            let { id, state } = item.data;
            if (state == 'disabled')
                return;
            if (state == 'activated') {
                await extensions_1.default.deactivate(id);
            }
            else {
                await extensions_1.default.activate(id);
            }
            await util_1.wait(100);
        }, { persist: true, reload: true, parallel: true });
        this.addAction('configuration', async (item) => {
            let { root } = item.data;
            let jsonFile = path_1.default.join(root, 'package.json');
            if (fs_1.default.existsSync(jsonFile)) {
                let lines = fs_1.default.readFileSync(jsonFile, 'utf8').split(/\r?\n/);
                let idx = lines.findIndex(s => s.includes('"contributes"'));
                await workspace_1.default.jumpTo(vscode_uri_1.URI.file(jsonFile).toString(), { line: idx == -1 ? 0 : idx, character: 0 });
            }
        });
        this.addAction('open', async (item) => {
            let { root } = item.data;
            if (workspace_1.default.env.isiTerm) {
                nvim.call('coc#util#iterm_open', [root], true);
            }
            else {
                nvim.call('coc#util#open_url', [root], true);
            }
        });
        this.addAction('disable', async (item) => {
            let { id, state } = item.data;
            if (state !== 'disabled')
                await extensions_1.default.toggleExtension(id);
        }, { persist: true, reload: true, parallel: true });
        this.addAction('enable', async (item) => {
            let { id, state } = item.data;
            if (state == 'disabled')
                await extensions_1.default.toggleExtension(id);
        }, { persist: true, reload: true, parallel: true });
        this.addAction('lock', async (item) => {
            let { id } = item.data;
            await extensions_1.default.toggleLock(id);
        }, { persist: true, reload: true });
        this.addAction('readme', async (item) => {
            let { root } = item.data;
            let files = await fs_2.readdirAsync(root);
            let file = files.find(f => /^readme/i.test(f));
            if (file) {
                let escaped = await nvim.call('fnameescape', [path_1.default.join(root, file)]);
                await workspace_1.default.callAsync('coc#util#execute', [`edit ${escaped}`]);
            }
        });
        this.addAction('reload', async (item) => {
            let { id } = item.data;
            await extensions_1.default.reloadExtension(id);
        }, { persist: true, reload: true });
        this.addAction('fix', async (item) => {
            let { root, isLocal } = item.data;
            let { npm } = extensions_1.default;
            if (isLocal) {
                workspace_1.default.showMessage(`Can't fix for local extension.`, 'warning');
                return;
            }
            if (!npm)
                return;
            let folder = path_1.default.join(root, 'node_modules');
            if (fs_1.default.existsSync(folder)) {
                rimraf_1.default.sync(folder);
            }
            let terminal = await workspace_1.default.createTerminal({
                cwd: root
            });
            let shown = await terminal.show(false);
            if (!shown)
                return;
            workspace_1.default.nvim.command(`startinsert`, true);
            terminal.sendText(`${npm} install --production --ignore-scripts --no-lockfile`, true);
        });
        this.addMultipleAction('uninstall', async (items) => {
            let ids = [];
            for (let item of items) {
                if (item.data.isLocal)
                    continue;
                ids.push(item.data.id);
            }
            extensions_1.default.uninstallExtension(ids).catch(e => {
                logger.error(e);
            });
        });
    }
    async loadItems(_context) {
        let items = [];
        let list = await extensions_1.default.getExtensionStates();
        let lockedList = await extensions_1.default.getLockedList();
        for (let stat of list) {
            let prefix = '+';
            if (stat.state == 'disabled') {
                prefix = '-';
            }
            else if (stat.state == 'activated') {
                prefix = '*';
            }
            else if (stat.state == 'unknown') {
                prefix = '?';
            }
            let root = await this.nvim.call('resolve', stat.root);
            let locked = lockedList.includes(stat.id);
            items.push({
                label: `${prefix} ${stat.id}${locked ? ' ' : ''}\t${stat.isLocal ? '[RTP]\t' : ''}${stat.version}\t${root.replace(os_1.default.homedir(), '~')}`,
                filterText: stat.id,
                data: {
                    id: stat.id,
                    root,
                    state: stat.state,
                    isLocal: stat.isLocal,
                    priority: getPriority(stat.state)
                }
            });
        }
        items.sort((a, b) => {
            if (a.data.priority != b.data.priority) {
                return b.data.priority - a.data.priority;
            }
            return b.data.id - a.data.id ? 1 : -1;
        });
        return items;
    }
    doHighlight() {
        let { nvim } = this;
        nvim.pauseNotification();
        nvim.command('syntax match CocExtensionsActivited /\\v^\\*/ contained containedin=CocExtensionsLine', true);
        nvim.command('syntax match CocExtensionsLoaded /\\v^\\+/ contained containedin=CocExtensionsLine', true);
        nvim.command('syntax match CocExtensionsDisabled /\\v^-/ contained containedin=CocExtensionsLine', true);
        nvim.command('syntax match CocExtensionsName /\\v%3c\\S+/ contained containedin=CocExtensionsLine', true);
        nvim.command('syntax match CocExtensionsRoot /\\v\\t[^\\t]*$/ contained containedin=CocExtensionsLine', true);
        nvim.command('syntax match CocExtensionsLocal /\\v\\[RTP\\]/ contained containedin=CocExtensionsLine', true);
        nvim.command('highlight default link CocExtensionsActivited Special', true);
        nvim.command('highlight default link CocExtensionsLoaded Normal', true);
        nvim.command('highlight default link CocExtensionsDisabled Comment', true);
        nvim.command('highlight default link CocExtensionsName String', true);
        nvim.command('highlight default link CocExtensionsLocal MoreMsg', true);
        nvim.command('highlight default link CocExtensionsRoot Comment', true);
        nvim.resumeNotification().catch(_e => {
            // noop
        });
    }
}
exports.default = ExtensionList;
function getPriority(stat) {
    switch (stat) {
        case 'unknown':
            return 2;
        case 'activated':
            return 1;
        case 'disabled':
            return -1;
        default:
            return 0;
    }
}
//# sourceMappingURL=extensions.js.map