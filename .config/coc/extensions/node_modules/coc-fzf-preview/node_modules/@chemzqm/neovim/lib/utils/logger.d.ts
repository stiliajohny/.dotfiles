export interface ILogger {
    debug: (data: string, ...meta: any[]) => void;
    info: (data: string, ...meta: any[]) => void;
    error: (data: string, ...meta: any[]) => void;
    trace: (data: string, ...meta: any[]) => void;
}
export declare function createLogger(name: string): ILogger;
