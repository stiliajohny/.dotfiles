/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorProviderFeature = void 0;
const tslib_1 = require("tslib");
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const languages_1 = tslib_1.__importDefault(require("../languages"));
const client_1 = require("./client");
function ensure(target, key) {
    if (target[key] === void 0) {
        target[key] = {};
    }
    return target[key];
}
class ColorProviderFeature extends client_1.TextDocumentFeature {
    constructor(client) {
        super(client, vscode_languageserver_protocol_1.DocumentColorRequest.type);
    }
    fillClientCapabilities(capabilites) {
        ensure(ensure(capabilites, 'textDocument'), 'colorProvider').dynamicRegistration = true;
    }
    initialize(capabilities, documentSelector) {
        let [id, options] = this.getRegistration(documentSelector, capabilities.colorProvider);
        if (!id || !options) {
            return;
        }
        this.register(this.messages, { id, registerOptions: options });
    }
    registerLanguageProvider(options) {
        const provider = {
            provideColorPresentations: (color, context, token) => {
                const client = this._client;
                const provideColorPresentations = (color, context, token) => {
                    const requestParams = {
                        color,
                        textDocument: { uri: context.document.uri },
                        range: context.range
                    };
                    return client.sendRequest(vscode_languageserver_protocol_1.ColorPresentationRequest.type, requestParams, token).then(res => res, (error) => {
                        client.logFailedRequest(vscode_languageserver_protocol_1.ColorPresentationRequest.type, error);
                        return Promise.resolve(null);
                    });
                };
                const middleware = client.clientOptions.middleware;
                return middleware.provideColorPresentations
                    ? middleware.provideColorPresentations(color, context, token, provideColorPresentations)
                    : provideColorPresentations(color, context, token);
            },
            provideDocumentColors: (document, token) => {
                const client = this._client;
                const provideDocumentColors = (document, token) => {
                    const requestParams = {
                        textDocument: { uri: document.uri }
                    };
                    return client.sendRequest(vscode_languageserver_protocol_1.DocumentColorRequest.type, requestParams, token).then(res => res, (error) => {
                        client.logFailedRequest(vscode_languageserver_protocol_1.ColorPresentationRequest.type, error);
                        return Promise.resolve(null);
                    });
                };
                const middleware = client.clientOptions.middleware;
                return middleware.provideDocumentColors
                    ? middleware.provideDocumentColors(document, token, provideDocumentColors)
                    : provideDocumentColors(document, token);
            }
        };
        return [languages_1.default.registerDocumentColorProvider(options.documentSelector, provider), provider];
    }
}
exports.ColorProviderFeature = ColorProviderFeature;
//# sourceMappingURL=colorProvider.js.map