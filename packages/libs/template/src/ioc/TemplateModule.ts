import { ContainerModule } from 'inversify';

import { HandlebarsEngine } from '../HandlebarsEngine';
import { TemplateEngine } from '../TemplateEngine';

/**
 * Defines an IoC container module for the template package
 *
 * @export
 * @class TemplateModule
 * @extends {ContainerModule}
 */
export class TemplateModule extends ContainerModule {
    /**
     * Creates an instance of the template container module.
     * @memberof TemplateModule
     */
    constructor() {
        super((bind) => {
            // Bind the default template engine to the handlebars engine
            bind(TemplateEngine).to(HandlebarsEngine);
        });
    }
}
