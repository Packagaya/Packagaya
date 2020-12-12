import { inject, injectable } from 'inversify';
import { Logger } from 'tslog';
import { ConfigManager } from '@packagaya/config/dist/ConfigManager';
import { IConfig } from '@packagaya/config/dist/IConfig';
import { AdapterLoader } from '@packagaya/adapter/dist/AdapterLoader';

@injectable()
export class Application {
    constructor(
        @inject(Logger) private logger: Logger,
        @inject(ConfigManager) private configManager: ConfigManager,
        @inject(AdapterLoader) private adapterLoader: AdapterLoader,
    ) {}

    public run() {
        let projectSpecification: IConfig;

        try {
            projectSpecification = this.configManager.readConfiguration();
        } catch (error) {
            this.logger.error('Could not load the configuration file', error);
            process.exit(1);
        }

        this.logger.info('Loaded the project configuration file');

        this.logger.info('Loading adapters');
        this.adapterLoader.load(projectSpecification.adapters);
    }
}
