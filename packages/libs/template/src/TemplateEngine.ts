import { injectable } from 'inversify';

/**
 * Defines the basic structure of an template engine
 *
 * @export
 * @abstract
 * @class ITemplateEngine
 */
@injectable()
export abstract class TemplateEngine {
    /**
     * The render method should render the given template with
     * the given context to a string.
     *
     * @abstract
     * @param {string} template The template which should be used
     * @param {Record<string, unknown>} context The context which should be used for variables
     * @return {Promise<string>} The rendered template
     * @memberof ITemplateEngine
     */
    public abstract render(
        template: string,
        context: Record<string, unknown>,
    ): Promise<string>;
}
