import { inject, injectable, multiInject } from 'inversify';
import { Adapter } from '@packagaya/adapter/dist/Adapter';
import { Logger } from 'tslog';
import { VSCodeServices } from './ioc/VSCodeServices';
import { FeatureFlag } from '@packagaya/adapter/dist/FeatureFlag';

@injectable()
export class VSCodeAdapter extends Adapter {
    constructor(
        @inject(Logger.name) private logger: Logger,
        @multiInject(VSCodeServices.FeatureFlag) featureFlags: FeatureFlag[],
    ) {
        super('vscode-adapter', featureFlags);
    }

    init() {
        this.logger.info('Initializing the VSCode adapter');
    }
}

export default VSCodeAdapter;
