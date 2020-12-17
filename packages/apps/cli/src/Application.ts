import { AdapterLoader } from '@packagaya/adapter/dist/AdapterLoader';
import { CommandManager } from '@packagaya/command/dist/CommandManager';
import { ConfigManager } from '@packagaya/config/dist/ConfigManager';
import { IConfig } from '@packagaya/config/dist/IConfig';
import { Container, inject, injectable } from 'inversify';
import { Logger } from 'tslog';

/**
 * The command line interface application
 *
 * @export
 * @class Application
 */
@injectable()
export class Application {
    /**
     * Creates an instance of the Application.
     *
     * @param {Logger} logger The logger which should be used to log messages
     * @param {ConfigManager} configManager The configuration manager which loads the project configuration file
     * @param {AdapterLoader} adapterLoader The adapter loader which will be used to load adapters
     * @param {Container} container The container which will be used to instantiate the command manager after the
     *                              additional container bindings from the plugins were bound
     * @memberof Application
     */
    constructor(
        @inject(Logger) private logger: Logger,
        @inject(ConfigManager) private configManager: ConfigManager,
        @inject(AdapterLoader) private adapterLoader: AdapterLoader,
        @inject(Container.name) private container: Container,
    ) {}

    /**
     * Run the command line application
     *
     * @return {Promise<void>} A promise is returned which awaits
     *                         the start and shutdown of the application
     * @memberof Application
     */
    public async run(): Promise<void> {
        // Define the project configuration
        let projectSpecification: IConfig;

        // Get the command name from the command line input
        let [command, ...commandArgs] = process.argv.slice(2);

        // Check if the command is undefined
        // if it is undefined the "help" command
        // will be set as default
        if (command === undefined) {
            this.logger.debug('Setting the default command');

            // Set the default command
            command = 'help';
        }

        this.logger.debug(`Got the following command: ${command}`);

        if (commandArgs.length > 0) {
            this.logger.debug(
                `Got the following command arguments: ${commandArgs.join(
                    ', ',
                )}`,
            );
        }

        this.logger.debug('Loading the project configuration file');

        try {
            // Read the project configuration file
            projectSpecification = this.configManager.readConfiguration();
        } catch (error) {
            this.logger.error('Could not load the configuration file', error);
            process.exit(1);
        }

        this.logger.info('Loaded the project configuration file');

        this.logger.debug('Loading adapters');
        const adapters = this.adapterLoader.load(projectSpecification.adapters);
        this.logger.info('Loaded adapters');

        for (const adapter of adapters) {
            adapter.init();
        }

        const commandManager = this.container.get(CommandManager);

        try {
            // Execute the command with the
            // given command arguments and
            // the project configuration file
            await commandManager.executeCommand(
                command,
                projectSpecification,
                commandArgs,
            );
        } catch (error) {
            this.logger.error(`Could not execute command "${command}":`, error);
            process.exit(1);
        }
    }
}
