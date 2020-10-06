"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const events_1 = tslib_1.__importDefault(require("../events"));
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const util_1 = require("../util");
/**
 * Controls long running task started by vim.
 * Useful to keep the task running after CocRestart.
 *
 * @public
 */
class Task {
    /**
     * @param {Neovim} nvim
     * @param {string} id unique id
     */
    constructor(nvim, id) {
        this.nvim = nvim;
        this.id = id;
        this.disposables = [];
        this._onExit = new vscode_languageserver_protocol_1.Emitter();
        this._onStderr = new vscode_languageserver_protocol_1.Emitter();
        this._onStdout = new vscode_languageserver_protocol_1.Emitter();
        this.onExit = this._onExit.event;
        this.onStdout = this._onStdout.event;
        this.onStderr = this._onStderr.event;
        events_1.default.on('TaskExit', (id, code) => {
            if (id == this.id) {
                this._onExit.fire(code);
            }
        }, null, this.disposables);
        events_1.default.on('TaskStderr', (id, lines) => {
            if (id == this.id) {
                this._onStderr.fire(lines);
            }
        }, null, this.disposables);
        let stdout = [];
        let timer;
        events_1.default.on('TaskStdout', (id, lines) => {
            if (id == this.id) {
                if (timer)
                    clearTimeout(timer);
                stdout.push(...lines);
                timer = setTimeout(() => {
                    this._onStdout.fire(stdout);
                    stdout = [];
                }, 100);
            }
        }, null, this.disposables);
    }
    /**
     * Start task, task will be restarted when already running.
     *
     * @param {TaskOptions} opts
     * @returns {Promise<boolean>}
     */
    async start(opts) {
        let { nvim } = this;
        return await nvim.call('coc#task#start', [this.id, opts]);
    }
    /**
     * Stop task by SIGTERM or SIGKILL
     */
    async stop() {
        let { nvim } = this;
        await nvim.call('coc#task#stop', [this.id]);
    }
    /**
     * Check if the task is running.
     */
    get running() {
        let { nvim } = this;
        return nvim.call('coc#task#running', [this.id]);
    }
    /**
     * Stop task and dispose all events.
     */
    dispose() {
        let { nvim } = this;
        nvim.call('coc#task#stop', [this.id], true);
        this._onStdout.dispose();
        this._onStderr.dispose();
        this._onExit.dispose();
        util_1.disposeAll(this.disposables);
    }
}
exports.default = Task;
//# sourceMappingURL=task.js.map