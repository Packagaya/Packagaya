import { inject, injectable } from 'inversify';
import { Logger } from 'tslog';

@injectable()
export class ConfigManager {
    constructor(@inject(Logger) private logger: Logger) {}

    public readConfiguration() {
        this.logger.debug(`Current working directory: ${process.cwd()}`);
    }
}
