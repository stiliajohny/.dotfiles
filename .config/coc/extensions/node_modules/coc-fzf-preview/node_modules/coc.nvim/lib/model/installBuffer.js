"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = void 0;
const status_1 = require("./status");
const events_1 = require("events");
const logger = require('../util/logger')('model-installBuffer');
var State;
(function (State) {
    State[State["Waiting"] = 0] = "Waiting";
    State[State["Faild"] = 1] = "Faild";
    State[State["Progressing"] = 2] = "Progressing";
    State[State["Success"] = 3] = "Success";
})(State = exports.State || (exports.State = {}));
class InstallBuffer extends events_1.EventEmitter {
    constructor(isUpdate = false, isSync = false, silent = false) {
        super();
        this.isUpdate = isUpdate;
        this.isSync = isSync;
        this.silent = silent;
        this.statMap = new Map();
        this.messagesMap = new Map();
        this.names = [];
    }
    setExtensions(names) {
        this.statMap.clear();
        this.names = names;
        for (let name of names) {
            this.statMap.set(name, State.Waiting);
        }
    }
    addMessage(name, msg) {
        let lines = this.messagesMap.get(name) || [];
        this.messagesMap.set(name, lines.concat(msg.trim().split(/\r?\n/)));
    }
    startProgress(names) {
        for (let name of names) {
            this.statMap.set(name, State.Progressing);
        }
    }
    finishProgress(name, succeed = true) {
        this.statMap.set(name, succeed ? State.Success : State.Faild);
    }
    get remains() {
        let count = 0;
        for (let name of this.names) {
            let stat = this.statMap.get(name);
            if (![State.Success, State.Faild].includes(stat)) {
                count = count + 1;
            }
        }
        return count;
    }
    getLines() {
        let lines = [];
        for (let name of this.names) {
            let state = this.statMap.get(name);
            let processText = '*';
            switch (state) {
                case State.Progressing: {
                    let d = new Date();
                    let idx = Math.floor(d.getMilliseconds() / 100);
                    processText = status_1.frames[idx];
                    break;
                }
                case State.Faild:
                    processText = '✗';
                    break;
                case State.Success:
                    processText = '✓';
                    break;
            }
            let msgs = this.messagesMap.get(name) || [];
            lines.push(`- ${processText} ${name} ${msgs.length ? msgs[msgs.length - 1] : ''}`);
        }
        return lines;
    }
    getMessages(line) {
        if (line <= 1)
            return [];
        let name = this.names[line - 2];
        if (!name)
            return [];
        return this.messagesMap.get(name);
    }
    // draw frame
    draw(nvim, buffer) {
        let { remains } = this;
        let first = remains == 0 ? `${this.isUpdate ? 'Update' : 'Install'} finished` : `Installing, ${remains} remains...`;
        let lines = [first, '', ...this.getLines()];
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        buffer.setLines(lines, { start: 0, end: -1, strictIndexing: false }, true);
        if (remains == 0 && this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        if (process.env.VIM_NODE_RPC) {
            nvim.command('redraw', true);
        }
    }
    highlight(nvim) {
        nvim.call('matchadd', ['CocListFgCyan', '^\\-\\s\\zs\\*'], true);
        nvim.call('matchadd', ['CocListFgGreen', '^\\-\\s\\zs✓'], true);
        nvim.call('matchadd', ['CocListFgRed', '^\\-\\s\\zs✗'], true);
        nvim.call('matchadd', ['CocListFgYellow', '^-.\\{3\\}\\zs\\S\\+'], true);
    }
    async show(nvim) {
        let { isSync } = this;
        if (this.silent)
            return;
        nvim.pauseNotification();
        nvim.command(isSync ? 'enew' : 'vs +enew', true);
        nvim.call('bufnr', ['%'], true);
        nvim.command('setl buftype=nofile bufhidden=wipe noswapfile nobuflisted wrap undolevels=-1', true);
        if (!isSync) {
            nvim.command('nnoremap <silent><nowait><buffer> q :q<CR>', true);
        }
        this.highlight(nvim);
        let res = await nvim.resumeNotification();
        let bufnr = res && res[1] == null ? res[0][1] : null;
        if (!bufnr)
            return;
        this.bufnr = bufnr;
        let buffer = nvim.createBuffer(bufnr);
        this.interval = setInterval(() => {
            this.draw(nvim, buffer);
        }, 100);
    }
    dispose() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}
exports.default = InstallBuffer;
//# sourceMappingURL=installBuffer.js.map