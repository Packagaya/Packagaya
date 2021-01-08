import { AdapterLoader } from '@packagaya/adapter/dist/AdapterLoader';
import { ContainerBindingsLoader } from '@packagaya/adapter/dist/ContainerBindingsLoader';
import { FeatureFlagManager } from '@packagaya/adapter/dist/FeatureFlagManager';
import { ModuleLoader } from '@packagaya/adapter/dist/ModuleLoader';
import { ContainerModule } from 'inversify';

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
            bind(AdapterLoader.name).to(AdapterLoader);

            // Bind the module loader to the container
            bind(ModuleLoader.name).to(ModuleLoader);

            // Bind the container bindings loader to the container
            bind(ContainerBindingsLoader.name).to(ContainerBindingsLoader);

            // Bind the feature flag manager to the container
            bind(FeatureFlagManager.name)
                .to(FeatureFlagManager)
                .inSingletonScope();
        });
    }
}
