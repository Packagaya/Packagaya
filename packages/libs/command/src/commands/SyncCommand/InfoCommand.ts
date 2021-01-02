import { FeatureFlagManager } from '@packagaya/adapter/dist/FeatureFlagManager';
import { IConfig } from '@packagaya/config/dist/IConfig';
import { inject, injectable } from 'inversify';
import { Logger } from 'tslog';

import { Command } from '../../Command';

@injectable()
export class InfoCommand extends Command {
    constructor(
        @inject(Logger.name) private logger: Logger,
        @inject(FeatureFlagManager)
        private featureFlagManager: FeatureFlagManager,
    ) {
        super(
            'info',
            ['i'],
            [],
            'List all differences which are read by the feature flags',
        );
    }

    async execute(projectSpecification: IConfig, commandArguments: string[]) {
        this.logger.info('Running the info command');

        await this.featureFlagManager.runFeatureFlags(
            commandArguments,
            projectSpecification,
            false,
        );
    }
}
