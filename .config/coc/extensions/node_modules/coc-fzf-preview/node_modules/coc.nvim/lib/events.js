"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const util_1 = require("./util");
const object_1 = require("./util/object");
const logger = require('./util/logger')('events');
class Events {
    constructor() {
        this.handlers = new Map();
        this.insertMode = false;
    }
    get cursor() {
        return this._cursor;
    }
    async fire(event, args) {
        logger.debug('Event:', event, args);
        let cbs = this.handlers.get(event);
        if (event == 'InsertEnter') {
            this.insertMode = true;
        }
        else if (event == 'InsertLeave') {
            this.insertMode = false;
        }
        else if (!this.insertMode && (event == 'CursorHoldI' || event == 'CursorMovedI')) {
            this.insertMode = true;
            await this.fire('InsertEnter', [args[0]]);
        }
        else if (this.insertMode && (event == 'CursorHold' || event == 'CursorMoved')) {
            this.insertMode = false;
            await this.fire('InsertLeave', [args[0]]);
        }
        if (event == 'CursorMoved' || event == 'CursorMovedI') {
            let cursor = {
                bufnr: args[0],
                lnum: args[1][0],
                col: args[1][1],
                insert: event == 'CursorMovedI'
            };
            // not handle CursorMoved when it's not moved at all
            if (this._cursor && object_1.equals(this._cursor, cursor))
                return;
            this._cursor = cursor;
        }
        if (cbs) {
            try {
                await Promise.all(cbs.map(fn => fn(args)));
            }
            catch (e) {
                if (e.message && e.message.indexOf('transport disconnected') == -1) {
                    console.error(`Error on ${event}: ${e.message}${e.stack ? '\n' + e.stack : ''} `);
                }
                logger.error(`Handler Error on ${event}`, e.stack);
            }
        }
    }
    on(event, handler, thisArg, disposables) {
        if (Array.isArray(event)) {
            let arr = disposables || [];
            for (let ev of event) {
                this.on(ev, handler, thisArg, arr);
            }
            return vscode_languageserver_protocol_1.Disposable.create(() => {
                util_1.disposeAll(arr);
            });
        }
        else {
            let arr = this.handlers.get(event) || [];
            let stack = Error().stack;
            arr.push(args => new Promise((resolve, reject) => {
                let timer;
                try {
                    Promise.resolve(handler.apply(thisArg || null, args)).then(() => {
                        if (timer)
                            clearTimeout(timer);
                        resolve();
                    }, e => {
                        if (timer)
                            clearTimeout(timer);
                        reject(e);
                    });
                    timer = setTimeout(() => {
                        logger.warn(`Handler of ${event} blocked more than 2s:`, stack);
                    }, 2000);
                }
                catch (e) {
                    reject(e);
                }
            }));
            this.handlers.set(event, arr);
            let disposable = vscode_languageserver_protocol_1.Disposable.create(() => {
                let idx = arr.indexOf(handler);
                if (idx !== -1) {
                    arr.splice(idx, 1);
                }
            });
            if (disposables) {
                disposables.push(disposable);
            }
            return disposable;
        }
    }
}
exports.default = new Events();
//# sourceMappingURL=events.js.map