"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sources = void 0;
const tslib_1 = require("tslib");
const fast_diff_1 = tslib_1.__importDefault(require("fast-diff"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const util_1 = tslib_1.__importDefault(require("util"));
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const events_1 = tslib_1.__importDefault(require("./events"));
const extensions_1 = tslib_1.__importDefault(require("./extensions"));
const source_1 = tslib_1.__importDefault(require("./model/source"));
const source_vim_1 = tslib_1.__importDefault(require("./model/source-vim"));
const types_1 = require("./types");
const util_2 = require("./util");
const fs_2 = require("./util/fs");
const workspace_1 = tslib_1.__importDefault(require("./workspace"));
const string_1 = require("./util/string");
const logger = require('./util/logger')('sources');
class Sources {
    constructor() {
        this.sourceMap = new Map();
        this.disposables = [];
        this.remoteSourcePaths = [];
    }
    get nvim() {
        return workspace_1.default.nvim;
    }
    createNativeSources() {
        try {
            this.disposables.push((require('./source/around')).regist(this.sourceMap));
            this.disposables.push((require('./source/buffer')).regist(this.sourceMap));
            this.disposables.push((require('./source/file')).regist(this.sourceMap));
        }
        catch (e) {
            console.error('Create source error:' + e.message);
        }
    }
    async createVimSourceExtension(nvim, filepath) {
        let name = path_1.default.basename(filepath, '.vim');
        try {
            await nvim.command(`source ${filepath}`);
            let fns = await nvim.call('coc#util#remote_fns', name);
            for (let fn of ['init', 'complete']) {
                if (!fns.includes(fn)) {
                    workspace_1.default.showMessage(`${fn} not found for source ${name}`, 'error');
                    return null;
                }
            }
            let props = await nvim.call(`coc#source#${name}#init`, []);
            let packageJSON = {
                name: `coc-source-${name}`,
                engines: {
                    coc: ">= 0.0.1"
                },
                activationEvents: props.filetypes ? props.filetypes.map(f => `onLanguage:${f}`) : ['*'],
                contributes: {
                    configuration: {
                        properties: {
                            [`coc.source.${name}.enable`]: {
                                type: 'boolean',
                                default: true
                            },
                            [`coc.source.${name}.firstMatch`]: {
                                type: 'boolean',
                                default: !!props.firstMatch
                            },
                            [`coc.source.${name}.triggerCharacters`]: {
                                type: 'number',
                                default: props.triggerCharacters || []
                            },
                            [`coc.source.${name}.priority`]: {
                                type: 'number',
                                default: props.priority || 9
                            },
                            [`coc.source.${name}.shortcut`]: {
                                type: 'string',
                                default: props.shortcut || name.slice(0, 3).toUpperCase(),
                                description: 'Shortcut text shown in complete menu.'
                            },
                            [`coc.source.${name}.disableSyntaxes`]: {
                                type: 'array',
                                default: [],
                                items: {
                                    type: 'string'
                                }
                            },
                            [`coc.source.${name}.filetypes`]: {
                                type: 'array',
                                default: props.filetypes || null,
                                description: 'Enabled filetypes.',
                                items: {
                                    type: 'string'
                                }
                            }
                        }
                    }
                }
            };
            let source = new source_vim_1.default({
                name,
                filepath,
                sourceType: types_1.SourceType.Remote,
                optionalFns: fns.filter(n => !['init', 'complete'].includes(n))
            });
            let isActive = false;
            let extension = {
                id: packageJSON.name,
                packageJSON,
                exports: void 0,
                extensionPath: filepath,
                activate: () => {
                    isActive = true;
                    this.addSource(source);
                    return Promise.resolve();
                }
            };
            Object.defineProperty(extension, 'isActive', {
                get: () => isActive
            });
            extensions_1.default.registerExtension(extension, () => {
                isActive = false;
                this.removeSource(source);
            });
        }
        catch (e) {
            workspace_1.default.showMessage(`Error on create vim source ${name}: ${e.message}`, 'error');
        }
    }
    createRemoteSources() {
        let { runtimepath } = workspace_1.default.env;
        let paths = runtimepath.split(',');
        for (let path of paths) {
            this.createVimSources(path).logError();
        }
    }
    async createVimSources(pluginPath) {
        if (this.remoteSourcePaths.includes(pluginPath))
            return;
        this.remoteSourcePaths.push(pluginPath);
        let folder = path_1.default.join(pluginPath, 'autoload/coc/source');
        let stat = await fs_2.statAsync(folder);
        if (stat && stat.isDirectory()) {
            let arr = await util_1.default.promisify(fs_1.default.readdir)(folder);
            arr = arr.filter(s => s.endsWith('.vim'));
            let files = arr.map(s => path_1.default.join(folder, s));
            if (files.length == 0)
                return;
            await Promise.all(files.map(p => this.createVimSourceExtension(this.nvim, p)));
        }
    }
    init() {
        this.createNativeSources();
        this.createRemoteSources();
        events_1.default.on('BufEnter', this.onDocumentEnter, this, this.disposables);
        workspace_1.default.watchOption('runtimepath', async (oldValue, newValue) => {
            let result = fast_diff_1.default(oldValue, newValue);
            for (let [changeType, value] of result) {
                if (changeType == 1) {
                    let paths = value.replace(/,$/, '').split(',');
                    for (let p of paths) {
                        if (p)
                            await this.createVimSources(p);
                    }
                }
            }
        }, this.disposables);
    }
    get names() {
        return Array.from(this.sourceMap.keys());
    }
    get sources() {
        return Array.from(this.sourceMap.values());
    }
    has(name) {
        return this.names.findIndex(o => o == name) != -1;
    }
    getSource(name) {
        if (!name)
            return null;
        return this.sourceMap.get(name) || null;
    }
    async doCompleteResolve(item, token) {
        let source = this.getSource(item.source);
        if (source && typeof source.onCompleteResolve == 'function') {
            try {
                await Promise.resolve(source.onCompleteResolve(item, token));
            }
            catch (e) {
                logger.error('Error on complete resolve:', e.stack);
            }
        }
    }
    async doCompleteDone(item, opt) {
        let data = JSON.parse(item.user_data);
        let source = this.getSource(data.source);
        if (source && typeof source.onCompleteDone === 'function') {
            await Promise.resolve(source.onCompleteDone(item, opt));
        }
    }
    shouldCommit(item, commitCharacter) {
        if (!item || !item.source)
            return false;
        let source = this.getSource(item.source);
        if (source && source.sourceType == types_1.SourceType.Service && typeof source.shouldCommit === 'function') {
            return source.shouldCommit(item, commitCharacter);
        }
        return false;
    }
    getCompleteSources(opt) {
        let { filetype } = opt;
        let pre = string_1.byteSlice(opt.line, 0, opt.colnr - 1);
        let isTriggered = opt.input == '' && !!opt.triggerCharacter;
        if (isTriggered)
            return this.getTriggerSources(pre, filetype);
        return this.getNormalSources(opt.filetype);
    }
    /**
     * Get sources should be used without trigger.
     *
     * @param {string} filetype
     * @returns {ISource[]}
     */
    getNormalSources(filetype) {
        return this.sources.filter(source => {
            let { filetypes, triggerOnly, enable } = source;
            if (!enable || triggerOnly || (filetypes && !filetypes.includes(filetype))) {
                return false;
            }
            if (this.disabledByLanguageId(source, filetype)) {
                return false;
            }
            return true;
        });
    }
    checkTrigger(source, pre, character) {
        let { triggerCharacters, triggerPatterns } = source;
        if (!triggerCharacters && !triggerPatterns)
            return false;
        if (character && triggerCharacters && triggerCharacters.includes(character)) {
            return true;
        }
        if (triggerPatterns && triggerPatterns.findIndex(p => p.test(pre)) !== -1) {
            return true;
        }
        return false;
    }
    shouldTrigger(pre, languageId) {
        let sources = this.getTriggerSources(pre, languageId);
        return sources.length > 0;
    }
    getTriggerSources(pre, languageId) {
        let character = pre.length ? pre[pre.length - 1] : '';
        if (!character)
            return [];
        return this.sources.filter(source => {
            let { filetypes, enable } = source;
            if (!enable || (filetypes && !filetypes.includes(languageId))) {
                return false;
            }
            if (this.disabledByLanguageId(source, languageId))
                return false;
            return this.checkTrigger(source, pre, character);
        });
    }
    addSource(source) {
        let { name } = source;
        if (this.names.includes(name)) {
            workspace_1.default.showMessage(`Source "${name}" recreated`, 'warning');
        }
        this.sourceMap.set(name, source);
        return vscode_languageserver_protocol_1.Disposable.create(() => {
            this.sourceMap.delete(name);
        });
    }
    removeSource(source) {
        let name = typeof source == 'string' ? source : source.name;
        if (source == this.sourceMap.get(name)) {
            this.sourceMap.delete(name);
        }
    }
    async refresh(name) {
        for (let source of this.sources) {
            if (!name || source.name == name) {
                if (typeof source.refresh === 'function') {
                    await Promise.resolve(source.refresh());
                }
            }
        }
    }
    toggleSource(name) {
        if (!name)
            return;
        let source = this.getSource(name);
        if (!source)
            return;
        if (typeof source.toggle === 'function') {
            source.toggle();
        }
    }
    sourceStats() {
        let res = [];
        let items = this.sources;
        for (let item of items) {
            res.push({
                name: item.name,
                priority: item.priority,
                triggerCharacters: item.triggerCharacters || [],
                shortcut: item.shortcut || '',
                filetypes: item.filetypes || [],
                filepath: item.filepath || '',
                type: item.sourceType == types_1.SourceType.Native
                    ? 'native' : item.sourceType == types_1.SourceType.Remote
                    ? 'remote' : 'service',
                disabled: !item.enable
            });
        }
        return res;
    }
    onDocumentEnter(bufnr) {
        let { sources } = this;
        for (let s of sources) {
            if (!s.enable)
                continue;
            if (typeof s.onEnter == 'function') {
                s.onEnter(bufnr);
            }
        }
    }
    createSource(config) {
        if (!config.name || !config.doComplete) {
            console.error(`name and doComplete required for createSource`);
            return;
        }
        let source = new source_1.default(Object.assign({ sourceType: types_1.SourceType.Service }, config));
        return this.addSource(source);
    }
    disabledByLanguageId(source, languageId) {
        let map = workspace_1.default.env.disabledSources;
        let list = map ? map[languageId] : [];
        return Array.isArray(list) && list.includes(source.name);
    }
    dispose() {
        util_2.disposeAll(this.disposables);
    }
}
exports.Sources = Sources;
exports.default = new Sources();
//# sourceMappingURL=sources.js.map