/// <reference types="node" />
import { ExecOptions } from 'child_process';
import { Disposable } from 'vscode-languageserver-protocol';
import { MapMode } from '../types';
import * as platform from './platform';
export { platform };
export declare const CONFIG_FILE_NAME = "coc-settings.json";
export declare function escapeSingleQuote(str: string): string;
export declare function wait(ms: number): Promise<any>;
export declare function getUri(fullpath: string, id: number, buftype: string, isCygwin: boolean): string;
export declare function disposeAll(disposables: Disposable[]): void;
export declare function executable(command: string): boolean;
export declare function runCommand(cmd: string, opts?: ExecOptions, timeout?: number): Promise<string>;
export declare function watchFile(filepath: string, onChange: () => void): Disposable;
export declare function isRunning(pid: number): boolean;
export declare function getKeymapModifier(mode: MapMode): string;
export declare function isDocumentEdit(edit: any): boolean;
export declare function concurrent<T>(arr: T[], fn: (val: T) => Promise<void>, limit?: number): Promise<void>;
