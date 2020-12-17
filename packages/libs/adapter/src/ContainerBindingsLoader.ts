import { Container, inject, injectable } from 'inversify';
import { Logger } from 'tslog';

import { ModuleLoader } from './ModuleLoader';

/**
 * Loads the additional container bindings from the adapters
 *
 * The container bindings loader will be used to load
 * additional container bindings which are defined by
 * the adapters.
 * Before the command manager is instantiated by the container,
 * the container bindings loader will be used to load additional commands
 * and feature flags
 *
 * @export
 * @class ContainerBindingsLoader
 */
@injectable()
export class ContainerBindingsLoader {
    /**
     * Creates an instance of ContainerBindingsLoader.
     * @param {Container} container The container which should be used to bing the new container modules
     * @param {ModuleLoader} moduleLoader The module loader which should be used to load the Node.JS packages
     * @memberof ContainerBindingsLoader
     */
    constructor(
        @inject(Logger) private logger: Logger,
        @inject(Container.name) private container: Container,
        @inject(ModuleLoader) private moduleLoader: ModuleLoader,
    ) {}

    /**
     * Loads the container bindings based on the adapter informations
     *
     * @param {IAdapterInformation[]} adapterInformations The adapter informations which are defined by the adapter loader
     * @memberof ContainerBindingsLoader
     */
    public loadBindings(filePaths: string[]) {
        const loadedBindings = filePaths.map((path) => {
            this.logger.debug(`Loading container module from path: ${path}`);

            // Return the loaded Node.JS module
            return this.moduleLoader.loadModule(path);
        });

        loadedBindings.forEach((AdditionalContainerModule) => {
            // Bind the container modules from the plugins to the container
            this.container.load(new AdditionalContainerModule());
        });
    }
}
