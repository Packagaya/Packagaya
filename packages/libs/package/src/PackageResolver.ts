import { injectable } from 'inversify';

import { IPackage } from './IPackage';
import { PackageType } from './PackageType';

/**
 * The PackageResolver class contains the definitions for a
 * file system based package resolver for each package manager(s)
 * like npm, yarn, composer, mix, etc
 *
 * @export
 * @abstract
 * @class PackageResolver
 */
@injectable()
export abstract class PackageResolver {
    /**
     * Searches the given for packages which are manageable by packagaya
     *
     * @abstract
     * @param {string} path The path which should contain the packages
     * @return {Promise<IPackage[]>} The found packages
     * @memberof PackageResolver
     */
    public abstract getPackagesForPath(
        path: string,
        packageType: PackageType,
    ): Promise<IPackage[]>;
}
