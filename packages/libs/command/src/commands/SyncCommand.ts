import { IConfig } from '@packagaya/config/dist/IConfig';
import { inject, injectable } from 'inversify';
import { Logger } from 'tslog';

import { Command } from '../Command';

/**
 * Defines the "sync" command
 *
 * @export
 * @class SyncCommand
 * @extends {Command}
 */
@injectable()
export class SyncCommand extends Command {
    /**
     * Creates an instance of SyncCommand.
     * @param {Logger} logger The logger which should be used to log messages
     * @memberof SyncCommand
     */
    constructor(@inject(Logger) private logger: Logger) {
        super('sync', ['s'], [], '');
    }

    /**
     * Defines how the sync command should be executed
     *
     * @param {IConfig} projectSpecification The project configuration
     * @param {string[]} commandArguments The command arguments for the command
     * @memberof SyncCommand
     */
    async execute(projectSpecification: IConfig, commandArguments: string[]) {
        this.logger.info('Running the sync command');
    }
}
