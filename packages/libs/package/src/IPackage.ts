import { PackageType } from './PackageType';

/**
 * Dependencies should not link to other dependencies
 */
export type IDependency = Omit<IPackage, 'dependencies' | 'devDependencies'>;

/**
 * Defines the basic structure of a managable package
 *
 * @export
 * @interface IPackage
 */
export interface IPackage {
    /**
     * The unique id of the package.
     * This can also be provided by the package configuration file.
     *
     * @type {string}
     * @memberof IPackage
     */
    id: string;

    /**
     * The name of the package.
     * This can also be provided by the package configuration file.
     *
     * @type {string}
     * @memberof IPackage
     */
    name?: string;

    /**
     * The version of the package.
     * This can also be provided by the package configuration file.
     *
     * @type {string}
     * @memberof IPackage
     */
    version?: string;

    /**
     * The type of the package
     *
     * @type {PackageType}
     * @memberof IPackage
     */
    packageType: PackageType;

    /**7
     * The dependencies of the package.
     *
     * @type {IPackage[]}
     * @memberof IPackage
     */
    dependencies: IDependency[];

    /**
     * The development dependencies of the package.
     *
     * @type {IPackage[]}
     * @memberof IPackage
     */
    devDependencies: IDependency[];
}
