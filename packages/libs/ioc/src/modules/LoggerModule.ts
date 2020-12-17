import { ContainerModule } from 'inversify';
import { Logger } from 'tslog';

// The logger is created in the
// global namespace because we only
// want a single instance across the process
const logger = new Logger({
    minLevel: (process.env.LOG_LEVEL as 'info') ?? 'silly',
});

/**
 * Defines an IoC container module for the logger package
 *
 * @export
 * @class LoggerModule
 * @extends {ContainerModule}
 */
export class LoggerModule extends ContainerModule {
    /**
     * Creates an instance of LoggerModule.
     * @memberof LoggerModule
     * @see logger The logger which will be used to log
     *             messages
     */
    constructor() {
        super((bind) => {
            // Bind the logger class from tslog to
            // the global defined logger
            bind(Logger).toConstantValue(logger);
        });
    }
}
