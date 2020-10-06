export default class DB {
    readonly filepath: string;
    constructor(filepath: string);
    /**
     * Get data by key.
     *
     * @param {string} key unique key allows dot notation.
     * @returns {any}
     */
    fetch(key: string): any;
    /**
     * Check if key exists
     *
     * @param {string} key unique key allows dot notation.
     */
    exists(key: string): boolean;
    /**
     * Delete data by key
     *
     * @param {string} key unique key allows dot notation.
     */
    delete(key: string): void;
    /**
     * Save data with key
     *
     * @param {string} key unique string that allows dot notation.
     * @param {number|null|boolean|string|{[index} data saved data.
     */
    push(key: string, data: number | null | boolean | string | {
        [index: string]: any;
    }): void;
    private load;
    /**
     * Empty db file.
     */
    clear(): void;
    /**
     * Remove db file.
     */
    destroy(): void;
}
