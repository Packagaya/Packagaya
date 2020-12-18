import { Adapter } from '@packagaya/adapter/dist/Adapter';
import { FeatureFlag } from '@packagaya/adapter/dist/FeatureFlag';
import { inject, injectable, multiInject, named } from 'inversify';
import { Logger } from 'tslog';

import { TSServices } from './ioc/TSServices';

/**
 * Defines the official typescript adapter
 *
 * @export
 * @class TSAdapter
 * @extends {Adapter}
 */
@injectable()
export class TSAdapter extends Adapter {
    /**
     * Creates an instance of TSAdapter.
     * @param {Logger} logger The logger which should be used to log messages
     * @param {FeatureFlag[]} featureFlags The feature flags which are defined by the container bindings
     * @memberof TSAdapter
     */
    constructor(
        @inject(Logger) private logger: Logger,
        @named(TSAdapter.name)
        @multiInject(TSServices.FeatureFlag)
        featureFlags: FeatureFlag[],
    ) {
        super('ts-adapter', featureFlags);
    }

    /**
     * Initialize the adapter
     *
     * @memberof TSAdapter
     */
    public init(): void {
        this.logger.info('Initializing the TypeScript adapter');
    }
}

export default TSAdapter;
