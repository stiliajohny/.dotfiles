"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger = require('../util/logger')('model-terminal');
class TerminalModel {
    constructor(cmd, args, nvim, _name) {
        this.cmd = cmd;
        this.args = args;
        this.nvim = nvim;
        this._name = _name;
        this.pid = 0;
    }
    async start(cwd, env) {
        let { nvim } = this;
        let cmd = [this.cmd, ...this.args];
        let [bufnr, pid] = await nvim.call('coc#terminal#start', [cmd, cwd, env || {}]);
        this.bufnr = bufnr;
        this.pid = pid;
    }
    get name() {
        return this._name || this.cmd;
    }
    get processId() {
        return Promise.resolve(this.pid);
    }
    sendText(text, addNewLine = true) {
        if (!this.bufnr)
            return;
        this.nvim.call('coc#terminal#send', [this.bufnr, text, addNewLine], true);
    }
    async show(preserveFocus) {
        let { bufnr, nvim } = this;
        if (!bufnr)
            return;
        let [loaded, winid, curr] = await nvim.eval(`[bufloaded(${bufnr}),bufwinid(${bufnr}),win_getid()]`);
        if (!loaded)
            return false;
        if (curr == winid)
            return true;
        nvim.pauseNotification();
        if (winid == -1) {
            nvim.command(`below ${bufnr}sb`, true);
            nvim.command('resize 8', true);
            nvim.call('coc#util#do_autocmd', ['CocTerminalOpen'], true);
        }
        else {
            nvim.call('win_gotoid', [winid], true);
        }
        nvim.command('normal! G', true);
        if (preserveFocus) {
            nvim.command('wincmd p', true);
        }
        await nvim.resumeNotification();
        return true;
    }
    async hide() {
        let { bufnr, nvim } = this;
        if (!bufnr)
            return;
        let winnr = await nvim.call('bufwinnr', bufnr);
        if (winnr == -1)
            return;
        await nvim.command(`${winnr}close!`);
    }
    dispose() {
        let { bufnr, nvim } = this;
        if (!bufnr)
            return;
        nvim.call('coc#terminal#close', [bufnr], true);
    }
}
exports.default = TerminalModel;
//# sourceMappingURL=terminal.js.map