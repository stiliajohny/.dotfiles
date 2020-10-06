import { Neovim } from '@chemzqm/neovim';
import Refactor from './refactor';
export default class Search {
    private nvim;
    private cmd;
    private task;
    constructor(nvim: Neovim, cmd?: string);
    run(args: string[], cwd: string, refactor: Refactor): Promise<void>;
}
