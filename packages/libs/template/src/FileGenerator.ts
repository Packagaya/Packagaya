import { LocalFileSystem } from '@packagaya/definitions/dist/LocalFileSystem';
import { inject, injectable } from 'inversify';
import { Logger } from 'tslog';

import { TemplateEngine } from './TemplateEngine';

/**
 * Defines a basic file generator
 *
 * @export
 * @abstract
 * @class FileGenerator
 */
@injectable()
export class FileGenerator<ContextType> {
    /**
     * Creates an instance of FileGenerator.
     * @param {Logger} logger The logger which should be used to log messages
     * @param {LocalFileSystem} fileSystem The local file system which should be used to resolve paths and writing files
     * @param {TemplateEngine} templateEngine The template enginee which should be used to render the given templates
     * @memberof FileGenerator
     */
    constructor(
        @inject(Logger.name) private logger: Logger,
        @inject(LocalFileSystem) private fileSystem: LocalFileSystem,
        @inject(TemplateEngine) private templateEngine: TemplateEngine,
    ) {}

    /**
     * Creates a new file based off the template
     *
     * @param {string} filePath The path to the file which should be created
     * @param {string} template The template which should be rendered
     * @param {Record<string, unknown>} context The context which should be used for rendering the template
     * @memberof FileGenerator
     */
    public async generateFile(
        filePath: string,
        template: string,
        context: ContextType,
    ) {
        let compiledTemplate: string;

        try {
            // Compile the given template with the given data context
            compiledTemplate = await this.templateEngine.render(
                template,
                context as Record<string, unknown>,
            );
        } catch (error) {
            this.logger.error(`Could not generate file '${filePath}'`, error, {
                context: {
                    filePath,
                    template,
                    context,
                },
            });

            // Rethrow the error
            throw error;
        }

        // Resolve the path to the file
        const localFilePath = this.fileSystem.resolve(process.cwd(), filePath);

        // Write the compiled template into the file
        this.fileSystem.writeFile(localFilePath, compiledTemplate);
    }

    /**
     * Uses a file template which gets compiled and saved to the given filePath
     *
     * @param {string} filePath The path to the new file
     * @param {string} templatePath The path to the template file
     * @param {ContextType} context The rendering context
     * @memberof FileGenerator
     */
    public async generateFileFromTemplate(
        filePath: string,
        templatePath: string,
        context: ContextType,
    ) {
        // Resolve the path to the template file
        const localFilePath = this.fileSystem.resolve(
            process.cwd(),
            templatePath,
        );

        // Read the contents of the template file
        const fileContents = this.fileSystem.readFile(localFilePath);

        // Generate the new file with the loaded template and the given context
        await this.generateFile(filePath, fileContents, context);
    }
}
