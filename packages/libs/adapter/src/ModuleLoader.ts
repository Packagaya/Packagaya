import { LocalFileSystem } from '@packagaya/definitions/dist/LocalFileSystem';
import { inject, injectable } from 'inversify';
import { Logger } from 'tslog';

/**
 * The module loader will be used to load Node.JS based packages
 *
 * @export
 * @class ModuleLoader
 */
@injectable()
export class ModuleLoader {
    /**
     * Creates an instance of ModuleLoader.
     * @param {Logger} logger The logger which should be used to log messages
     * @param {LocalFileSystem} localFileSystem The local file system wrapper
     * @memberof ModuleLoader
     */
    constructor(
        @inject(Logger.name) private logger: Logger,
        @inject(LocalFileSystem.name) private localFileSystem: LocalFileSystem,
    ) {}

    /**
     * Loads the Node.JS module from the given path
     * You can optionally load the default export which is enabled by default
     *
     * @param {string} modulePath The file path to the JS file
     * @param {boolean} [loadDefault=true] When set to true the default export will be returned
     * @return {*}  {*} The (default) export of the file
     * @memberof ModuleLoader
     */
    public loadModule(modulePath: string, loadDefault: boolean = true): any {
        const moduleName = this.localFileSystem.basename(modulePath, false);
        this.logger.debug(`Loading module: ${moduleName}`);
        let importedModule;

        try {
            importedModule = require(modulePath);
        } catch (error) {
            this.logger.error(error);
            throw error;
        }

        this.logger.debug(`Loaded module: ${moduleName}`);

        if (!loadDefault) {
            return importedModule;
        }

        if (importedModule.default === undefined) {
            throw new Error(
                `Module ${moduleName} does not have a default export`,
            );
        }

        return importedModule.default;
    }
}
