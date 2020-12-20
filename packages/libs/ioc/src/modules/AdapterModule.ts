import { ContainerModule } from 'inversify';
import { AdapterLoader } from '@packagaya/adapter/dist/AdapterLoader';
import { ContainerBindingsLoader } from '@packagaya/adapter/dist/ContainerBindingsLoader';
import { ModuleLoader } from '@packagaya/adapter/dist/ModuleLoader';
import { FeatureFlagManager } from '@packagaya/adapter/dist/FeatureFlagManager';

/**
 * Defines an IoC container module for the adapter package
 *
 * @export
 * @class AdapterModule
 * @extends {ContainerModule}
 */
export class AdapterModule extends ContainerModule {
    constructor() {
        super((bind) => {
            // Bind the adapter loader to the container
            bind(AdapterLoader).toSelf();

            // Bind the module loader to the container
            bind(ModuleLoader).toSelf();

            // Bind the container bindings loader to the container
            bind(ContainerBindingsLoader).toSelf();

            // Bind the feature flag manager to the container
            bind(FeatureFlagManager).toSelf().inSingletonScope();
        });
    }
}
