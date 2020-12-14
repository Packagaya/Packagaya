import { injectable, unmanaged } from 'inversify';
import { FeatureFlag } from './FeatureFlag';

/**
 * Defines a basic adapter which can be extended by other packages
 * An adapter is like a group for custom commands, feature flags
 * and so many more!
 *
 * @export
 * @abstract
 * @class Adapter
 */
@injectable()
export abstract class Adapter {
    /**
     * Creates an instance of Adapter.
     * @param {string} name The name of the adapter
     * @param {FeatureFlag[]} [featureFlags=[]] The feature flags of the adapter
     * @memberof Adapter
     */
    protected constructor(
        @unmanaged()
        public readonly name: string,
        @unmanaged()
        public readonly featureFlags: FeatureFlag[] = [],
    ) {}

    public abstract init(): void;
}
