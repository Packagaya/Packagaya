import { LocalFileSystem } from '@packagaya/definitions/dist/LocalFileSystem';
import { Container, inject, injectable } from 'inversify';
import { dirname } from 'path';
import { Logger } from 'tslog';

import { Adapter } from './Adapter';
import { ContainerBindingsLoader } from './ContainerBindingsLoader';
import { IAdapterInformation } from './IAdapterInformation';
import { INPMConfig } from './INPMConfig';
import { isNPMConfig } from './INPMConfig.guard';
import { ModuleLoader } from './ModuleLoader';

/**
 * Defines an adapter loader which loads adapters and their container bindings
 *
 * @export
 * @class AdapterLoader
 */
@injectable()
export class AdapterLoader {
    /**
     * Creates an instance of AdapterLoader.
     * @param {Logger} logger The logger which should be used to log messages
     * @param {LocalFileSystem} localFileSystem The local filesystem which
     *                                          should be used
     * @param {Container} container The container which is used for binding the
     *                                  additional container bindings
     * @param {ContainerBindingsLoader} containerBindingsLoader The container bindings loader which loads the additional
     *                                                          container bindings from the adapters
     * @param {ModuleLoader} moduleLoader The module loader which should be used to load the additional
     *                                    container binding files
     * @memberof AdapterLoader
     */
    constructor(
        @inject(Logger.name) private logger: Logger,
        @inject(LocalFileSystem.name) private localFileSystem: LocalFileSystem,
        @inject(Container.name) private container: Container,
        @inject(ContainerBindingsLoader.name)
        private containerBindingsLoader: ContainerBindingsLoader,
        @inject(ModuleLoader.name) private moduleLoader: ModuleLoader,
    ) {}

    /**
     * Load the adapters
     *
     * @param {string[]} adapterNames The names of the adapters which should be loaded
     * @return {Adapter[]} The loaded adapters
     * @memberof AdapterLoader
     */
    public load(adapterNames: string[]): Adapter[] {
        // Map the adapter names to their paths
        const adapterPaths = adapterNames.map((adapterName) =>
            // Resolve the actual adapter path
            this.localFileSystem.resolve(
                process.cwd(),
                'node_modules',
                adapterName,
            ),
        );

        // Check if the directories exists
        this.checkAvailableAdapters(adapterPaths);

        // Load package.json files
        const adapterInformations = this.getAdapterInformations(adapterPaths);

        // Reduce all container bindings from each plugin to a single array
        const containerBindings = adapterInformations.reduce<string[]>(
            (acc, entry) => [...acc, ...entry.containerBindings],
            [],
        );

        // Load the container bindings from the plugins
        this.containerBindingsLoader.loadBindings(containerBindings);

        // Load the adapters
        const loadedAdapters = adapterInformations
            .map((entry) => this.moduleLoader.loadModule(entry.main))
            .map((entry: any) => entry.name)
            .map<Adapter>((entry) => this.container.get(entry));

        // Return the loaded adapters
        return loadedAdapters;
    }

    /**
     * Checks if all given adapter names are existent in the node_modules directory
     *
     * @private
     * @param {string[]} adapterNames The names of the adapters
     * @memberof AdapterLoader
     */
    private checkAvailableAdapters(adapterPaths: string[]) {
        // Check which adapters don't exists on the filesystem
        const unavailableAdapters = adapterPaths.filter(
            (adapterPath) =>
                !this.localFileSystem.checkIfDirectoryExists(adapterPath),
        );

        if (unavailableAdapters.length > 0) {
            throw new Error(
                `The following adapters were not found: ${unavailableAdapters.join(
                    ', ',
                )}`,
            );
        }
    }

    private getAdapterInformations(
        adapterPaths: string[],
    ): IAdapterInformation[] {
        // Resolve the path to the package.json file
        const resolvedPaths = adapterPaths.map((path) =>
            this.localFileSystem.resolve(path, 'package.json'),
        );

        // Check which adapters don't exists on the filesystem
        const unavailableAdapterPackages = resolvedPaths.filter(
            (path) => !this.localFileSystem.checkIfFileExists(path),
        );

        if (unavailableAdapterPackages.length > 0) {
            throw new Error(
                `The following adapters were not found: ${unavailableAdapterPackages.join(
                    ', ',
                )}`,
            );
        }

        return (
            resolvedPaths
                // Map the entries to a single object
                // which contains the file path to the package.json
                // and the read file contents of the package.json file
                .map((path) => ({
                    filePath: path,
                    fileContents: this.localFileSystem.readFile(path),
                }))
                // Parse the read file contents
                .map((packageObj) => ({
                    ...packageObj,
                    fileContents: JSON.parse(
                        packageObj.fileContents,
                    ) as INPMConfig,
                }))
                // Filter out all entries which dont match
                // our defined npm configuration interface
                .filter(({ fileContents: entry }) => isNPMConfig(entry))
                // Map the entries to real adapter informations which
                // can be managed by Packagaya. All file paths will be
                // resolved based on the adapter directory path.
                .map<IAdapterInformation>(
                    ({
                        filePath,
                        fileContents: { name, version, main, config },
                    }) => {
                        const adapterDirectoryPath = dirname(filePath);
                        const mainEntrypoint = this.localFileSystem.resolve(
                            adapterDirectoryPath,
                            main,
                        );
                        const resolvedContainerBindings = (
                            config?.packagaya?.containerBindings ?? []
                        ).map((binding: string) =>
                            this.localFileSystem.resolve(
                                adapterDirectoryPath,
                                binding,
                            ),
                        );

                        return {
                            name,
                            version,
                            adapterDirectoryPath,
                            main: mainEntrypoint,
                            containerBindings: resolvedContainerBindings,
                        };
                    },
                )
        );
    }
}
