import { inject, injectable } from 'inversify';
import { Logger } from 'tslog';
import { existsSync } from 'fs';
import { join } from 'path';
import { IConfig } from './IConfig';
import Ajv from 'ajv';
import { readFileSync } from 'fs';
import { Services } from '@packagaya/definitions/dist/Services';

@injectable()
export class ConfigManager {
    /**
     * Defines the filename of the configuration file
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
     * @memberof ConfigManager
     */
    constructor(
        @inject(Logger) private logger: Logger,
        @inject(Ajv) private ajv: Ajv.Ajv,
        @inject(Services.Schema.Config) private configSchemaName: string,
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

        const configurationFilePath = join(
            workingDirectory,
            this.configurationFileName,
        );

        this.logger.debug(
            `Resolved configuration file path: ${configurationFilePath}`,
        );

        if (!this.checkIfConfigurationFileExists(configurationFilePath)) {
            throw new Error(
                `Configuration file at path ${configurationFilePath}`,
            );
        }

        let config: IConfig;

        try {
            this.logger.debug('Trying to read the configuration file');
            const fileContents = readFileSync(configurationFilePath).toString(
                'utf-8',
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
                `The config does not match the json schema: ${error.message}`,
            );
        }

        this.logger.debug('Validated configuration file');

        return config;
    }

    /**
     * Checks if the given path is a file
     *
     * @private
     * @param {string} configurationFilePath The path to the file
     * @returns {boolean} Returns true when a file exists at this path
     * @memberof ConfigManager
     */
    private checkIfConfigurationFileExists(
        configurationFilePath: string,
    ): boolean {
        return existsSync(configurationFilePath);
    }

    /**
     * Checks if the given input matches the JSON schema of the configuration file
     *
     * @private
     * @param {*} input The input which should be validated
     * @returns Returns true when the given input matches the JSON schema of the configuration file
     * @memberof ConfigManager
     */
    private isConfigValid(input: any) {
        this.ajv.validate(this.configSchemaName, input);

        if (this.ajv.errors === null) {
            return;
        }

        throw new Error(this.ajv.errorsText());
    }
}
