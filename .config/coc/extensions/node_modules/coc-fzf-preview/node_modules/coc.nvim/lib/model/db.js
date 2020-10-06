"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const mkdirp_1 = tslib_1.__importDefault(require("mkdirp"));
const path_1 = tslib_1.__importDefault(require("path"));
class DB {
    constructor(filepath) {
        this.filepath = filepath;
    }
    /**
     * Get data by key.
     *
     * @param {string} key unique key allows dot notation.
     * @returns {any}
     */
    fetch(key) {
        let obj = this.load();
        if (!key)
            return obj;
        let parts = key.split('.');
        for (let part of parts) {
            if (typeof obj[part] == 'undefined') {
                return undefined;
            }
            obj = obj[part];
        }
        return obj;
    }
    /**
     * Check if key exists
     *
     * @param {string} key unique key allows dot notation.
     */
    exists(key) {
        let obj = this.load();
        let parts = key.split('.');
        for (let part of parts) {
            if (typeof obj[part] == 'undefined') {
                return false;
            }
            obj = obj[part];
        }
        return true;
    }
    /**
     * Delete data by key
     *
     * @param {string} key unique key allows dot notation.
     */
    delete(key) {
        let obj = this.load();
        let origin = obj;
        let parts = key.split('.');
        let len = parts.length;
        for (let i = 0; i < len; i++) {
            if (typeof obj[parts[i]] == 'undefined') {
                break;
            }
            if (i == len - 1) {
                delete obj[parts[i]];
                fs_1.default.writeFileSync(this.filepath, JSON.stringify(origin, null, 2), 'utf8');
                break;
            }
            obj = obj[parts[i]];
        }
    }
    /**
     * Save data with key
     *
     * @param {string} key unique string that allows dot notation.
     * @param {number|null|boolean|string|{[index} data saved data.
     */
    push(key, data) {
        let origin = this.load() || {};
        let obj = origin;
        let parts = key.split('.');
        let len = parts.length;
        if (obj == null) {
            let dir = path_1.default.dirname(this.filepath);
            mkdirp_1.default.sync(dir);
            obj = origin;
        }
        for (let i = 0; i < len; i++) {
            let key = parts[i];
            if (i == len - 1) {
                obj[key] = data;
                fs_1.default.writeFileSync(this.filepath, JSON.stringify(origin, null, 2));
                break;
            }
            if (typeof obj[key] == 'undefined') {
                obj[key] = {};
                obj = obj[key];
            }
            else {
                obj = obj[key];
            }
        }
    }
    load() {
        let dir = path_1.default.dirname(this.filepath);
        let stat = fs_1.default.statSync(dir);
        if (!stat || !stat.isDirectory()) {
            mkdirp_1.default.sync(dir);
            fs_1.default.writeFileSync(this.filepath, '{}', 'utf8');
            return {};
        }
        try {
            let content = fs_1.default.readFileSync(this.filepath, 'utf8');
            return JSON.parse(content.trim());
        }
        catch (e) {
            fs_1.default.writeFileSync(this.filepath, '{}', 'utf8');
            return {};
        }
    }
    /**
     * Empty db file.
     */
    clear() {
        let stat = fs_1.default.statSync(this.filepath);
        if (!stat || !stat.isFile())
            return;
        fs_1.default.writeFileSync(this.filepath, '{}', 'utf8');
    }
    /**
     * Remove db file.
     */
    destroy() {
        if (fs_1.default.existsSync(this.filepath)) {
            fs_1.default.unlinkSync(this.filepath);
        }
    }
}
exports.default = DB;
//# sourceMappingURL=db.js.map