import { Event } from 'vscode-languageserver-protocol';
import { ConfigurationChangeEvent, ConfigurationShape, ConfigurationTarget, ErrorItem, IConfigurationModel, WorkspaceConfiguration } from '../types';
import { Configuration } from './configuration';
import { ConfigurationModel } from './model';
export default class Configurations {
    private userConfigFile?;
    private readonly _proxy?;
    private _configuration;
    private _errorItems;
    private _folderConfigurations;
    private _onError;
    private _onChange;
    private disposables;
    private workspaceConfigFile;
    readonly onError: Event<ErrorItem[]>;
    readonly onDidChange: Event<ConfigurationChangeEvent>;
    constructor(userConfigFile?: string | null, _proxy?: ConfigurationShape);
    private parseContentFromFile;
    get errorItems(): ErrorItem[];
    get foldConfigurations(): Map<string, ConfigurationModel>;
    extendsDefaults(props: {
        [key: string]: any;
    }): void;
    updateUserConfig(props: {
        [key: string]: any;
    }): void;
    get defaults(): ConfigurationModel;
    get user(): ConfigurationModel;
    get workspace(): ConfigurationModel;
    addFolderFile(filepath: string): void;
    private watchFile;
    changeConfiguration(target: ConfigurationTarget, model: IConfigurationModel, configFile?: string): void;
    setFolderConfiguration(uri: string): void;
    hasFolderConfiguration(filepath: string): boolean;
    getConfigFile(target: ConfigurationTarget): string;
    private get folders();
    get configuration(): Configuration;
    /**
     * getConfiguration
     *
     * @public
     * @param {string} section
     * @returns {WorkspaceConfiguration}
     */
    getConfiguration(section?: string, resource?: string): WorkspaceConfiguration;
    private getFolderConfiguration;
    checkFolderConfiguration(uri: string): void;
    private static parse;
    dispose(): void;
}
