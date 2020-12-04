import { IPackage } from './IPackage';

/**
 * The abstract definition of a package manager
 *
 * @export
 * @abstract
 * @class PackageManager
 */
export abstract class PackageManager {
    /**
     * Returns all found packages which are located at the given path
     *
     * @abstract
     * @param {string} path The path where the packages should be located
     * @returns {Promise<IPackage[]>} The found packages
     * @memberof PackageManager
     */
    abstract async getPackagesForPath(path: string): Promise<IPackage[]>;
}
