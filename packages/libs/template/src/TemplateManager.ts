import { IConfig } from '@packagaya/config/dist/IConfig';
import inquirer from 'inquirer';
import { injectable, multiInject } from 'inversify';

import { Template } from './Template';

@injectable()
export class TemplateManager {
    /**
     * Creates an instance of TemplateManager.
     * @param {Template<any>[]} templates The templates from all adapters
     * @memberof TemplateManager
     */
    constructor(
        @multiInject(Template.name) private templates: Template<any>[],
    ) {}

    /**
     * Finds and executes the template with the given template name. An error will be thrown when no template was found.
     *
     * @param {string} name The name of the template
     * @param {IConfig} projectSpecification The project configuration
     * @memberof TemplateManager
     */
    public async executeTemplate(name: string, projectSpecification: IConfig) {
        // Find the template with the given name
        const template = this.templates.find(
            (template) => template.name === name,
        );

        // Check if the template was found
        if (template === undefined) {
            // Template was not found! Throw an error!
            throw `Could not find template: ${name}`;
        }

        // Register the "autocomplete" type with the inquirer-autocomplete-prompt module
        inquirer.registerPrompt(
            'autocomplete',
            require('inquirer-autocomplete-prompt'),
        );

        // Get the inquirer.js questions
        const questions = template.getQuestions(projectSpecification);

        // Prompt the questions to the user to get the data
        const answers = await inquirer.prompt(questions);

        // Render the template with the given answers
        // The "render" function takes care that every file is
        // written and every needed file change is made
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
