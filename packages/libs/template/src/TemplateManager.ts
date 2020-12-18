import { IConfig } from '@packagaya/config/dist/IConfig';
import { prompt } from 'inquirer';
import { injectable, multiInject } from 'inversify';

import { Template } from './Template';

@injectable()
export class TemplateManager {
    /**
     * Creates an instance of TemplateManager.
     * @param {Template<any>[]} templates The templates from all adapters
     * @memberof TemplateManager
     */
    constructor(@multiInject(Template) private templates: Template<any>[]) {}

    /**
     * Finds and executes the template with the given template name. An error will be thrown when no template was found.
     *
     * @param {string} name The name of the template
     * @param {IConfig} projectSpecification The project configuration
     * @memberof TemplateManager
     */
    public async executeTemplate(name: string, projectSpecification: IConfig) {
        const template = this.templates.find(
            (template) => template.name === name,
        );

        if (template === undefined) {
            throw `Could not find template: ${name}`;
        }

        const questions = template.getQuestions(projectSpecification);
        const answers = await prompt(questions);

        template.render(answers);
    }

    /**
     * Returns the names of all registered templates
     *
     * @return {string[]} The name of all registered templates
     * @memberof TemplateManager
     */
    public getTemplateNames(): string[] {
        return this.templates.map((template) => template.name);
    }
}
