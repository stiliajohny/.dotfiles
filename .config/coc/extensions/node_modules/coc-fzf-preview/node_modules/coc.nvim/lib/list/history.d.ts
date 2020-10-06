import { ListManager } from './manager';
export default class History {
    private manager;
    private db;
    private index;
    private loaded;
    private current;
    private historyInput;
    constructor(manager: ListManager);
    get curr(): string | null;
    load(): void;
    add(): void;
    previous(): void;
    next(): void;
}
