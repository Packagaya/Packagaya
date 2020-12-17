/**
 * Defines a basic structure for adapter information
 *
 * @export
 * @interface IAdapterInformation
 */
export interface IAdapterInformation {
    /**
     * The name of the adapter
     * This is also the identifier of the adapter
     * which must be unique across the list
     *
     * @type {string}
     * @memberof IAdapterInformation
     */
    name: string;

    /**
     * The version of the adapter
     *
     * @type {string}
     * @memberof IAdapterInformation
     */
    version: string;

    /**
     * The file system path to the adapter directory
     *
     * @type {string}
     * @memberof IAdapterInformation
     */
    adapterDirectoryPath: string;

    /**
     * The file path to the main entrypoint of the adapter
     *
     * @type {string}
     * @memberof IAdapterInformation
     */
    main: string;

    /**
     * The additional container bindings of the adapters
     *
     * @type {string[]}
     * @memberof IAdapterInformation
     */
    containerBindings: string[];
}
