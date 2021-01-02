import { LocalFileSystem } from '@packagaya/definitions/dist/LocalFileSystem';
import { IPackage } from '@packagaya/package/dist/IPackage';
import { PackageResolver } from '@packagaya/package/dist/PackageResolver';
import { PackageType } from '@packagaya/package/src/PackageType';
import { hasMagic, sync } from 'glob';
import { inject, injectable } from 'inversify';
import { Logger } from 'tslog';

/**
 * Resolves Node.JS packages
 *
 * @export
 * @class NPMPackageResolver
 * @extends {PackageResolver}
 */
@injectable()
export class NPMPackageResolver extends PackageResolver {
    /**
     * Creates an instance of NPMPackageResolver.
     * @param {Logger} logger The logger which should be used for logging messages
     * @param {LocalFileSystem} fileSystem The file system which should be used for resolving paths and reading the configuration files
     * @memberof NPMPackageResolver
     */
    constructor(
        @inject(Logger) private logger: Logger,
        @inject(LocalFileSystem) private fileSystem: LocalFileSystem,
    ) {
        super();
    }

    /**
     * Searches the given path for NodeJS packages
     *
     * @param {string} path The path that should be checked
     * @param {PackageType} packageType The package type that is being resolved
     * @return {Promise<IPackage[]>} The found packages
     * @memberof NPMPackageResolver
     */
    async getPackagesForPath(
        path: string,
        packageType: PackageType,
    ): Promise<IPackage[]> {
        const packagePaths = this.fileSystem
            .getDirectoryContents(path)
            .filter((entry) => this.fileSystem.checkIfDirectoryExists(entry));

        return packagePaths.map((path) => this.getPackage(path, packageType));
    }

    /**
     * Returns the parsed file contents of the package.json file inside the directory
     *
     * @private
     * @param {string} packagePath The package path that should be used to resolve the package.json file
     * @return {*} The parsed package.json file contents
     * @memberof NPMPackageResolver
     */
    private getPackageConfiguration(packagePath: string) {
        const configurationFilePath = this.fileSystem.resolve(
            packagePath,
            'package.json',
        );

        this.logger.silly(
            `Checking the following configuration file path: ${configurationFilePath}`,
        );

        if (!this.fileSystem.checkIfFileExists(configurationFilePath)) {
            throw new Error(
                `The file ${configurationFilePath} does not exists`,
            );
        }

        const fileContents = this.fileSystem.readFile(configurationFilePath);

        this.logger.silly(
            `Reading configuration file: ${configurationFilePath}`,
        );

        return JSON.parse(fileContents);
    }

    /**
     * Returns the package information for the given path
     *
     * @private
     * @param {string} packagePath The path to the NodeJS package
     * @param {PackageType} packageType The package type of the NodeJS package
     * @return {IPackage} The resolved package informations
     * @memberof NPMPackageResolver
     */
    private getPackage(
        packagePath: string,
        packageType: PackageType,
    ): IPackage {
        const packageConfiguration = this.getPackageConfiguration(packagePath);

        this.logger.silly(
            'Resolved the following package configuration',
            packageConfiguration,
        );

        return {
            name: packageConfiguration.name,
            version: packageConfiguration.version,
            packageType,
            path: packagePath,
            sourceDirectories: this.getTypeScriptSourceDirectories(packagePath),
            dependencies: packageConfiguration.dependencies ?? {},
            devDependencies: packageConfiguration.devDependencies ?? {},
        };
    }

    /**
     * Returns an array of strings which points to directories which contain source files
     *
     * @private
     * @param {string} path The base path to the package
     * @return {string[]} The resolved directories
     * @memberof NPMPackageResolver
     */
    private getTypeScriptSourceDirectories(path: string): string[] {
        // Resolve the path to the tsconfig.json file
        const typescriptConfigurationFile = this.fileSystem.resolve(
            path,
            'tsconfig.json',
        );

        // The function result
        let result: string[] = [];

        this.logger.silly(
            `Checking if the TypeScript configuration file exists: ${typescriptConfigurationFile}`,
        );

        // Check if the TypeScript configuration file exists
        if (!this.fileSystem.checkIfFileExists(typescriptConfigurationFile)) {
            // The configuration file does not exists so we return an empty array
            return [];
        }

        const {
            compilerOptions,
            files,
            include: includes,
            exclude: excludes,
        } = JSON.parse(this.fileSystem.readFile(typescriptConfigurationFile));

        // Check if the "rootDir" entry is defined
        if (typeof compilerOptions.rootDir === 'string') {
            this.logger.silly(
                `Adding the rootdir to the found results: ${compilerOptions.rootDir}`,
            );
            result.push(this.fileSystem.resolve(path, compilerOptions.rootDir));
        }

        // Check if the "rootDir" entry is defined
        if (Array.isArray(compilerOptions.rootDirs)) {
            this.logger.silly(
                `Adding the rootdirs to the found results: ${compilerOptions.rootDirs.join(
                    ', ',
                )}`,
            );
            result.push(
                ...compilerOptions.rootDirs.map((directory: string) =>
                    this.fileSystem.resolve(path, directory),
                ),
            );
        }

        // Check if the "files" entry is defined which should be added to the result
        if (Array.isArray(files)) {
            this.logger.debug(
                `Adding the following files to the result: ${files.join(', ')}`,
            );
            result.push(
                ...files.reduce<string[]>(
                    (acc, entry) => acc.concat(this.resolveGlob(entry, path)),
                    [],
                ),
            );
        }

        // Check if there are any includes which should be added to the results
        if (Array.isArray(includes)) {
            this.logger.debug(
                `Adding the following includes to the result: ${includes.join(
                    ', ',
                )}`,
            );
            result.push(
                ...includes.reduce<string[]>(
                    (acc, entry) => acc.concat(this.resolveGlob(entry, path)),
                    [],
                ),
            );
        }

        // Check if there are any excludes defined which should be removed from the results
        if (Array.isArray(excludes)) {
            this.logger.debug(
                `Removing the following excludes from the result: ${excludes.join(
                    ', ',
                )}`,
            );

            result = result.filter(
                (entry) =>
                    excludes.find((excludeEntry) =>
                        entry.includes(excludeEntry),
                    ) === undefined,
            );
        }

        return result;
    }

    /**
     * Resolves the given as "glob" to absolut file paths
     *
     * @private
     * @param {string} glob The glob which should be resolved
     * @param {string} path The path which should be used to resolve the entries
     * @return {string[]} The resolved glob contents
     * @memberof NPMPackageResolver
     */
    private resolveGlob(glob: string, path: string): string[] {
        if (!hasMagic(glob)) {
            return [this.fileSystem.resolve(path, glob)];
        }

        return sync(glob).map((entry) => this.fileSystem.resolve(path, entry));
    }
}
