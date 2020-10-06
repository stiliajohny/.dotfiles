"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImplementationFeature = void 0;
const tslib_1 = require("tslib");
/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const languages_1 = tslib_1.__importDefault(require("../languages"));
const client_1 = require("./client");
const cv = tslib_1.__importStar(require("./utils/converter"));
function ensure(target, key) {
    if (target[key] === void 0) {
        target[key] = {};
    }
    return target[key];
}
class ImplementationFeature extends client_1.TextDocumentFeature {
    constructor(client) {
        super(client, vscode_languageserver_protocol_1.ImplementationRequest.type);
    }
    fillClientCapabilities(capabilites) {
        const implementationSupport = ensure(ensure(capabilites, 'textDocument'), 'implementation');
        implementationSupport.dynamicRegistration = true;
        // implementationSupport.linkSupport = true
    }
    initialize(capabilities, documentSelector) {
        const [id, options] = this.getRegistration(documentSelector, capabilities.implementationProvider);
        if (!id || !options) {
            return;
        }
        this.register(this.messages, { id, registerOptions: options });
    }
    registerLanguageProvider(options) {
        const provider = {
            provideImplementation: (document, position, token) => {
                const client = this._client;
                const provideImplementation = (document, position, token) => client.sendRequest(vscode_languageserver_protocol_1.ImplementationRequest.type, cv.asTextDocumentPositionParams(document, position), token).then(res => res, error => {
                    client.logFailedRequest(vscode_languageserver_protocol_1.ImplementationRequest.type, error);
                    return Promise.resolve(null);
                });
                const middleware = client.clientOptions.middleware;
                return middleware.provideImplementation
                    ? middleware.provideImplementation(document, position, token, provideImplementation)
                    : provideImplementation(document, position, token);
            }
        };
        return [languages_1.default.registerImplementationProvider(options.documentSelector, provider), provider];
    }
}
exports.ImplementationFeature = ImplementationFeature;
//# sourceMappingURL=implementation.js.map