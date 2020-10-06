import { Neovim } from '@chemzqm/neovim';
import { TaskOptions } from '../types';
import { Disposable, Event } from 'vscode-languageserver-protocol';
/**
 * Controls long running task started by vim.
 * Useful to keep the task running after CocRestart.
 *
 * @public
 */
export default class Task implements Disposable {
    private nvim;
    private id;
    private disposables;
    private readonly _onExit;
    private readonly _onStderr;
    private readonly _onStdout;
    readonly onExit: Event<number>;
    readonly onStdout: Event<string[]>;
    readonly onStderr: Event<string[]>;
    /**
     * @param {Neovim} nvim
     * @param {string} id unique id
     */
    constructor(nvim: Neovim, id: string);
    /**
     * Start task, task will be restarted when already running.
     *
     * @param {TaskOptions} opts
     * @returns {Promise<boolean>}
     */
    start(opts: TaskOptions): Promise<boolean>;
    /**
     * Stop task by SIGTERM or SIGKILL
     */
    stop(): Promise<void>;
    /**
     * Check if the task is running.
     */
    get running(): Promise<boolean>;
    /**
     * Stop task and dispose all events.
     */
    dispose(): void;
}
