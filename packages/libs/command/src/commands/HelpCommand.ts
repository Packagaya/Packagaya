import { IConfig } from '@packagaya/config/dist/IConfig';
import { inject, multiInject } from 'inversify';
import { Logger } from 'tslog';

import { Command } from '../Command';

export class HelpCommand extends Command {
    constructor(
        @inject(Logger.name) private logger: Logger,
        @multiInject(Command.name) private commands: Command[],
    ) {
        super('help', ['h'], [], '');
    }

    public async execute(
        projectSpecification: IConfig,
        commandArguments: string[],
    ) {
        console.log();
        this.logger.info('Packagaya Help');
        console.log();

        this.logger.info(`The following commands are avaiable:`);

        for (const command of this.commands) {
            if (command.help.length === 0) {
                this.logger.info(`- ${command.name}`);
            } else {
                this.logger.info(`- ${command.name} (${command.help})`);
            }
        }
    }
}
