"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const util_1 = tslib_1.__importDefault(require("util"));
const mkdirp_1 = tslib_1.__importDefault(require("mkdirp"));
/**
 * Mru - manage string items as lines in mru file.
 */
class Mru {
    /**
     * @param {string} name unique name
     * @param {string} base? optional directory name, default to config root of coc.nvim
     */
    constructor(name, base) {
        this.name = name;
        this.file = path_1.default.join(base || process.env.COC_DATA_HOME, name);
    }
    /**
     * Load iems from mru file
     */
    async load() {
        let dir = path_1.default.dirname(this.file);
        try {
            mkdirp_1.default.sync(dir);
            if (!fs_1.default.existsSync(this.file)) {
                fs_1.default.writeFileSync(this.file, '', 'utf8');
            }
            let content = await util_1.default.promisify(fs_1.default.readFile)(this.file, 'utf8');
            content = content.trim();
            return content.length ? content.trim().split('\n') : [];
        }
        catch (e) {
            return [];
        }
    }
    /**
     * Add item to mru file.
     */
    async add(item) {
        let items = await this.load();
        let idx = items.indexOf(item);
        if (idx !== -1)
            items.splice(idx, 1);
        items.unshift(item);
        fs_1.default.writeFileSync(this.file, items.join('\n'), 'utf8');
    }
    /**
     * Remove item from mru file.
     */
    async remove(item) {
        let items = await this.load();
        let idx = items.indexOf(item);
        if (idx !== -1) {
            items.splice(idx, 1);
            fs_1.default.writeFileSync(this.file, items.join('\n'), 'utf8');
        }
    }
    /**
     * Remove the data file.
     */
    async clean() {
        try {
            await util_1.default.promisify(fs_1.default.unlink)(this.file);
        }
        catch (e) {
            // noop
        }
    }
}
exports.default = Mru;
//# sourceMappingURL=mru.js.map