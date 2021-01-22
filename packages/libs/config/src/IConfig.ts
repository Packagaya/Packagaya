/**
 * Defines the basic configuration of Packagaya
 *
 * @export
 * @interface IConfig
 */
export interface IConfig {
    /**
     * The paths to all application packages
     *
     * @type {string[]}
     * @memberof IConfig
     */
    apps: string[];

    /**
     * The paths to all library packages
     *
     * @type {string[]}
     * @memberof IConfig
     */
    libs: string[];

    /**
     * The adapters which should be used
     *
     * @type {string[]}
     * @memberof IConfig
     */
    adapters: string[];

    /**
     * The activated features of the adapters
     *
     * @type {string[]}
     * @memberof IConfig
     */
    features: (string | [string, Record<string, unknown>])[];
}
