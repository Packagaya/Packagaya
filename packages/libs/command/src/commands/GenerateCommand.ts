import { IConfig } from '@packagaya/config/dist/IConfig';
import { TemplateManager } from '@packagaya/template/dist/TemplateManager';
import { inject, injectable } from 'inversify';
import { Logger } from 'tslog';

import { Command } from '../Command';

@injectable()
export class GenerateCommand extends Command {
    constructor(
        @inject(Logger.name) private logger: Logger,
        @inject(TemplateManager.name) private templateManager: TemplateManager,
    ) {
        super('generate', ['g'], [], '');
    }

    public async execute(
        projectSpecification: IConfig,
        commandArguments: string[],
    ) {
        if (commandArguments.length === 0) {
            this.logger.error('No template name was given');
            this.logger.info(`The following templates are available:`);
            for (const templateName of this.templateManager.getTemplateNames()) {
                this.logger.info(`- ${templateName}`);
            }
            return;
        }

        let templateName = commandArguments[0];

        await this.templateManager.executeTemplate(
            templateName,
            projectSpecification,
        );
    }
}
