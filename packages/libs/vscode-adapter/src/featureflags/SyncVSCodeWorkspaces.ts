import { FeatureFlag } from '@packagaya/adapter/dist/FeatureFlag';
import { IConfig } from '@packagaya/config/dist/IConfig';
import { LocalFileSystem } from '@packagaya/definitions/dist/LocalFileSystem';
import { PackageManager } from '@packagaya/package/dist/PackageManager';
import detectIndent from 'detect-indent';
import { Change, diffJson } from 'diff';
import { inject } from 'inversify';
import isScoped from 'is-scoped';
import { Logger } from 'tslog';

type WorkspaceEntry = {
    name: string;
    path: string;
};

/**
 * Synchronizes the VSCode workspaces with the managed packages inside the repository
 */
export class SyncVSCodeWorkspacesFeatureFlag extends FeatureFlag {
    private resolvedWorkspaceFile: string = '';

    /**
     * Contains the workspace entries which should be in the workspace configuration file
     */
    private differences: WorkspaceEntry[] = [];

    constructor(
        @inject(Logger.name) private logger: Logger,
        @inject(LocalFileSystem.name) private localFileSystem: LocalFileSystem,
        @inject(PackageManager.name) private packageManager: PackageManager,
    ) {
        super('sync-vscode-workspaces', true);
    }

    /**
     * Calculates the differences between the workspace configuration file and the managed packages
     */
    async getDifferences(
        projectSpecification: IConfig,
        configuration: Record<string, unknown>,
    ) {
        if (projectSpecification === undefined) {
            throw new Error(
                'The VSCode adapter needs to be configured before it can be used',
            );
        }

        const { workspaceFile } = configuration;

        if (typeof workspaceFile !== 'string') {
            throw new Error('The "workspaceFile" needs to be a string');
        }

        this.resolvedWorkspaceFile = this.localFileSystem.resolve(
            workspaceFile,
        );

        if (
            !this.localFileSystem.checkIfFileExists(this.resolvedWorkspaceFile)
        ) {
            throw new Error(
                `The file "${this.resolvedWorkspaceFile}" does not exists`,
            );
        }

        const workspacePackages = await this.packageManager.getManageablePackages(
            projectSpecification,
        );
        const managedPackages = [
            ...workspacePackages.apps,
            ...workspacePackages.libs,
        ];

        const rootPackageConfigurationPath = this.localFileSystem.resolve(
            process.cwd(),
            'package.json',
        );

        if (
            !this.localFileSystem.checkIfFileExists(
                rootPackageConfigurationPath,
            )
        ) {
            throw new Error('Could not find the root "package.json" file');
        }

        const rootPackageConfiguration = JSON.parse(
            this.localFileSystem.readFile(rootPackageConfigurationPath),
        );
        const rootPackageName: string = rootPackageConfiguration.name;
        const rootPackageNamePrefix = isScoped(rootPackageName)
            ? rootPackageName.split('/')[0]
            : '';

        const currentEntries = this.getCurrentEntries(
            JSON.parse(
                this.localFileSystem.readFile(this.resolvedWorkspaceFile),
            ),
        );

        this.differences = managedPackages
            .map((entry) => {
                const resolvedPath = `./${this.localFileSystem.getRelativeTo(
                    process.cwd(),
                    entry.path,
                )}`;

                return {
                    name: entry.name.substr(rootPackageNamePrefix.length + 1),
                    path: resolvedPath,
                };
            })
            .filter((entry) => {
                const resolvedPath = this.localFileSystem.resolve(
                    process.cwd(),
                    entry.path,
                );

                return (
                    currentEntries.find((knownEntry) => {
                        return (
                            resolvedPath ===
                            this.localFileSystem.resolve(knownEntry.path)
                        );
                    }) === undefined
                );
            });

        const computedDifferences = diffJson(currentEntries, [
            ...currentEntries,
            ...this.differences,
        ]);

        if (!this.hasChanges(computedDifferences)) {
            return [];
        }

        return [
            {
                filePath: this.resolvedWorkspaceFile,
                changes: computedDifferences,
            },
        ];
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
     * Fixes the differences between the workspace configuration file and the managed packages
     */
    async fixDifferences(
        projectSpecification: IConfig,
        configuration: Record<string, unknown>,
    ) {
        const workspaceConfigurationFile = JSON.parse(
            this.localFileSystem.readFile(this.resolvedWorkspaceFile),
        );
        const workspaceConfigurationFileContents = this.localFileSystem.readFile(
            this.resolvedWorkspaceFile,
        );
        const currentEntries = this.getCurrentEntries(
            JSON.parse(workspaceConfigurationFileContents),
        );
        const newEntries = currentEntries.concat(...this.differences);

        this.localFileSystem.writeFile(
            this.resolvedWorkspaceFile,
            JSON.stringify(
                {
                    ...workspaceConfigurationFile,
                    folders: newEntries,
                },
                undefined,
                detectIndent(workspaceConfigurationFileContents).amount,
            ),
        );

        return true;
    }

    private getCurrentEntries(
        configurationFile: Record<string, unknown>,
    ): WorkspaceEntry[] {
        const existingEntries = configurationFile.folders;

        if (!Array.isArray(existingEntries)) {
            return [];
        }

        return existingEntries;
    }
}
