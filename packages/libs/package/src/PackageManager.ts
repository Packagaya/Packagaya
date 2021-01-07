import { IConfig } from '@packagaya/config/dist/IConfig';
import { injectable, multiInject } from 'inversify';

import { IPackage } from './IPackage';
import { PackageResolver } from './PackageResolver';
import { PackageType } from './PackageType';

/**
 * The abstract definition of a package manager
 *
 * @export
 * @abstract
 * @class PackageManager
 */
@injectable()
export class PackageManager {
    /**
     * Creates an instance of PackageManager.
     * @param {PackageResolver[]} packageResolvers The package resolvers that resolve manageable packages
     * @memberof PackageManager
     */
    constructor(
        @multiInject(PackageResolver)
        private packageResolvers: PackageResolver[],
    ) {}

    /**
     * Returns all packages split into their package type
     * which are manageable by packagaya
     *
     * @param {IConfig} projectSpecification The project configuration
     * @return {Promise<{
     *         apps: IPackage[];
     *         libs: IPackage[];
     *     }>} The read packages
     * @memberof PackageManager
     */
    public async getManageablePackages(
        projectSpecification: IConfig,
    ): Promise<{
        apps: IPackage[];
        libs: IPackage[];
    }> {
        return {
            apps: await this.getPackagesForPaths(
                projectSpecification.apps,
                PackageType.Application,
            ),
            libs: await this.getPackagesForPaths(
                projectSpecification.libs,
                PackageType.Library,
            ),
        };
    }

    /**
     * Returns all packages for the given filesystems
     *
     * @private
     * @param {string[]} paths The paths that should be resolved
     * @param {PackageType} packageType The package type that is being resolved
     * @return {Promise<IPackage[]>} The found packages
     * @memberof PackageManager
     */
    private async getPackagesForPaths(
        paths: string[],
        packageType: PackageType,
    ): Promise<IPackage[]> {
        const foundPackages = [];

        for (const path of paths) {
            foundPackages.push(
                ...(await this.getPackagesForPath(path, packageType)),
            );
        }

        return foundPackages;
    }

    /**
     * Returns all packages for the given path
     *
     * @private
     * @param {string} path The path that should be used to resolve the packages
     * @param {PackageType} packageType The package type that is being resolved
     * @return {Promise<IPackage[]>} The found packages
     * @memberof PackageManager
     */
    private async getPackagesForPath(
        path: string,
        packageType: PackageType,
    ): Promise<IPackage[]> {
        const foundPackages = [];

        for (const packageResolver of this.packageResolvers) {
            foundPackages.push(
                ...(await packageResolver.getPackagesForPath(
                    path,
                    packageType,
                )),
            );
        }

        return foundPackages;
    }
}
