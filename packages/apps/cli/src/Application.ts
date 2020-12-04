import { inject, injectable } from 'inversify';
import { Logger } from 'tslog';
import { ConfigManager } from '@packagaya/config/dist/ConfigManager';

@injectable()
export class Application {
    constructor(
        @inject(Logger) private logger: Logger,
        @inject(ConfigManager) private configManager: ConfigManager,
    ) {}

    public run() {
        try {
            const projectConfiguration = this.configManager.readConfiguration();
        } catch (error) {
            this.logger.error(error);
            process.exit(1);
        }
    }
}
