export declare class Mutex {
    private tasks;
    private count;
    private sched;
    get busy(): boolean;
    acquire(): Promise<() => void>;
    use<T>(f: () => Promise<T>): Promise<T>;
}
