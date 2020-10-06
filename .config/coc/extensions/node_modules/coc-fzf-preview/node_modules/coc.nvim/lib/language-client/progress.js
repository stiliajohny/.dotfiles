/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressFeature = void 0;
const tslib_1 = require("tslib");
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const progressPart_1 = tslib_1.__importDefault(require("./progressPart"));
// const logger = require('../util/logger')('language-client-progress')
function ensure(target, key) {
    if (target[key] === void 0) {
        target[key] = Object.create(null);
    }
    return target[key];
}
class ProgressFeature {
    constructor(_client) {
        this._client = _client;
    }
    fillClientCapabilities(capabilities) {
        ensure(capabilities, 'window').workDoneProgress = true;
    }
    initialize() {
        let client = this._client;
        client.onRequest(vscode_languageserver_protocol_1.WorkDoneProgressCreateRequest.type, (params) => {
            progressPart_1.default.create(this._client, params.token);
        });
    }
}
exports.ProgressFeature = ProgressFeature;
//# sourceMappingURL=progress.js.map