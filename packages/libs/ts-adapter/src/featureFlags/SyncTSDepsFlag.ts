import { FeatureFlag, IDifference } from '@packagaya/adapter/dist/FeatureFlag';
import { IConfig } from '@packagaya/config/dist/IConfig';
import { LocalFileSystem } from '@packagaya/definitions/dist/LocalFileSystem';
import { DependencyType } from '@packagaya/package/dist/DependencyType';
import { IPackage } from '@packagaya/package/dist/IPackage';
import { PackageManager } from '@packagaya/package/dist/PackageManager';
import chalk from 'chalk';
import { Change } from 'diff';
import produce from 'immer';
import inquirer, { prompt, Question } from 'inquirer';
import { inject, injectable } from 'inversify';
import { builtinModules } from 'module';
import { Logger } from 'tslog';

import { ImportFinder } from '../code/ImportFinder';
import { DependencySorter } from '../DependencySorter';
import { VersionsResolver } from '../version/VersionsResolver';

interface IDiffContents {
    configurationFile: Record<string, string | Record<string, string>>;
    foundImports: string[];
    missingPackages: {
        internal: string[];
        external: string[];
    };
    removedPackages: string[];
}

interface IVersionInformation {
    dependencyType: DependencyType;
    selectedVersion: string;
}

@injectable()
export class SyncTSDepsFlag extends FeatureFlag {
    private externalDependenciesCache: Record<string, boolean> = {};
    private typesPrefix = '@types/';

    private blacklist: string[] = [
        '@types/node',
        'typescript',
        ...builtinModules,
    ];

    private differences: {
        filePath: string;
        contents: IDiffContents;
    }[] = [];

    /**
     * Creates an instance of SyncTSDepsFlag.
     * @param {Logger} logger The logger which should be used to log messages
     * @param {PackageManager} packageManager The package manager which should be used for resolving the monorepo packages
     * @memberof SyncTSDepsFlag
     */
    constructor(
        @inject(Logger.name) private logger: Logger,
        @inject(PackageManager.name) private packageManager: PackageManager,
        @inject(LocalFileSystem.name) private fileSystem: LocalFileSystem,
        @inject(ImportFinder.name) private importFinder: ImportFinder,
        @inject(VersionsResolver.name)
        private versionsResolver: VersionsResolver,
        @inject(DependencySorter.name)
        private dependencySorter: DependencySorter,
    ) {
        super('sync-ts-deps', true);

        inquirer.registerPrompt(
            'autocomplete',
            require('inquirer-autocomplete-prompt'),
        );
    }

