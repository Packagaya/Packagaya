import { uniqueStrings } from '@packagaya/definitions/dist/helper/stringHelper';
import { LocalFileSystem } from '@packagaya/definitions/dist/LocalFileSystem';
import { IPackage } from '@packagaya/package/dist/IPackage';
import { sync } from 'glob';
import { inject, injectable } from 'inversify';
import { parse } from 'recast';
import { Logger } from 'tslog';

@injectable()
export class ImportFinder {
    /**
     * The cache which should be used between multiple calls
     * from different sources like the SyncTSDeps
     * or the SyncTSPaths feature flags
     *
     * @private
     * @type {Record<string, string[]>}
     * @memberof ImportFinder
     */
    private importedPackagesCache: Record<string, string[]> = {};

    /**
     * Creates an instance of ImportFinder.
     * @param {Logger} logger The logger which should be used to log messages
     * @param {LocalFileSystem} fileSystem The filesystem which should be used to resolve paths
     * @memberof ImportFinder
     */
    constructor(
        @inject(Logger.name) private logger: Logger,
        @inject(LocalFileSystem.name) private fileSystem: LocalFileSystem,
    ) {}

    /**
     * Returns all the imported nodejs packages from the code
     * The source files will be determined by the "sourceDirectories" property
     * Then the source files will be parsed and the import declarations will be extracted from the AST (Abstract Syntax Tree)
     *
     * @param {IPackage} foundPackage The package which should be used to resolve the source files
     * @return {string[]} The imported packages which are defined in the AST of the code
     * @memberof ImportFinder
     */
    public getImportedPackages(foundPackage: IPackage): string[] {
        if (this.importedPackagesCache[foundPackage.name] === undefined) {
            this.importedPackagesCache[
                foundPackage.name
            ] = foundPackage.sourceDirectories
                .reduce<string[]>(
                    (acc, entry) =>
                        acc.concat(...sync(`${entry}/**/*.{ts,tsx}`)),
                    [],
                )
                .reduce<string[]>((acc, filePath) => {
                    this.logger.silly(`Processing file: ${filePath}`);

                    return acc.concat(
                        this.getFileImports(filePath, foundPackage),
                    );
                }, [])
                .reduce<string[]>((acc, entry) => uniqueStrings(acc, entry), [])
                .sort();
        }

        return this.importedPackagesCache[foundPackage.name];
    }

    public getFileImports(
        filePath: string,
        currentPackage: IPackage,
    ): string[] {
        if (!this.fileSystem.checkIfFileExists(filePath)) {
            throw new Error(`The file "${filePath} does not exists"`);
        }

        const fileContents = this.fileSystem.readFile(filePath);

        this.logger.silly(`Trying to parse file: ${filePath}`);

        const importDeclarations = this.getImportsFromFileContents(
            fileContents,
        );

        const mappedImports = importDeclarations
            .map(({ source: { value } }: any) => value)
            .filter((entry: string) => {
                if (!entry.startsWith('.')) {
                    return true;
                }

                const resolvedPath = this.fileSystem.resolve(
                    this.fileSystem.getDirectoryName(filePath),
                    entry,
                );

                return !resolvedPath.startsWith(currentPackage.path);
            })
            .map((entry: string) => {
                // Split the entry to check if the package is scoped
                const parts = entry.split('/');

                if (parts.length === 0) {
                    return '';
                }

                if (!parts[0].startsWith('@')) {
                    return parts.slice(0, 1)[0];
                }

                return parts.slice(0, 2).join('/');
            })
            .filter((entry: string) => entry !== '');

        return mappedImports;
    }

    private getImportsFromFileContents(fileContents: string) {
        const parsedSourceCode = parse(fileContents, {
            parser: require('recast/parsers/typescript'),
        }).program;

        const importDeclarations = parsedSourceCode.body.filter((node: any) => {
            return node.type === 'ImportDeclaration';
        });
        return importDeclarations;
    }
}
