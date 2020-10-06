"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const manager_1 = tslib_1.__importDefault(require("./manager"));
const uuid_1 = require("uuid");
const array_1 = require("../util/array");
const logger = require('../util/logger')('codeActionManager');
class CodeActionManager extends manager_1.default {
    register(selector, provider, clientId, codeActionKinds) {
        let item = {
            id: uuid_1.v4(),
            selector,
            provider,
            kinds: codeActionKinds,
            clientId
        };
        this.providers.add(item);
        return vscode_languageserver_protocol_1.Disposable.create(() => {
            this.providers.delete(item);
        });
    }
    async provideCodeActions(document, range, context, token) {
        let providers = this.getProviders(document);
        if (!providers.length)
            return null;
        if (context.only) {
            let { only } = context;
            providers = providers.filter(p => {
                if (p.kinds && !p.kinds.some(kind => only.includes(kind))) {
                    return false;
                }
                return true;
            });
        }
        let res = new Map();
        await Promise.all(providers.map(item => {
            let { provider, clientId } = item;
            clientId = clientId || uuid_1.v4();
            return Promise.resolve(provider.provideCodeActions(document, range, context, token)).then(actions => {
                if (!actions || actions.length == 0)
                    return;
                let codeActions = res.get(clientId) || [];
                for (let action of actions) {
                    if (vscode_languageserver_protocol_1.Command.is(action)) {
                        codeActions.push(vscode_languageserver_protocol_1.CodeAction.create(action.title, action));
                    }
                    else {
                        if (context.only) {
                            if (!action.kind)
                                continue;
                            let { only } = context;
                            if (array_1.intersect(only, [vscode_languageserver_protocol_1.CodeActionKind.Source, vscode_languageserver_protocol_1.CodeActionKind.Refactor])) {
                                if (!only.includes(action.kind.split('.', 2)[0])) {
                                    continue;
                                }
                            }
                            else if (!context.only.includes(action.kind)) {
                                continue;
                            }
                        }
                        let idx = codeActions.findIndex(o => o.title == action.title);
                        if (idx == -1)
                            codeActions.push(action);
                    }
                }
                res.set(clientId, codeActions);
            });
        }));
        return res;
    }
    dispose() {
        this.providers = new Set();
    }
}
exports.default = CodeActionManager;
//# sourceMappingURL=codeActionmanager.js.map