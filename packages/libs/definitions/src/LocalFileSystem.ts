import { injectable } from 'inversify';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

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
     */
    public readFile = (filePath: string): string =>
        readFileSync(filePath).toString('utf-8');

    /**
     * Writes a file to the disk with the given file contents
     */
    public writeFile = (filePath: string, fileContents: string) =>
        writeFileSync(filePath, fileContents);

    /**
     * @returns {boolean} True when the file exists. Otherwise false is returned.
     */
    public checkIfFileExists = (filePath: string): boolean =>
        existsSync(filePath);

    /**
     * @returns {string} Returns the resolved path from the given segments.
     *                   This function does not checks if the path is existent or not.
     */
    public resolve = (...pathSegments: string[]): string =>
        resolve(...pathSegments);
}
