import { FeatureFlag, IDifference } from '@packagaya/adapter/dist/FeatureFlag';
import { IConfig } from '@packagaya/config/dist/IConfig';
import { LocalFileSystem } from '@packagaya/definitions/dist/LocalFileSystem';
import { IPackage } from '@packagaya/package/dist/IPackage';
import { PackageManager } from '@packagaya/package/dist/PackageManager';
import detectIndent from 'detect-indent';
import { Change, diffJson } from 'diff';
import { sync } from 'glob';
import produce from 'immer';
import { inject, injectable } from 'inversify';
import { parse } from 'recast/parsers/typescript';
import { Logger } from 'tslog';

/**
 * Defines the "sync-ts-paths" feature flag
 *
 * @export
 * @class SyncTSPathsFlag
 * @extends {FeatureFlag}
 */
@injectable()
export class SyncTSPathsFlag extends FeatureFlag {
    private differences: {
        filePath: string;
        contents: string;
    }[] = [];

    /**
     * Creates an instance of SyncTSPathsFlag.
     * @param {Logger} logger The logger which should be used to log messages
     * @param {PackageManager} packageManager The package manager which should be used for resolving the monorepo packages
     * @memberof SyncTSPathsFlag
     */
    constructor(
        @inject(Logger.name) private logger: Logger,
        @inject(PackageManager.name) private packageManager: PackageManager,
        @inject(LocalFileSystem.name) private fileSystem: LocalFileSystem,
    ) {
        super('sync-ts-paths', true);
    }

    /**
     * @inheritdoc
     * @memberof SyncTSPathsFlag
     */
    public async getDifferences(
        projectSpecification: IConfig,
    ): Promise<IDifference[]> {
        this.logger.info('Checking for TS paths differences');

        this.logger.debug('Fetching packages from the repository');

        const packages = await this.packageManager.getManageablePackages(
            projectSpecification,
        );
        const allPackages = [...packages.apps, ...packages.libs];

        this.logger.info('Analyzing the source code files');
        const packageImports = allPackages.reduce<Record<string, string[]>>(
            (acc, foundPackage, _, packages) => ({
                ...acc,
                [foundPackage.name]: this.getImportedPackages(
                    foundPackage,
                    packages,
                ),
            }),
            {},
        );
        this.logger.debug('Analyzed the source code files');

        this.logger.info(
            'Analyzing the differences between the code and the tsconfig.json files',
        );

        return (
            allPackages
                // Filter out all packages which dont have any entries in the package imports
                .filter((entry) =>
                    Object.keys(packageImports).includes(entry.name),
                )
                .map<IDifference | undefined>((foundPackage) => {
                    const imports = packageImports[foundPackage.name];
                    const typeScriptConfigurationFile = this.fileSystem.resolve(
                        foundPackage.path,
                        'tsconfig.json',
                    );
                    const configFileContents = this.fileSystem.readFile(
                        typeScriptConfigurationFile,
                    );
                    const parsedConfig = JSON.parse(configFileContents);
                    const mappedPackages = imports.map((entry) =>
                        allPackages.find((pkg) => pkg.name === entry),
                    );

                    const expectedContents = produce(
                        parsedConfig,
                        (draft: any) => {
                            draft.compilerOptions.paths = mappedPackages.reduce(
                                (acc, entry) => ({
                                    ...acc,
                                    [`${entry!.name}/*`]: [
                                        `${this.fileSystem.getRelativeTo(
                                            foundPackage.path,
                                            entry!.path,
                                        )}/*`,
                                    ],
                                }),
                                {},
                            );

                            draft.references = mappedPackages.map((entry) => ({
                                path: this.fileSystem.getRelativeTo(
                                    foundPackage.path,
                                    this.fileSystem.resolve(
                                        entry!.path,
                                        'tsconfig.json',
                                    ),
                                ),
                            }));
                        },
                    );

                    const computedDifferences = diffJson(
                        parsedConfig,
                        expectedContents,
                    );

                    const hasChanges = this.hasChanges(computedDifferences);

                    if (hasChanges) {
                        this.differences.push({
                            filePath: typeScriptConfigurationFile,
                            contents: JSON.stringify(
                                expectedContents,
                                undefined,
                                detectIndent(configFileContents).indent,
                            ),
                        });

                        return {
                            filePath: typeScriptConfigurationFile,
                            changes: computedDifferences,
                        } as IDifference;
                    }

                    return undefined;
                })
                .filter((entry) => entry !== undefined) as IDifference[]
        );
    }

    private hasChanges(changes: Change[]) {
        return changes.reduce((acc, entry) => {
            if (acc === true) {
                return acc;
            }

            if (entry.added === true) {
                return true;
            }

            if (entry.removed === true) {
                return true;
            }

            return false;
        }, false);
    }

    /**
     * @inheritdoc
     * @memberof SyncTSPathsFlag
     */
    public async fixDifferences(
        projectSpecification: IConfig,
    ): Promise<boolean> {
        for (const difference of this.differences) {
            this.logger.info(`Fixing file: ${difference.filePath}`);
            this.fileSystem.writeFile(
                difference.filePath,
                `${difference.contents}\n`,
            );
        }

        return true;
    }

    private getImportedPackages(
        foundPackage: IPackage,
        packages: IPackage[],
    ): string[] {
        return foundPackage.sourceDirectories
            .reduce<string[]>(
                (acc, entry) => acc.concat(...sync(`${entry}/**/*.{ts,tsx}`)),
                [],
            )
            .reduce<string[]>(
                (acc, filePath) =>
                    acc.concat(this.getFileImports(filePath, foundPackage)),
                [],
            )
            .reduce<string[]>(
                (acc, entry) => (acc.includes(entry) ? acc : acc.concat(entry)),
                [],
            )
            .filter(
                (entry) =>
                    packages.find((pkg) => pkg.name === entry) !== undefined,
            )
            .sort();
    }

    private getFileImports(filePath: string, foundPackage: IPackage): string[] {
        if (!this.fileSystem.checkIfFileExists(filePath)) {
            throw new Error(`The file "${filePath} does not exists"`);
        }

        const fileContents = this.fileSystem.readFile(filePath);
        const parsedSourceCode = parse(fileContents).program;

        const importDeclarations = parsedSourceCode.body.filter(
            (node) => node.type === 'ImportDeclaration',
        );
        const mappedImports = importDeclarations
            .map<string>(({ source: { value } }: any) => value)
            .filter((entry) => {
                if (!entry.startsWith('.')) {
                    return true;
                }

                const resolvedPath = this.fileSystem.resolve(
                    this.fileSystem.getDirectoryName(filePath),
                    entry,
                );

                return !resolvedPath.startsWith(foundPackage.path);
            })
            .map((entry) => {
                const parts = entry.split('/');

                if (parts.length === 0) {
                    return '';
                }

                if (!parts[0].startsWith('@')) {
                    return parts.slice(0, 1)[0];
                }

                return parts.slice(0, 2).join('/');
            })
            .filter((entry) => entry !== '');

        return mappedImports;
    }
}
