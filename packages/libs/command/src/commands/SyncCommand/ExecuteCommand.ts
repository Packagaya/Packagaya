import { FeatureFlagManager } from '@packagaya/adapter/dist/FeatureFlagManager';
import { IConfig } from '@packagaya/config/dist/IConfig';
import { inject, injectable } from 'inversify';
import { Logger } from 'tslog';

import { Command } from '../../Command';

@injectable()
export class ExecuteCommand extends Command {
    constructor(
        @inject(Logger.name) private logger: Logger,
        @inject(FeatureFlagManager.name)
        private featureFlagManager: FeatureFlagManager,
    ) {
        super('execute', ['e'], [], 'Fixes the differences');
    }

    async execute(projectSpecification: IConfig, commandArguments: string[]) {
        this.logger.info('Running the execute command');

        await this.featureFlagManager.runFeatureFlags(
            projectSpecification.features,
            projectSpecification,
            true,
        );
    }
}
