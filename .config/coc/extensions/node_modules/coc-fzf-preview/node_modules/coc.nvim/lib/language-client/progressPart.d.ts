import { Disposable, NotificationHandler, NotificationType, ProgressToken, ProgressType, WorkDoneProgressBegin } from 'vscode-languageserver-protocol';
export interface ProgressContext {
    onProgress<P>(type: ProgressType<P>, token: string | number, handler: NotificationHandler<P>): Disposable;
    sendNotification<P, RO>(type: NotificationType<P, RO>, params?: P): void;
}
declare class ProgressPart {
    private _client;
    private _token;
    private _disposables;
    private _statusBarItem;
    private _cancelled;
    private title;
    constructor(_client: ProgressContext, _token: ProgressToken);
    begin(params: WorkDoneProgressBegin): void;
    private report;
    cancel(): void;
    done(message?: string): void;
}
declare class ProgressManager {
    create(client: ProgressContext, token: ProgressToken): ProgressPart;
    getProgress(token: ProgressToken): ProgressPart | null;
    cancel(token: ProgressToken): void;
}
declare const _default: ProgressManager;
export default _default;
