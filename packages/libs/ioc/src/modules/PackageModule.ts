import { PackageManager } from '@packagaya/package/dist/PackageManager';
import { ContainerModule } from 'inversify';

export class PackageModule extends ContainerModule {
    constructor() {
        super((bind) => {
            bind(PackageManager.name).to(PackageManager);
        });
    }
}
