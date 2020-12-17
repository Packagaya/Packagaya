import { inject, injectable } from 'inversify';
import { Logger } from 'tslog';
import { IConfig } from './IConfig';
import Ajv from 'ajv';
import { Services } from '@packagaya/definitions/dist/Services';
import { LocalFileSystem } from '@packagaya/definitions/dist/LocalFileSystem';

/**
 * The configuration manager will be used to load the
 * project configuration file and validating it.
 *
 * @export
 * @class ConfigManager
 */
@injectable()
export class ConfigManager {
    /**
     * Defines the filename of the configuration file
     *
     * The value will be read from the environment variables
     * at first. If it's not defined the default value "packagaya.json"
     * will be used.
     *
     * @private
     * @memberof ConfigManager
     */
    private readonly configurationFileName =
        process.env.PACKAGAYA_CONFIGURATION_FILE ?? 'packagaya.json';

    /**
     * Creates an instance of ConfigManager.
     * @param {Logger} logger The logger which should be used
     * @param {Ajv} ajv The Ajv instance which should be used for validating the configuration file
     * @param {string} configSchemaName The name of the configuration in the bound Ajv instance
     * @param {LocalFileSystem} localFileSystem The local filesystem which should be used
     *                                          to resolve paths or checking if a file exists
     * @memberof ConfigManager
     */
    constructor(
        @inject(Logger) private logger: Logger,
        @inject(Ajv) private ajv: Ajv.Ajv,
        @inject(Services.Schema.Config) private configSchemaName: string,
        @inject(LocalFileSystem) private localFileSystem: LocalFileSystem,
    ) {}

    /**
     * Reads the current project configuration file and validates it
     *
     * @returns {IConfig} The read and validated configuration file
     * @memberof ConfigManager
     */
    public readConfiguration(): IConfig {
        const workingDirectory = process.cwd();

        this.logger.debug(`Current working directory: ${workingDirectory}`);

        const configurationFilePath = this.localFileSystem.resolve(
            workingDirectory,
            this.configurationFileName,
        );

        this.logger.debug(
            `Resolved configuration file path: ${configurationFilePath}`,
        );

        if (!this.localFileSystem.checkIfFileExists(configurationFilePath)) {
            throw new Error(
                `Configuration file at path ${configurationFilePath}`,
            );
        }

        let config: IConfig;

        try {
            this.logger.debug('Trying to read the configuration file');
            const fileContents = this.localFileSystem.readFile(
                configurationFilePath,
            );

            this.logger.debug('Parsing file contents');
            config = JSON.parse(fileContents) as IConfig;
        } catch (error) {
            throw error;
        }

        try {
            this.logger.debug(
                'Validating object against the configuration file JSON schema',
            );
            this.isConfigValid(config);
        } catch (error) {
            throw new Error(
                `The read config does not match against the defined schema: ${error.message}`,
            );
        }

        this.logger.debug('Validated configuration file');

        if (typeof config['$schema'] === 'string') {
            delete config['$schema'];
        }

        return config;
    }

    /**
     * Checks if the given input matches the JSON schema of the configuration file
     *
     * @private
     * @param {*} input The input which should be validated
     * @returns Returns true when the given input matches the JSON schema of the configuration file
     * @memberof ConfigManager
     */
    private isConfigValid(input: IConfig) {
        this.ajv.validate(this.configSchemaName, input);

        if (this.ajv.errors !== null) {
            throw new Error(this.ajv.errorsText());
        }

        const invalidAppPaths = this.filterInvalidPaths(input.apps);

        if (invalidAppPaths.length > 0) {
            throw new Error(
                `The configuration file contains invalid app paths: ${invalidAppPaths.join(
                    ', ',
                )}`,
            );
        }

        const invalidLibPaths = this.filterInvalidPaths(input.libs);

        if (invalidLibPaths.length > 0) {
            throw new Error(
                `The configuration file contains invalid lib paths: ${invalidLibPaths.join(
                    ', ',
                )}`,
            );
        }

        const invalidAdapterPaths = input.adapters.filter(
            (packageName) =>
                !this.localFileSystem.checkIfDirectoryExists(
                    this.localFileSystem.resolve(
                        process.cwd(),
                        'node_modules',
                        packageName,
                    ),
                ),
        );

        if (invalidAdapterPaths.length > 0) {
            throw new Error(
                `The configuration file contains invalid adapter entries: ${invalidAdapterPaths.join(
                    ', ',
                )}`,
            );
        }

        // TODO: Check if feature flags exists
    }

    private filterInvalidPaths(paths: string[]): string[] {
        return paths.filter(
            (path) =>
                !this.localFileSystem.checkIfDirectoryExists(
                    this.localFileSystem.resolve(process.cwd(), path),
                ),
        );
    }
}
