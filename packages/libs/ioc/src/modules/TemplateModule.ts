import { FileGenerator } from '@packagaya/template/dist/FileGenerator';
import { HandlebarsEngine } from '@packagaya/template/dist/HandlebarsEngine';
import { TemplateEngine } from '@packagaya/template/dist/TemplateEngine';
import { TemplateManager } from '@packagaya/template/dist/TemplateManager';
import { ContainerModule } from 'inversify';

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

            // Bind the template manager which manages all the templates from the adapters
            bind(TemplateManager).toSelf();

            // Bind the template file based generator
            bind(FileGenerator).toSelf();
        });
    }
}
