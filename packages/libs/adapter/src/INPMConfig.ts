/**
 * Defines the skeleton of a NPM configuration file
 *
 * @export
 * @interface INPMConfig
 * @see {isNPMConfig} ts-auto-guard:type-guard
 */
export interface INPMConfig {
    /**
     * Name of the npm package
     *
     * @type {string}
     * @memberof INPMConfig
     */
    name: string;

    /**
     * The version of the npm package
     *
     * @type {string}
     * @memberof INPMConfig
     */
    version: string;

    /**
     * The main entry point of the adapter
     *
     * @type {string}
     * @memberof INPMConfig
     */
    main: string;

    /**
     * The package configuration
     *
     * @type {{
     *         packagaya?: {
     *             containerBindings?: string[];
     *         };
     *     }}
     * @memberof INPMConfig
     */
    config?: {
        /**
         * The packagaya sub key
         *
         * @type {{
         *             containerBindings?: string[];
         *         }}
         */
        packagaya?: {
            /**
             * Additional container bindings which should be
             * loaded from packagaya
             *
             * @type {string[]}
             */
            containerBindings?: string[];
        };
    };
}
