"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const buffer_1 = require("buffer");
const util_1 = require("../util");
const workspace_1 = tslib_1.__importDefault(require("../workspace"));
const logger = require('../util/logger')("outpubChannel");
class BufferChannel {
    constructor(name, nvim) {
        this.name = name;
        this.nvim = nvim;
        this._content = '';
        this.disposables = [];
        this._showing = false;
        this.promise = Promise.resolve(void 0);
    }
    get content() {
        return this._content;
    }
    async _append(value, isLine) {
        let { buffer } = this;
        if (!buffer)
            return;
        try {
            if (isLine) {
                await buffer.append(value.split('\n'));
            }
            else {
                let last = await this.nvim.call('getbufline', [buffer.id, '$']);
                let content = last + value;
                if (this.buffer) {
                    await buffer.setLines(content.split('\n'), {
                        start: -2,
                        end: -1,
                        strictIndexing: false
                    });
                }
            }
        }
        catch (e) {
            logger.error(`Error on append output:`, e);
        }
    }
    append(value) {
        if (this._content.length + value.length >= buffer_1.constants.MAX_STRING_LENGTH) {
            this.clear(10);
        }
        this._content += value;
        this.promise = this.promise.then(() => this._append(value, false));
    }
    appendLine(value) {
        if (this._content.length + value.length >= buffer_1.constants.MAX_STRING_LENGTH) {
            this.clear(10);
        }
        this._content += value + '\n';
        this.promise = this.promise.then(() => this._append(value, true));
    }
    clear(keep) {
        let latest = [];
        if (keep) {
            latest = this._content.split('\n').slice(-keep);
        }
        this._content = latest.join('\n');
        let { buffer } = this;
        if (buffer) {
            Promise.resolve(buffer.setLines(latest, {
                start: 0,
                end: -1,
                strictIndexing: false
            })).catch(_e => {
                // noop
            });
        }
    }
    hide() {
        let { nvim, buffer } = this;
        if (buffer)
            nvim.command(`silent! bd! ${buffer.id}`, true);
    }
    dispose() {
        this.hide();
        this._content = '';
        util_1.disposeAll(this.disposables);
    }
    get buffer() {
        let doc = workspace_1.default.getDocument(`output:///${this.name}`);
        return doc ? doc.buffer : null;
    }
    async openBuffer(preserveFocus) {
        let { nvim, buffer } = this;
        if (buffer) {
            let loaded = await nvim.call('bufloaded', buffer.id);
            if (!loaded)
                buffer = null;
        }
        if (!buffer) {
            await nvim.command(`belowright vs output:///${this.name}`);
        }
        else {
            // check shown
            let wnr = await nvim.call('bufwinnr', buffer.id);
            if (wnr != -1)
                return;
            await nvim.command(`vert belowright sb ${buffer.id}`);
        }
        if (preserveFocus) {
            await nvim.command('wincmd p');
        }
    }
    show(preserveFocus) {
        if (this._showing)
            return;
        this._showing = true;
        this.openBuffer(preserveFocus).then(() => {
            this._showing = false;
        }, () => {
            this._showing = false;
        });
    }
}
exports.default = BufferChannel;
//# sourceMappingURL=outputChannel.js.map