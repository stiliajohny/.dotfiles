import { ConfigurationShape, ConfigurationTarget, IWorkspace } from '../types';
export default class ConfigurationProxy implements ConfigurationShape {
    private workspace;
    constructor(workspace: IWorkspace);
    private get nvim();
    private modifyConfiguration;
    get workspaceConfigFile(): string;
    $updateConfigurationOption(target: ConfigurationTarget, key: string, value: any): void;
    $removeConfigurationOption(target: ConfigurationTarget, key: string): void;
}
