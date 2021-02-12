import axios from 'axios';
import { inject, injectable } from 'inversify';
import { builtinModules } from 'module';
import { gt, lt } from 'semver';
import { Logger } from 'tslog';

/**
 * Resolves all available versions for a specific NPM package
 *
 * @export
 * @class VersionsResolver
 */
@injectable()
export class VersionsResolver {
    /**
     * The prefix for "DefinetlyTyped" packages
     *
     * @private
     * @memberof VersionsResolver
     */
    private typesPrefix = '@types/';

    /**
     * Contains all packages which could not be found in the registry
     *
     * @private
     * @type {string[]}
     * @memberof VersionsResolver
     */
    private invalidPackages: string[] = [];

    private versionsCache: Record<string, Record<string, string>>;

    /**
     *  Creates an instance of VersionsResolver.
     * @param {Logger} logger The logger which should be used for logging messages
     * @memberof VersionsResolver
     */
    constructor(@inject(Logger.name) private logger: Logger) {
        this.versionsCache = {};
    }

    public async getVersions(
        packageName: string,
        npmRegistry: string,
    ): Promise<Record<string, string>> {
        const npmRegistryUrl = npmRegistry.endsWith('/')
            ? npmRegistry
            : `${npmRegistry}/`;
        const typePackageName = this.getTypesPrefixedPackageName(packageName);

        // Fetches the package informations from the official NPM registry
        const response = await axios.get(`${npmRegistryUrl}${packageName}`, {
            // Do not throw an error when the response code is not between 200 and 299
            validateStatus: undefined,
        });

        // Check if the status code of the response equals 200
        if (response.status !== 200) {
            throw new Error(
                `Registry does not have package informations for: ${packageName}`,
            );
        }

        // The body of the response
        const body = response.data as any;

        const description: string | undefined = body['description'];
        const latestVersion: string | undefined =
            body['dist-tags']['latest'] ?? undefined;

        if (
            description === undefined ||
            (description.toLowerCase().includes('stub') &&
                description.toLowerCase().includes('definitions'))
        ) {
            throw new Error(
                `Package "${typePackageName}" are stub definitions`,
            );
        }

        // Contains the version informations
        const result: Record<string, string> = {};

        if (
            latestVersion !== undefined &&
            body.versions[latestVersion] !== undefined
        ) {
            result.latest = latestVersion;
        }

        // Get and sort the semver versions from the response body
        const versionEntries = Object.keys(body.versions)
            .sort((a, b) => {
                if (gt(a, b)) {
                    return 1;
                }

                if (lt(a, b)) {
                    return -1;
                }

                return 0;
            })
            // Reverse the array cause the highest version should be on the first place
            .reverse();

        for (const sortedVersion of versionEntries) {
            result[sortedVersion] = sortedVersion;
        }

        return result;
    }

    /**
     * Resolves the latest version for the given package name
     *
     * @param {string} packageName The name of the package which should be resolved
     * @param {string} npmRegistry The URL of the package registry which should be used
     *
     * @memberof VersionsResolver
     */
    public async getLatestVersion(
        packageName: string,
        npmRegistry: string,
    ): Promise<string | undefined> {
        if (this.versionsCache[packageName] === undefined) {
            this.versionsCache[packageName] = await this.getVersions(
                packageName,
                npmRegistry,
            );
        }

        const versions = this.versionsCache[packageName];

        if (versions.latest !== undefined) {
            return versions.latest;
        }

        return Object.keys(versions)
            .sort((a, b) => {
                if (gt(a, b)) {
                    return 1;
                }

                if (lt(a, b)) {
                    return -1;
                }

                return 0;
            })
            .reverse()[0];
    }

    /**
     * Resolves all available verions for the given package name
     *
     * @param {string} packageName
     * @return {*}  {Promise<Record<string, string>>}
     * @memberof VersionsResolver
     */
    async resolveVersionsForPackage(
        packageName: string,
        npmRegistry: string,
    ): Promise<Record<string, string>> {
        if (builtinModules.includes(packageName)) {
            return {};
        }

        this.logger.silly(
            `Checking if package is already known as invalid: ${packageName}`,
        );

        if (this.invalidPackages.includes(packageName)) {
            this.logger.silly(`Package is already known as invalid`);
            return {};
        }

        this.logger.silly(
            `Checking if entry "${packageName}" is already cached`,
        );

        if (this.versionsCache[packageName] !== undefined) {
            this.logger.silly(`Entry "${packageName}" is already cached`);

            return this.versionsCache[packageName];
        }

        this.logger.silly(`Entry "${packageName}" is not cached. Fetching it!`);

        try {
            const versions = await this.getVersions(packageName, npmRegistry);

            this.versionsCache[packageName] = versions;
        } catch (error) {
            if (error.message.includes('stub definitions')) {
                this.invalidPackages.push(packageName);
                return {};
            }

            if (
                error.message.includes(
                    'Registry does not have package informations for',
                )
            ) {
                this.invalidPackages.push(packageName);
                return {};
            }

            this.logger.warn(
                `Could not resolve package: ${packageName}: ${error}`,
            );

            return {};
        }

        return this.versionsCache[packageName];
    }

    /**
     * Returns the package name which is prefixed with "@types/"
     *
     * @private
     * @param {string} packageName The name of the package which should be prefixed
     * @return {string} The prefixed package name
     * @memberof VersionsResolver
     */
    private getTypesPrefixedPackageName(packageName: string): string {
        if (packageName.startsWith(this.typesPrefix)) {
            return packageName;
        }

        return `${this.typesPrefix}${packageName}`;
    }
}
