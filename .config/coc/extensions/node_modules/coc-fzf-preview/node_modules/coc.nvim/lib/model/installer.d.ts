export interface Info {
    'dist.tarball'?: string;
    'engines.coc'?: string;
    version?: string;
    name?: string;
}
export declare class Installer {
    private root;
    private npm;
    private def;
    private onMessage?;
    private name;
    private url;
    private version;
    constructor(root: string, npm: string, def: string, onMessage?: (msg: string) => void);
    install(): Promise<string>;
    update(url?: string): Promise<string>;
    private doInstall;
    private getInfo;
    private getInfoFromUri;
    private log;
}
export declare function createInstallerFactory(npm: string, root: string): (def: string, onMessage?: (msg: string) => void) => Installer;