    /**
     * @inheritdoc
     * @memberof SyncTSDepsFlag
     */
    public async getDifferences(
        projectSpecification: IConfig,
        configuration?: Record<string, unknown>,
    ): Promise<IDifference[]> {
        this.blacklist = this.blacklist.concat(
            Array.isArray(configuration?.blacklist)
                ? configuration?.blacklist ?? []
                : [],
        );

        this.logger.info('Checking for dependency differences');

        this.logger.debug('Fetching packages from the repository');

        const packages = await this.packageManager.getManageablePackages(
            projectSpecification,
        );
        const allPackages = [...packages.apps, ...packages.libs];

        this.logger.info('Analyzing the source code files');
        const packageImports = allPackages.reduce<Record<string, string[]>>(
            (acc, foundPackage) => ({
                ...acc,
                [foundPackage.name]: this.importFinder.getImportedPackages(
                    foundPackage,
                ),
            }),
            {},
        );

        this.logger.info('Analyzed the source code files');

        this.logger.info(
            'Computing the differences between the code and the tsconfig.json files',
        );

        this.logger.silly(`Current blacklist: ${this.blacklist.join(', ')}`);

        return (
            allPackages
                // Filter out all packages which dont have any entries in the package imports
                .filter((entry) =>
                    Object.keys(packageImports).includes(entry.name),
                )
                .map<IDifference | undefined>((foundPackage) => {
                    const imports = packageImports[foundPackage.name];
                    const packageConfigurationFile = this.fileSystem.resolve(
                        foundPackage.path,
                        'package.json',
                    );
                    const configFileContents = this.fileSystem.readFile(
                        packageConfigurationFile,
                    );
                    const parsedConfig = JSON.parse(configFileContents);

                    let missingImports = imports
                        .reduce<string[]>((acc, entry) => {
                            return acc.includes(entry)
                                ? acc
                                : acc.concat(entry);
                        }, [])
                        .filter((entry) => !this.blacklist.includes(entry))
                        .filter(
                            (entry) =>
                                !this.isDependencyIncluded(parsedConfig, entry),
                        );

                    if (missingImports.length === 0) {
                        return undefined;
                    }

                    const dependencies = missingImports.reduce<{
                        internal: string[];
                        external: string[];
                    }>(
                        (acc, entry: string) => {
                            this.logger.debug(
                                `${chalk.blueBright`[${foundPackage.name}]`} Checking if ${entry} is an external dependency`,
                            );

                            // Check if the current entry is a package which is managed by Packagaya
                            if (this.isExternalDependency(entry, allPackages)) {
                                this.logger.debug(
                                    `${chalk.blueBright`[${foundPackage.name}]`} ${chalk.cyan`${entry} is a external dependency`}`,
                                );

                                return {
                                    ...acc,
                                    external: acc.external.concat(entry),
                                };
                            }

                            this.logger.debug(
                                `${chalk.blueBright`[${foundPackage.name}]`} ${chalk.cyan`${entry} is a internal dependency`}`,
                            );

                            return {
                                ...acc,
                                internal: acc.internal.concat(entry),
                            };
                        },
                        { internal: [], external: [] },
                    );

                    const dependencyNames = this.getDependencyNames(
                        parsedConfig,
                    );

                    const removedPackages = dependencyNames
                        .filter(
                            (entry: string) => !this.blacklist.includes(entry),
                        )
                        .filter((entry: string) => !imports.includes(entry))
                        .reduce<string[]>((acc, entry, _, array) => {
                            if (
                                !array.includes(`${this.typesPrefix}${entry}`)
                            ) {
                                return acc;
                            }

                            return acc.concat(`${this.typesPrefix}${entry}`);
                        }, []);

                    this.differences.push({
                        filePath: packageConfigurationFile,
                        contents: {
                            configurationFile: parsedConfig,
                            foundImports: imports,
                            missingPackages: dependencies,
                            removedPackages: removedPackages,
                        },
                    });

                    const changes: Change[] = [];
                    const missingDependencies = [
                        ...dependencies.internal,
                        ...dependencies.external,
                    ];

                    if (missingDependencies.length > 0) {
                        changes.push({
                            value: 'The following dependencies are missing:\n',
                        });

                        changes.push(
                            ...missingDependencies
                                .filter(
                                    (entry) => !this.blacklist.includes(entry),
                                )
                                .sort()
                                .map((dependencyName, index) => ({
                                    value: `- ${dependencyName}${
                                        index < missingDependencies.length - 1
                                            ? '\n'
                                            : ''
                                    }`,
                                    added: true,
                                })),
                        );
                    }

                    if (removedPackages.length > 0) {
                        changes.push({
                            value:
                                'The following dependencies are not used anymore:\n',
                        });

                        changes.push(
                            ...removedPackages
                                .filter(
                                    (entry) => !this.blacklist.includes(entry),
                                )
                                .sort()
                                .map((dependencyName, index) => ({
                                    value: `- ${dependencyName}${
                                        index < removedPackages.length - 1
                                            ? '\n'
                                            : ''
                                    }`,
                                    removed: true,
                                })),
                        );
                    }

                    return {
                        filePath: packageConfigurationFile,
                        changes,
                    };
                })
                .filter((entry) => entry !== undefined) as IDifference[]
        );
    }

