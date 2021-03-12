import { ContainerModule } from 'inversify';
import VSCodeAdapter from '../VSCodeAdapter';
import { SyncVSCodeWorkspacesFeatureFlag } from '../featureflags/SyncVSCodeWorkspaces';
import { VSCodeServices } from './VSCodeServices';
import { Adapter } from '@packagaya/adapter/dist/Adapter';

export class VSCodeAdapterModule extends ContainerModule {
    constructor() {
        super((bind) => {
            bind(VSCodeAdapter.name).to(VSCodeAdapter);
            bind(Adapter.name).to(VSCodeAdapter);

            bind(VSCodeServices.FeatureFlag)
                .to(SyncVSCodeWorkspacesFeatureFlag)
                .inSingletonScope();
        });
    }
}

export default VSCodeAdapterModule;
