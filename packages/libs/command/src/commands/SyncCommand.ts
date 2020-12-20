import { IConfig } from '@packagaya/config/dist/IConfig';
import { inject, injectable } from 'inversify';
import { Logger } from 'tslog';

import { Command } from '../Command';
import { FeatureFlagManager } from '@packagaya/adapter/dist/FeatureFlagManager';

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
     * @param {FeatureFlagManager} featureFlagManager The feature flag manager
     *                                                which will be used to
     *                                                execute the specified
     *                                                feature flags
     * @memberof SyncCommand
     */
    constructor(
        @inject(Logger) private logger: Logger,
        @inject(FeatureFlagManager)
        private featureFlagManager: FeatureFlagManager,
    ) {
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

        await this.featureFlagManager.runFeatureFlags(commandArguments, true);
    }
}
