import { LocalFileSystem } from '@packagaya/definitions/dist/LocalFileSystem';
import { IPackage } from '@packagaya/package/dist/IPackage';
import { PackageResolver } from '@packagaya/package/dist/PackageResolver';
import { PackageType } from '@packagaya/package/src/PackageType';
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

        if (!this.fileSystem.checkIfFileExists(configurationFilePath)) {
            throw new Error(
                `The file ${configurationFilePath} does not exists`,
            );
        }

        const fileContents = this.fileSystem.readFile(configurationFilePath);
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

        return {
            id: packageConfiguration.name,
            name: packageConfiguration.name,
            version: packageConfiguration.version,
            packageType,
            dependencies: packageConfiguration.dependencies ?? {},
            devDependencies: packageConfiguration.devDependencies ?? {},
        };
    }
}
