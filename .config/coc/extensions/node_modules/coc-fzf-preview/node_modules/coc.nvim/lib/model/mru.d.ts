/**
 * Mru - manage string items as lines in mru file.
 */
export default class Mru {
    private name;
    private file;
    /**
     * @param {string} name unique name
     * @param {string} base? optional directory name, default to config root of coc.nvim
     */
    constructor(name: string, base?: string);
    /**
     * Load iems from mru file
     */
    load(): Promise<string[]>;
    /**
     * Add item to mru file.
     */
    add(item: string): Promise<void>;
    /**
     * Remove item from mru file.
     */
    remove(item: string): Promise<void>;
    /**
     * Remove the data file.
     */
    clean(): Promise<void>;
}
