import { injectable } from 'inversify';
import { FeatureFlag } from '@packagaya/definitions/dist/FeatureFlag';

@injectable()
export abstract class Adapter {
    protected constructor(
        public readonly name: string,
        public readonly featureFlags: FeatureFlag[] = [],
    ) {
    }
}