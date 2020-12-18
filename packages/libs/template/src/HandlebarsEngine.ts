import { compile } from 'handlebars';
import { injectable } from 'inversify';

import { TemplateEngine } from './TemplateEngine';

/**
 * Implements the handlebars package as template engine
 *
 * @export
 * @class HandlebarsEngine
 * @extends {TemplateEngine}
 */
@injectable()
export class HandlebarsEngine extends TemplateEngine {
    /**
     * Renders the given template with the given context
     *
     * @param {string} template The template contents as string
     * @param {Record<string, unknown>} context The replacements for the template
     * @return {Promise<string>} The rendered template
     * @memberof HandlebarsEngine
     */
    public async render(
        template: string,
        context: Record<string, unknown>,
    ): Promise<string> {
        // Compile the template to a handlebars template function
        const templateFunc = compile(template);

        // Return the replaced template with the values from the given context
        return templateFunc(context);
    }
}
