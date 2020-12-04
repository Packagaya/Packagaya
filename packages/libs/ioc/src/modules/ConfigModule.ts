import { ContainerModule } from 'inversify';
import { ConfigManager } from '@packagaya/config/dist/ConfigManager';

export class ConfigModule extends ContainerModule {
    constructor() {
        super((bind) => {
            bind(ConfigManager).toSelf().inSingletonScope();
        });
    }
}
