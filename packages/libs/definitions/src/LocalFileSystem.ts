import {
    existsSync,
    readdirSync,
    readFileSync,
    Stats,
    statSync,
    writeFileSync,
} from 'fs';
import { injectable } from 'inversify';
import { basename, extname, resolve } from 'path';

/**
 * The LocalFileSystem class offers the possibillity to perform
 * common tasks against the local file system
 */
@injectable()
export class LocalFileSystem {
    /**
     * Reads the contents of the file at the specified path
     *
     * @returns {string} The contents of the read file
     * @public
     */
    public readFile = (filePath: string): string =>
        readFileSync(filePath).toString('utf-8');

    /**
     * Writes a file to the disk with the given file contents
     *
     * @public
     */
    public writeFile = (filePath: string, fileContents: string) =>
        writeFileSync(filePath, fileContents);

    /**
     * Checks if the given path is a file
     *
     * @returns {boolean} True when the file exists. Otherwise false is returned.
     * @public
     */
    public checkIfFileExists = (filePath: string): boolean =>
        existsSync(filePath);

    /**
     * @returns {string} Returns the resolved path from the given segments.
     *                   This function does not checks if the path is existent or not.
     * @public
     */
    public resolve = (...pathSegments: string[]): string =>
        resolve(...pathSegments);

    /**
     * Checks if the given path is a directory
     *
     * @returns {boolean} True when the given path is a directory. Otherwise false is returned.
     * @public
     */
    public checkIfDirectoryExists(path: string): boolean {
        let stats: Stats;

        try {
            // Get the file system stats
            stats = statSync(path);
        } catch (error) {
            // When the exception says that the directory does not exists
            if (error.code === 'ENOENT') {
                // Return false because the directory does not exists
                return false;
            }

            // Rethrow the error when we dont know it
            throw error;
        }

        // Return if the directory actually exists
        return stats.isDirectory();
    }

    /**
     * Returns the base name of a file
     * With the "withExtension" parameter you can control
     * if the extension should be stribbed off
     *
     * @param {string} path The path which should be transformed
     * @param {boolean} [withExtension=true] When set to true (default) the extension will be
     *                                       stripped off! Set it to false if you want the full filename
     * @return {string} The base name of the given path with or without the extension
     * @memberof LocalFileSystem
     */
    public basename(path: string, withExtension: boolean = true): string {
        return basename(
            path,
            withExtension ? undefined : extname(basename(path)),
        );
    }

    /**
     * Returns the directory contents of the given path
     *
     * @param {string} path The path to the directory
     * @throws When the path is not a directory
     * @memberof LocalFileSystem
     */
    public getDirectoryContents(path: string) {
        if (!this.checkIfDirectoryExists(path)) {
            throw new Error(`Path "${path}" is not a directory`);
        }

        const result: string[] = [];

        const directoryEntries = readdirSync(path, {
            encoding: 'utf-8',
        });

        for (const entry of directoryEntries) {
            result.push(this.resolve(path, entry));
        }

        return result;
    }
}
