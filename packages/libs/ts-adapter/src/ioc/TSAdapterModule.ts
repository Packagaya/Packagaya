import { ContainerModule } from 'inversify';
import TSAdapter from '../TSAdapter';
import { SyncTSPathsFlag } from '../featureFlags/SyncTSPathsFlag';
import { TSServices } from './TSServices';

/**
 * Defines the official typescript adapter container module
 *
 * @export
 * @class TSAdapterModule
 * @extends {ContainerModule}
 */
export default class TSAdapterModule extends ContainerModule {
    /**
     * Creates an instance of TSAdapterModule.
     * @memberof TSAdapterModule
     */
    constructor() {
        super((bind) => {
            // Bind the typescript adapter
            bind(TSAdapter.name).to(TSAdapter);

            // Bind the "sync-ts-paths" feature flag to the container
            bind(TSServices.FeatureFlag).to(SyncTSPathsFlag);
        });
    }
}
