/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeclarationFeature = void 0;
const tslib_1 = require("tslib");
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const languages_1 = tslib_1.__importDefault(require("../languages"));
const client_1 = require("./client");
const converter_1 = require("./utils/converter");
function ensure(target, key) {
    if (target[key] === void 0) {
        target[key] = {};
    }
    return target[key];
}
class DeclarationFeature extends client_1.TextDocumentFeature {
    constructor(client) {
        super(client, vscode_languageserver_protocol_1.DeclarationRequest.type);
    }
    fillClientCapabilities(capabilites) {
        let declarationSupport = ensure(ensure(capabilites, 'textDocument'), 'declaration');
        declarationSupport.dynamicRegistration = true;
        // declarationSupport.linkSupport = true
    }
    initialize(capabilities, documentSelector) {
        const [id, options] = this.getRegistration(documentSelector, capabilities.declarationProvider);
        if (!id || !options) {
            return;
        }
        this.register(this.messages, { id, registerOptions: options });
    }
    registerLanguageProvider(options) {
        const provider = {
            provideDeclaration: (document, position, token) => {
                const client = this._client;
                const provideDeclaration = (document, position, token) => client.sendRequest(vscode_languageserver_protocol_1.DeclarationRequest.type, converter_1.asTextDocumentPositionParams(document, position), token).then(res => res, error => {
                    client.logFailedRequest(vscode_languageserver_protocol_1.DeclarationRequest.type, error);
                    return Promise.resolve(null);
                });
                const middleware = client.clientOptions.middleware;
                return middleware.provideDeclaration
                    ? middleware.provideDeclaration(document, position, token, provideDeclaration)
                    : provideDeclaration(document, position, token);
            }
        };
        return [languages_1.default.registerDeclarationProvider(options.documentSelector, provider), provider];
    }
}
exports.DeclarationFeature = DeclarationFeature;
//# sourceMappingURL=declaration.js.map