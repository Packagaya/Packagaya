import { ContainerModule } from 'inversify';
import { ConfigManager } from '@packagaya/config/dist/ConfigManager';

/**
 * The ConfigModule binds all the stuff from the config package to the container
 *
 * @export
 * @class ConfigModule
 * @extends {ContainerModule}
 */
export class ConfigModule extends ContainerModule {
    /**
     * Creates an instance of ConfigModule.
     * @memberof ConfigModule
     */
    constructor() {
        super((bind) => {
            bind(ConfigManager).toSelf();
        });
    }
}
