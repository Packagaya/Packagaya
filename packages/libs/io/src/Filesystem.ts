/**
 * Defines the abstract structure of a filesystem
 *
 * @export
 * @abstract
 * @class IFilesystem
 */
export abstract class Filesystem {
    /**
     * Creates a file at the given path
     *
     * @abstract
     * @param {string} fileName The path to the file which should be created
     * @returns {Promise<boolean>} Returns true when the file was successfully created. Otherwise false is returned.
     * @memberof IFilesystem
     */
    public abstract async createFile(fileName: string): Promise<boolean>;

    /**
     * Creates a directory at the given path
     *
     * @abstract
     * @param {string} path The path to the directory
     * @param {boolean} createParents The missing parent directories will be created when this is set to true.
     * @returns {Promise<boolean>} Returns true when the directory was successfully created.
     * @memberof IFilesystem
     */
    public abstract async createDirectory(
        path: string,
        createParents: boolean,
    ): Promise<boolean>;

    /**
     * Returns the read contents of the file at the given path
     *
     * @abstract
     * @template T
     * @param {string} path The path to the file which should be read
     * @returns {Promise<T>} The read file contents
     * @memberof IFilesystem
     */
    public abstract async readFile<T>(path: string): Promise<T>;

    /**
     * Writes the given contents to the file which is located at the given path
     *
     * @abstract
     * @param {string} path The path to the file which should be overwritten
     * @param {unknown} contents The contents which should be written into the file
     * @returns {Promise<void>}
     * @memberof IFilesystem
     */
    public abstract async writeFile(
        path: string,
        contents: unknown,
    ): Promise<void>;

    /**
     * Removes the file from the filesystem
     *
     * @abstract
     * @param {string} path The path to the file which should be removed
     * @returns {Promise<void>}
     * @memberof IFilesystem
     */
    public abstract async removeFile(path: string): Promise<void>;
}
