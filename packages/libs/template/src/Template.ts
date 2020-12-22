import { IConfig } from '@packagaya/config/dist/IConfig';
import { Question } from 'inquirer';
import { injectable, unmanaged } from 'inversify';

/**
 * Templates are classes which handle the generation of new files based on answered questions of the user
 *
 * @export
 * @abstract
 * @class Template
 * @template T The data context for the template. Should have the type Record<string, unknown>.
 */
@injectable()
export abstract class Template<T extends Record<string, unknown>> {
    /**
     * Creates an instance of Template.
     * @param {string} name The name of the template
     * @memberof Template
     */
    constructor(@unmanaged() public readonly name: string) {}

    /**
     * Computes all inquirer.js questions which should be asked to get the user input
     *
     * @abstract
     * @param {IConfig} projectSpecification The project configuration
     * @return {Question[]} The inquirer.js questions
     * @memberof Template
     */
    public abstract getQuestions(projectSpecification: IConfig): Question<T>[];

    /**
     * Renders the template with the given context
     *
     * @abstract
     * @param {T} context The context which will be used to render the template
     * @memberof Template
     */
    public abstract render(context: T): Promise<void>;
}
