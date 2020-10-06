"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInstallerFactory = exports.Installer = void 0;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const readline_1 = tslib_1.__importDefault(require("readline"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const mkdirp_1 = tslib_1.__importDefault(require("mkdirp"));
const mv_1 = tslib_1.__importDefault(require("mv"));
const os_1 = tslib_1.__importDefault(require("os"));
const path_1 = tslib_1.__importDefault(require("path"));
const rc_1 = tslib_1.__importDefault(require("rc"));
const semver_1 = tslib_1.__importDefault(require("semver"));
const util_1 = require("util");
const workspace_1 = tslib_1.__importDefault(require("../workspace"));
const download_1 = tslib_1.__importDefault(require("./download"));
const fetch_1 = tslib_1.__importDefault(require("./fetch"));
const rimraf_1 = tslib_1.__importDefault(require("rimraf"));
const fs_2 = require("../util/fs");
const logger = require('../util/logger')('model-installer');
function registryUrl(scope = 'coc.nvim') {
    const result = rc_1.default('npm', { registry: 'https://registry.npmjs.org/' });
    const registry = result[`${scope}:registry`] || result.config_registry || result.registry;
    return registry.endsWith('/') ? registry : registry + '/';
}
class Installer {
    constructor(root, npm, 
    // could be url or name@version or name
    def, onMessage) {
        this.root = root;
        this.npm = npm;
        this.def = def;
        this.onMessage = onMessage;
        if (!fs_1.default.existsSync(root))
            mkdirp_1.default.sync(root);
        if (/^https?:/.test(def)) {
            this.url = def;
        }
        else {
            if (def.includes('@')) {
                let [name, version] = def.split('@', 2);
                this.name = name;
                this.version = version;
            }
            else {
                this.name = def;
            }
        }
    }
    async install() {
        this.log(`Using npm from: ${this.npm}`);
        let info = await this.getInfo();
        logger.info(`Fetched info of ${this.def}`, info);
        let { name } = info;
        let required = info['engines.coc'] ? info['engines.coc'].replace(/^\^/, '>=') : '';
        if (required && !semver_1.default.satisfies(workspace_1.default.version, required)) {
            throw new Error(`${name} ${info.version} requires coc.nvim >= ${required}, please update coc.nvim.`);
        }
        await this.doInstall(info);
        return name;
    }
    async update(url) {
        this.url = url;
        let folder = path_1.default.join(this.root, this.name);
        let stat = await util_1.promisify(fs_1.default.lstat)(folder);
        if (stat.isSymbolicLink()) {
            this.log(`Skipped update for symbol link`);
            return;
        }
        let version;
        if (fs_1.default.existsSync(path_1.default.join(folder, 'package.json'))) {
            let content = await util_1.promisify(fs_1.default.readFile)(path_1.default.join(folder, 'package.json'), 'utf8');
            version = JSON.parse(content).version;
        }
        this.log(`Using npm from: ${this.npm}`);
        let info = await this.getInfo();
        if (version && info.version && semver_1.default.gte(version, info.version)) {
            this.log(`Current version ${version} is up to date.`);
            return;
        }
        let required = info['engines.coc'] ? info['engines.coc'].replace(/^\^/, '>=') : '';
        if (required && !semver_1.default.satisfies(workspace_1.default.version, required)) {
            throw new Error(`${info.version} requires coc.nvim ${required}, please update coc.nvim.`);
        }
        await this.doInstall(info);
        let jsonFile = path_1.default.join(this.root, info.name, 'package.json');
        if (fs_1.default.existsSync(jsonFile)) {
            this.log(`Updated to v${info.version}`);
            return path_1.default.dirname(jsonFile);
        }
        else {
            throw new Error(`Package.json not found: ${jsonFile}`);
        }
    }
    async doInstall(info) {
        let folder = path_1.default.join(this.root, info.name);
        if (fs_1.default.existsSync(folder)) {
            let stat = fs_1.default.statSync(folder);
            if (!stat.isDirectory()) {
                this.log(`${folder} is not directory skipped install`);
                return;
            }
        }
        let tmpFolder = await util_1.promisify(fs_1.default.mkdtemp)(path_1.default.join(os_1.default.tmpdir(), `${info.name}-`));
        let url = info['dist.tarball'];
        this.log(`Downloading from ${url}`);
        await download_1.default(url, { dest: tmpFolder, onProgress: p => this.log(`Download progress ${p}%`), extract: 'untar' });
        this.log(`Extension download at ${tmpFolder}`);
        let content = await util_1.promisify(fs_1.default.readFile)(path_1.default.join(tmpFolder, 'package.json'), 'utf8');
        let { dependencies } = JSON.parse(content);
        if (dependencies && Object.keys(dependencies).length) {
            let p = new Promise((resolve, reject) => {
                let args = ['install', '--ignore-scripts', '--no-lockfile', '--production'];
                if (url.startsWith('https://github.com')) {
                    args = ['install'];
                }
                this.log(`Installing dependencies by: ${this.npm} ${args.join(' ')}.`);
                const child = child_process_1.spawn(this.npm, args, {
                    cwd: tmpFolder,
                });
                const rl = readline_1.default.createInterface({
                    input: child.stdout
                });
                rl.on('line', line => {
                    this.log(`[npm] ${line}`);
                });
                child.stderr.setEncoding('utf8');
                child.stdout.setEncoding('utf8');
                child.on('error', reject);
                let err = '';
                child.stderr.on('data', data => {
                    err += data;
                });
                child.on('exit', code => {
                    if (code) {
                        if (err)
                            this.log(err);
                        reject(new Error(`${this.npm} install exited with ${code}`));
                        return;
                    }
                    resolve();
                });
            });
            await p;
        }
        let jsonFile = path_1.default.resolve(this.root, global.hasOwnProperty('__TEST__') ? '' : '..', 'package.json');
        let obj = JSON.parse(fs_1.default.readFileSync(jsonFile, 'utf8'));
        obj.dependencies = obj.dependencies || {};
        if (this.url) {
            obj.dependencies[info.name] = this.url;
        }
        else {
            obj.dependencies[info.name] = '>=' + info.version;
        }
        const sortedObj = { dependencies: {} };
        Object.keys(obj.dependencies).sort().forEach(k => {
            sortedObj.dependencies[k] = obj.dependencies[k];
        });
        let stat = await fs_2.statAsync(folder);
        if (stat) {
            if (stat.isDirectory()) {
                rimraf_1.default.sync(folder, { glob: false });
            }
            else {
                fs_1.default.unlinkSync(folder);
            }
        }
        await util_1.promisify(mv_1.default)(tmpFolder, folder, { mkdirp: true, clobber: true });
        fs_1.default.writeFileSync(jsonFile, JSON.stringify(sortedObj, null, 2), { encoding: 'utf8' });
        this.log(`Update package.json at ${jsonFile}`);
        this.log(`Installed extension ${this.name}@${info.version} at ${folder}`);
    }
    async getInfo() {
        if (this.url)
            return await this.getInfoFromUri();
        let registry = registryUrl();
        this.log(`Get info from ${registry}`);
        let res = await fetch_1.default(registry + this.name, { timeout: 10000 });
        if (!this.version)
            this.version = res['dist-tags']['latest'];
        let obj = res['versions'][this.version];
        if (!obj)
            throw new Error(`${this.def} doesn't exists in ${registry}.`);
        let requiredVersion = obj['engines'] && obj['engines']['coc'];
        if (!requiredVersion) {
            throw new Error(`${this.def} is not valid coc extension, "engines" field with coc property required.`);
        }
        return {
            'dist.tarball': obj['dist']['tarball'],
            'engines.coc': requiredVersion,
            version: obj['version'],
            name: res.name
        };
    }
    async getInfoFromUri() {
        let { url } = this;
        if (!url.includes('github.com')) {
            throw new Error(`"${url}" is not supported, coc.nvim support github.com only`);
        }
        url = url.replace(/\/$/, '');
        let fileUrl = url.replace('github.com', 'raw.githubusercontent.com') + '/master/package.json';
        this.log(`Get info from ${fileUrl}`);
        let content = await fetch_1.default(fileUrl, { timeout: 10000 });
        let obj = typeof content == 'string' ? JSON.parse(content) : content;
        this.name = obj.name;
        return {
            'dist.tarball': `${url}/archive/master.tar.gz`,
            'engines.coc': obj['engines'] ? obj['engines']['coc'] : null,
            name: obj.name,
            version: obj.version
        };
    }
    log(msg, extra) {
        logger.info(msg, extra ? extra : '');
        if (typeof this.onMessage === 'function') {
            this.onMessage(msg);
        }
    }
}
exports.Installer = Installer;
function createInstallerFactory(npm, root) {
    return (def, onMessage) => new Installer(root, npm, def, onMessage);
}
exports.createInstallerFactory = createInstallerFactory;
//# sourceMappingURL=installer.js.map