    /**
     * @inheritdoc
     * @memberof SyncTSDepsFlag
     */
    public async fixDifferences(
        projectSpecification: IConfig,
        configuration: Record<string, unknown> = {},
    ): Promise<boolean> {
        const installAlwaysLatestVersion =
            Boolean(configuration.installAlwaysLatestVersion) ?? false;

        const npmRegistry = String(
            configuration?.npmRegistryUrl ?? 'https://registry.npmjs.org/',
        );

        const managedPackages = await this.packageManager.getManageablePackages(
            projectSpecification,
        );

        for (const difference of this.differences) {
            const {
                removedPackages,
                missingPackages,
                configurationFile,
            } = difference.contents;
            let newConfiguration: any = configurationFile;
            const { name } = configurationFile;

            this.logger.info(`Fixing dependencies for package: ${name}`);

            for (const removedPackageName of removedPackages) {
                newConfiguration = produce(newConfiguration, (draft: any) => {
                    if (typeof draft.dependencies === 'object') {
                        delete draft.dependencies[removedPackageName];
                    }

                    if (typeof draft.devDependencies === 'object') {
                        delete draft.devDependencies[removedPackageName];
                    }
                    if (typeof draft.optionalDependencies === 'object') {
                        delete draft.optionalDependencies[removedPackageName];
                    }
                    if (typeof draft.peerDependencies === 'object') {
                        delete draft.peerDependencies[removedPackageName];
                    }
                });
            }

            for (const internalPackage of missingPackages.internal) {
                this.logger.silly(
                    `Adding internal package ${internalPackage} to ${configurationFile.name}`,
                );

                const answers = await prompt(
                    await this.getVersionQuestions(
                        internalPackage,
                        npmRegistry,
                        true,
                        installAlwaysLatestVersion,
                    ),
                );

                newConfiguration = produce(newConfiguration, (draft: any) => {
                    switch (answers.dependencyType) {
                        case DependencyType.Dependency:
                            if (draft.dependencies === undefined) {
                                draft.dependencies = {
                                    [internalPackage]: '*',
                                };
                            } else {
                                draft.dependencies[internalPackage] = '*';
                            }
                            break;
                        case DependencyType.DevelopmentDependency:
                            if (draft.devDependencies === undefined) {
                                draft.devDependencies = {
                                    [internalPackage]: '*',
                                };
                            } else {
                                draft.devDependencies[internalPackage] = '*';
                            }
                            break;
                        case DependencyType.OptionalDependency:
                            if (draft.optionalDependencies === undefined) {
                                draft.optionalDependencies = {
                                    [internalPackage]: '*',
                                };
                            } else {
                                draft.optionalDependencies[internalPackage] =
                                    '*';
                            }
                            break;
                        case DependencyType.PeerDependency:
                            if (draft.peerDependencies === undefined) {
                                draft.peerDependencies = {
                                    [internalPackage]: '*',
                                };
                            } else {
                                draft.peerDependencies[internalPackage] = '*';
                            }
                            break;
                    }
                });
            }

            for (const externalPackage of missingPackages.external) {
                const answers = await prompt(
                    await this.getVersionQuestions(
                        externalPackage,
                        npmRegistry,
                        false,
                        installAlwaysLatestVersion,
                    ),
                );

                const version: string | undefined =
                    answers.selectedVersion !== undefined
                        ? answers.selectedVersion
                        : await this.versionsResolver.getLatestVersion(
                              externalPackage,
                              npmRegistry,
                          );

                if (version === undefined) {
                    this.logger.error(
                        `Could not find the latest version for packge: ${externalPackage}`,
                    );
                    continue;
                }

                newConfiguration = produce(newConfiguration, (draft: any) => {
                    switch (answers.dependencyType) {
                        case DependencyType.Dependency:
                            if (draft.dependencies === undefined) {
                                draft.dependencies = {
                                    [externalPackage]: `^${version}`,
                                };
                            } else {
                                draft.dependencies[
                                    externalPackage
                                ] = `^${version}`;
                            }
                            break;
                        case DependencyType.DevelopmentDependency:
                            if (draft.devDependencies === undefined) {
                                draft.devDependencies = {
                                    [externalPackage]: `^${version}`,
                                };
                            } else {
                                draft.devDependencies[
                                    externalPackage
                                ] = `^${version}`;
                            }
                            break;
                        case DependencyType.OptionalDependency:
                            if (draft.optionalDependencies === undefined) {
                                draft.optionalDependencies = {
                                    [externalPackage]: `^${version}`,
                                };
                            } else {
                                draft.optionalDependencies[
                                    externalPackage
                                ] = `^${version}`;
                            }
                            break;
                        case DependencyType.PeerDependency:
                            if (draft.peerDependencies === undefined) {
                                draft.peerDependencies = {
                                    [externalPackage]: `^${version}`,
                                };
                            } else {
                                draft.peerDependencies[
                                    externalPackage
                                ] = `^${version}`;
                            }
                            break;
                    }
                });
            }

            this.fileSystem.writeFile(
                difference.filePath,
                JSON.stringify(
                    this.dependencySorter.processNPMConfiguration({
                        ...newConfiguration,
                    }),
                    undefined,
                    4,
                ) + '\n',
            );
        }

        return true;
    }

