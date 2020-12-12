import { ContainerModule } from 'inversify';
import { AdapterLoader } from '@packagaya/adapter/dist/AdapterLoader';

export class AdapterModule extends ContainerModule {
    constructor() {
        super((bind) => {
            bind(AdapterLoader).toSelf();
        });
    }
}
