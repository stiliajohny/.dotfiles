"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixDriver = exports.isParentFolder = exports.parentDirs = exports.realpathAsync = exports.readdirAsync = exports.isFile = exports.validSocket = exports.writeFile = exports.readFileLine = exports.readFileLines = exports.getFileLineCount = exports.readFile = exports.findUp = exports.inDirectory = exports.resolveRoot = exports.isGitIgnored = exports.renameAsync = exports.unlinkAsync = exports.isDirectory = exports.statAsync = void 0;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const fs_1 = tslib_1.__importDefault(require("fs"));
const net_1 = tslib_1.__importDefault(require("net"));
const os_1 = tslib_1.__importDefault(require("os"));
const path_1 = tslib_1.__importDefault(require("path"));
const readline_1 = tslib_1.__importDefault(require("readline"));
const util_1 = tslib_1.__importDefault(require("util"));
const minimatch_1 = tslib_1.__importDefault(require("minimatch"));
const logger = require('./logger')('util-fs');
async function statAsync(filepath) {
    let stat = null;
    try {
        stat = await util_1.default.promisify(fs_1.default.stat)(filepath);
    }
    catch (e) { }
    return stat;
}
exports.statAsync = statAsync;
async function isDirectory(filepath) {
    let stat = await statAsync(filepath);
    return stat && stat.isDirectory();
}
exports.isDirectory = isDirectory;
async function unlinkAsync(filepath) {
    try {
        await util_1.default.promisify(fs_1.default.unlink)(filepath);
    }
    catch (e) { }
}
exports.unlinkAsync = unlinkAsync;
function renameAsync(oldPath, newPath) {
    return new Promise((resolve, reject) => {
        fs_1.default.rename(oldPath, newPath, err => {
            if (err)
                return reject(err);
            resolve();
        });
    });
}
exports.renameAsync = renameAsync;
async function isGitIgnored(fullpath) {
    if (!fullpath)
        return false;
    let stat = await statAsync(fullpath);
    if (!stat || !stat.isFile())
        return false;
    let root = null;
    try {
        let { stdout } = await util_1.default.promisify(child_process_1.exec)('git rev-parse --show-toplevel', { cwd: path_1.default.dirname(fullpath) });
        root = stdout.trim();
    }
    catch (e) { }
    if (!root)
        return false;
    let file = path_1.default.relative(root, fullpath);
    try {
        let { stdout } = await util_1.default.promisify(child_process_1.exec)(`git check-ignore ${file}`, { cwd: root });
        return stdout.trim() == file;
    }
    catch (e) { }
    return false;
}
exports.isGitIgnored = isGitIgnored;
function resolveRoot(folder, subs, cwd) {
    let home = os_1.default.homedir();
    let dir = fixDriver(folder);
    if (isParentFolder(dir, home, true))
        return null;
    if (cwd && isParentFolder(cwd, dir, true) && inDirectory(cwd, subs))
        return cwd;
    let parts = dir.split(path_1.default.sep);
    let curr = [parts.shift()];
    for (let part of parts) {
        curr.push(part);
        let dir = curr.join(path_1.default.sep);
        if (dir != home && inDirectory(dir, subs)) {
            return dir;
        }
    }
    return null;
}
exports.resolveRoot = resolveRoot;
function inDirectory(dir, subs) {
    try {
        let files = fs_1.default.readdirSync(dir);
        for (let pattern of subs) {
            // note, only '*' expanded
            let is_wildcard = (pattern.includes('*'));
            let res = is_wildcard ?
                (minimatch_1.default.match(files, pattern, { nobrace: true, noext: true, nocomment: true, nonegate: true, dot: true }).length !== 0) :
                (files.includes(pattern));
            if (res)
                return true;
        }
    }
    catch (e) {
        // could be failed without permission
    }
    return false;
}
exports.inDirectory = inDirectory;
function findUp(name, cwd) {
    let root = path_1.default.parse(cwd).root;
    let subs = Array.isArray(name) ? name : [name];
    while (cwd && cwd !== root) {
        let find = inDirectory(cwd, subs);
        if (find) {
            for (let sub of subs) {
                let filepath = path_1.default.join(cwd, sub);
                if (fs_1.default.existsSync(filepath)) {
                    return filepath;
                }
            }
        }
        cwd = path_1.default.dirname(cwd);
    }
    return null;
}
exports.findUp = findUp;
function readFile(fullpath, encoding) {
    return new Promise((resolve, reject) => {
        fs_1.default.readFile(fullpath, encoding, (err, content) => {
            if (err)
                reject(err);
            resolve(content);
        });
    });
}
exports.readFile = readFile;
function getFileLineCount(filepath) {
    let i;
    let count = 0;
    return new Promise((resolve, reject) => {
        fs_1.default.createReadStream(filepath)
            .on('error', e => reject(e))
            .on('data', chunk => {
            for (i = 0; i < chunk.length; ++i)
                if (chunk[i] == 10)
                    count++;
        })
            .on('end', () => resolve(count));
    });
}
exports.getFileLineCount = getFileLineCount;
function readFileLines(fullpath, start, end) {
    if (!fs_1.default.existsSync(fullpath)) {
        return Promise.reject(new Error(`file does not exist: ${fullpath}`));
    }
    let res = [];
    const rl = readline_1.default.createInterface({
        input: fs_1.default.createReadStream(fullpath, { encoding: 'utf8' }),
        crlfDelay: Infinity,
        terminal: false
    });
    let n = 0;
    return new Promise((resolve, reject) => {
        rl.on('line', line => {
            if (n == 0 && line.startsWith('\uFEFF')) {
                // handle BOM
                line = line.slice(1);
            }
            if (n >= start && n <= end) {
                res.push(line);
            }
            if (n == end) {
                rl.close();
            }
            n = n + 1;
        });
        rl.on('close', () => {
            resolve(res);
        });
        rl.on('error', reject);
    });
}
exports.readFileLines = readFileLines;
function readFileLine(fullpath, count) {
    if (!fs_1.default.existsSync(fullpath)) {
        return Promise.reject(new Error(`file does not exist: ${fullpath}`));
    }
    const rl = readline_1.default.createInterface({
        input: fs_1.default.createReadStream(fullpath, { encoding: 'utf8' }),
        crlfDelay: Infinity,
        terminal: false
    });
    let n = 0;
    return new Promise((resolve, reject) => {
        rl.on('line', line => {
            if (n == count) {
                if (n == 0 && line.startsWith('\uFEFF')) {
                    // handle BOM
                    line = line.slice(1);
                }
                rl.close();
                resolve(line);
                return;
            }
            n = n + 1;
        });
        rl.on('error', reject);
    });
}
exports.readFileLine = readFileLine;
async function writeFile(fullpath, content) {
    await util_1.default.promisify(fs_1.default.writeFile)(fullpath, content, { encoding: 'utf8' });
}
exports.writeFile = writeFile;
function validSocket(path) {
    let clientSocket = new net_1.default.Socket();
    return new Promise(resolve => {
        clientSocket.on('error', () => {
            resolve(false);
        });
        clientSocket.connect({ path }, () => {
            clientSocket.unref();
            resolve(true);
        });
    });
}
exports.validSocket = validSocket;
function isFile(uri) {
    return uri.startsWith('file:');
}
exports.isFile = isFile;
exports.readdirAsync = util_1.default.promisify(fs_1.default.readdir);
exports.realpathAsync = util_1.default.promisify(fs_1.default.realpath);
function parentDirs(pth) {
    let { root, dir } = path_1.default.parse(pth);
    if (dir === root)
        return [root];
    const dirs = [root];
    const parts = dir.slice(root.length).split(path_1.default.sep);
    for (let i = 1; i <= parts.length; i++) {
        dirs.push(path_1.default.join(root, parts.slice(0, i).join(path_1.default.sep)));
    }
    return dirs;
}
exports.parentDirs = parentDirs;
function isParentFolder(folder, filepath, checkEqual = false) {
    let pdir = fixDriver(path_1.default.resolve(path_1.default.normalize(folder)));
    let dir = fixDriver(path_1.default.resolve(path_1.default.normalize(filepath)));
    if (pdir == '//')
        pdir = '/';
    if (pdir == dir)
        return checkEqual ? true : false;
    if (pdir.endsWith(path_1.default.sep))
        return dir.startsWith(pdir);
    return dir.startsWith(pdir) && dir[pdir.length] == path_1.default.sep;
}
exports.isParentFolder = isParentFolder;
// use uppercase for windows driver
function fixDriver(filepath) {
    if (os_1.default.platform() != 'win32' || filepath[1] != ':')
        return filepath;
    return filepath[0].toUpperCase() + filepath.slice(1);
}
exports.fixDriver = fixDriver;
//# sourceMappingURL=fs.js.map