    private async getVersionQuestions(
        packageName: string,
        npmRegistry: string,
        isInternalPackage: boolean = false,
        installAlwaysLatestVersion: boolean = false,
    ): Promise<Question<IVersionInformation>[]> {
        const result: Question<IVersionInformation>[] = [
            {
                type: 'list',
                name: 'dependencyType',
                message: `'What is the dependency type of "${packageName}"?'`,
                choices: [
                    {
                        name: DependencyType.Dependency,
                        value: DependencyType.Dependency,
                    },
                    {
                        name: DependencyType.DevelopmentDependency,
                        value: DependencyType.DevelopmentDependency,
                    },
                    {
                        name: DependencyType.OptionalDependency,
                        value: DependencyType.OptionalDependency,
                    },
                    {
                        name: DependencyType.PeerDependency,
                        value: DependencyType.PeerDependency,
                    },
                ],
            } as Question,
        ];

        if (!isInternalPackage && !installAlwaysLatestVersion) {
            const packageVersions = await this.versionsResolver.resolveVersionsForPackage(
                packageName,
                npmRegistry,
            );

            result.push({
                name: 'selectedVersion',
                type: 'list',
                message: 'Which version should be installed?',
                choices: Object.keys(packageVersions).reduce<
                    {
                        name: string;
                        value: string;
                    }[]
                >(
                    (acc, entry) => [
                        ...acc,
                        {
                            name:
                                entry === 'latest'
                                    ? `latest (${packageVersions[entry]})`
                                    : entry,
                            value: packageVersions[entry],
                        },
                    ],
                    [],
                ),
            } as Question<IVersionInformation>);
        }

        return result;
    }

    private isTypingsRequired(
        dependencyName: string,
        allDependencies: string[],
    ): boolean {
        if (!dependencyName.startsWith(this.typesPrefix)) {
            this.logger.silly(
                `Dependency "${dependencyName} does not starts with "${this.typesPrefix}"`,
            );

            return false;
        }

        const baseName = dependencyName.substr(this.typesPrefix.length);

        return allDependencies.includes(baseName);
    }

    /**
     * Checks if the given dependency is included in the project dependencies
     *
     * @private
     * @param {Record<string, Record<string, string>>} configurationFile The read and parsed package.json file
     * @param {string} dependencyName The name of the dependency which should be found
     * @return {boolean} Returns true when the given dependency is included in the project dependencies
     * @memberof SyncTSDepsFlag
     */
    private isDependencyIncluded(
        configurationFile: Record<string, Record<string, string>>,
        dependencyName: string,
    ): boolean {
        return this.getDependencyNames(configurationFile).includes(
            dependencyName,
        );
    }

    /**
     * Checks if the given dependency is in the managed packages
     *
     * @private
     * @param {string} dependencyName The name of the dependency which should be resolved
     * @param {IPackage[]} packages The managed packages
     * @return {boolean} Returns false when the dependency was found in the managed packages.
     *                   Returns true when the depdendency was not found in the managed packages.
     * @memberof SyncTSDepsFlag
     */
    private isExternalDependency(
        dependencyName: string,
        packages: IPackage[],
    ): boolean {
        if (this.externalDependenciesCache[dependencyName] === undefined) {
            this.externalDependenciesCache[dependencyName] = !packages
                .map((foundPackage) => foundPackage.name)
                .includes(dependencyName);
        }

        return this.externalDependenciesCache[dependencyName];
    }

    private getDependencyNames(
        packageConfigurationFile: Record<string, Record<string, string>>,
    ) {
        const dependencies = packageConfigurationFile.dependencies ?? {};
        const devDependencies = packageConfigurationFile.devDependencies ?? {};
        const optionalDependencies =
            packageConfigurationFile.optionalDependencies ?? {};
        const peerDependencies =
            packageConfigurationFile.peerDependencies ?? {};

        return [
            dependencies,
            devDependencies,
            optionalDependencies,
            peerDependencies,
        ]
            .map((dependencyEntries) => Object.keys(dependencyEntries))
            .reduce((acc, entry) => {
                return [...acc, ...entry];
            }, [])
            .filter((entry, index, array) => array.indexOf(entry) === index)
            .sort();
    }
}
