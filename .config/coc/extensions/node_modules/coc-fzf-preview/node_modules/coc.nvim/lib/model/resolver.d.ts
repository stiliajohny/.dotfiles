export default class Resolver {
    private get nodeFolder();
    private get yarnFolder();
    resolveModule(mod: string): Promise<string>;
}
