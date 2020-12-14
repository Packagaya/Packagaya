import { Command } from '../Command';
import { inject, injectable } from 'inversify';
import { Logger } from 'tslog';
import { IConfig } from '@packagaya/config/dist/IConfig';

@injectable()
export class SyncCommand extends Command {
    constructor(@inject(Logger) private logger: Logger) {
        super('sync', ['s'], []);
    }

    async execute(projectSpecification: IConfig, commandArguments: string[]) {
        this.logger.info('Running the sync command');
    }
}
