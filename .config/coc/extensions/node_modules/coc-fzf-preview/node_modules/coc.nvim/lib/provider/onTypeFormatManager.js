"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const string_1 = require("../util/string");
const workspace_1 = tslib_1.__importDefault(require("../workspace"));
const logger = require('../util/logger')('onTypeFormatManager');
class OnTypeFormatManager {
    constructor() {
        this.providers = new Set();
    }
    register(selector, provider, triggerCharacters) {
        let item = {
            triggerCharacters,
            selector,
            provider
        };
        this.providers.add(item);
        return vscode_languageserver_protocol_1.Disposable.create(() => {
            this.providers.delete(item);
        });
    }
    hasProvider(document) {
        for (let o of this.providers) {
            let { selector } = o;
            if (workspace_1.default.match(selector, document) > 0) {
                return true;
            }
        }
        return false;
    }
    getProvider(document, triggerCharacter) {
        for (let o of this.providers) {
            let { triggerCharacters, selector } = o;
            if (workspace_1.default.match(selector, document) > 0 && triggerCharacters.includes(triggerCharacter)) {
                return o.provider;
            }
        }
        return null;
    }
    async onCharacterType(character, document, position, token) {
        if (string_1.isWord(character))
            return;
        let provider = this.getProvider(document, character);
        if (!provider)
            return;
        let formatOpts = await workspace_1.default.getFormatOptions(document.uri);
        return await Promise.resolve(provider.provideOnTypeFormattingEdits(document, position, character, formatOpts, token));
    }
    dispose() {
        this.providers = new Set();
    }
}
exports.default = OnTypeFormatManager;
//# sourceMappingURL=onTypeFormatManager.js.map