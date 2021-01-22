import { Adapter } from '@packagaya/adapter/dist/Adapter';
import { PackageResolver } from '@packagaya/package/dist/PackageResolver';
import { Template } from '@packagaya/template/dist/Template';
import { ContainerModule } from 'inversify';

import { ImportFinder } from '../code/ImportFinder';
import { SyncTSPathsFlag } from '../featureFlags/SyncTSPathsFlag';
import { NPMPackageResolver } from '../NPMPackageResolver';
import { CreatePackageTemplate } from '../templates/CreatePackageTemplate';
import { TSAdapter } from '../TSAdapter';
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
            bind(Adapter.name).to(TSAdapter);

            bind(ImportFinder.name).to(ImportFinder).inSingletonScope();

            // Bind the "sync-ts-paths" feature flag to the container
            bind(TSServices.FeatureFlag).to(SyncTSPathsFlag).inSingletonScope();

            bind<Template<any>>(Template.name).to(CreatePackageTemplate);

            bind(PackageResolver.name).to(NPMPackageResolver);
        });
    }
}
