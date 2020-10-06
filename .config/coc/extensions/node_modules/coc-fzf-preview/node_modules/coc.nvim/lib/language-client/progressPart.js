/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const workspace_1 = tslib_1.__importDefault(require("../workspace"));
const util_1 = require("../util");
const progressParts = new Map();
class ProgressPart {
    constructor(_client, _token) {
        this._client = _client;
        this._token = _token;
        this._disposables = [];
        this._cancelled = false;
        this._statusBarItem = workspace_1.default.createStatusBarItem(99, { progress: true });
        this._disposables.push(this._statusBarItem);
        this._disposables.push(_client.onProgress(vscode_languageserver_protocol_1.WorkDoneProgress.type, this._token, value => {
            switch (value.kind) {
                case 'begin':
                    this.begin(value);
                    break;
                case 'report':
                    this.report(value);
                    break;
                case 'end':
                    this.done(value.message);
                    break;
            }
        }));
    }
    begin(params) {
        // TODO: support progress window with cancel button & WorkDoneProgressCancelNotification
        this.title = params.title;
        this.report(params);
    }
    report(params) {
        let statusBarItem = this._statusBarItem;
        let parts = [];
        if (this.title)
            parts.push(this.title);
        if (params.percentage)
            parts.push(params.percentage.toFixed(0) + '%');
        if (params.message)
            parts.push(params.message);
        statusBarItem.text = parts.join(' ');
        statusBarItem.show();
    }
    cancel() {
        if (this._cancelled)
            return;
        this._cancelled = true;
        util_1.disposeAll(this._disposables);
        if (progressParts.has(this._token)) {
            progressParts.delete(this._token);
        }
    }
    done(message) {
        let statusBarItem = this._statusBarItem;
        if (!message) {
            this.cancel();
        }
        else {
            statusBarItem.text = `${this.title} ${message}`;
            setTimeout(() => {
                this.cancel();
            }, 500);
        }
    }
}
class ProgressManager {
    create(client, token) {
        let part = this.getProgress(token);
        if (part)
            return part;
        part = new ProgressPart(client, token);
        progressParts.set(token, part);
        return part;
    }
    getProgress(token) {
        return progressParts.get(token) || null;
    }
    cancel(token) {
        let progress = this.getProgress(token);
        if (progress)
            progress.cancel();
    }
}
exports.default = new ProgressManager();
//# sourceMappingURL=progressPart.js.map