import { FeatureFlag, IDifference } from '@packagaya/adapter/dist/FeatureFlag';
import { IConfig } from '@packagaya/config/dist/IConfig';
import { LocalFileSystem } from '@packagaya/definitions/dist/LocalFileSystem';
import { PackageManager } from '@packagaya/package/dist/PackageManager';
import detectIndent from 'detect-indent';
import { Change, diffJson } from 'diff';
import produce from 'immer';
import { inject, injectable } from 'inversify';
import { Logger } from 'tslog';

import { ImportFinder } from '../code/ImportFinder';

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
        @inject(ImportFinder.name) private importFinder: ImportFinder,
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
                [foundPackage.name]: this.importFinder
                    .getImportedPackages(foundPackage)
                    .filter(
                        (entry) =>
                            packages.find((pkg) => pkg.name === entry) !==
                            undefined,
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

                    if (this.hasChanges(computedDifferences)) {
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

    /**
     * Checks if the changes array has any changes which were computed
     *
     * @private
     * @param {Change[]} changes The changes which should be checked
     * @return {boolean} Returns true if there are any changes which should be written to the local file. Otherwise false is returned.
     * @memberof SyncTSPathsFlag
     */
    private hasChanges(changes: Change[]): boolean {
        return changes.reduce<boolean>((acc, entry) => {
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
}
