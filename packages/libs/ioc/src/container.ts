import { Container } from 'inversify';
import { ConfigModule } from './modules/ConfigModule';
import { LoggerModule } from './modules/LoggerModule';
import { ValidatorModule } from '@packagaya/config/dist/ioc/ValidatorModule';
import { LocalFileSystemModule } from './modules/LocalFileSystemModule';
import { AdapterModule } from './modules/AdapterModule';
import { CommandModule } from './modules/CommandModule';

/**
 * Loads the container with all known container modules
 *
 * @returns The prepared container
 */
export const getContainer = (): Container => {
    // Create a new instance of the dependency injection container
    const container = new Container();

    // Load all required container modules
    container.load(
        // Binds the tslog logger
        new LoggerModule(),

        // Binds the configuration manager and other config related stuff
        new ConfigModule(),

        // Bind the validator module for validating json schemas
        new ValidatorModule(),

        // Bind the local filesystem
        new LocalFileSystemModule(),

        // Bind all offical adapters
        new AdapterModule(),

        // Bind all system commands
        new CommandModule(),
    );

    // Return the prepared container
    return container;
};
