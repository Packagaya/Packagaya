import { INPMConfig } from '@packagaya/adapter/dist/INPMConfig';
import { IConfig } from '@packagaya/config/dist/IConfig';
import { LocalFileSystem } from '@packagaya/definitions/dist/LocalFileSystem';
import { PackageType } from '@packagaya/package/dist/PackageType';
import { FileGenerator } from '@packagaya/template/dist/FileGenerator';
import { Template } from '@packagaya/template/dist/Template';
import { paramCase } from 'change-case';
import { mkdirSync } from 'fs';
import { Question } from 'inquirer';
import { inject, injectable } from 'inversify';
import isScoped from 'is-scoped';
import spdxLicenses from 'spdx-license-ids';
import { Logger } from 'tslog';

interface Answers extends Record<string, unknown> {
    packageName: string;
    packageDirectory: string;
    packageType: PackageType;
    license: string;
}

@injectable()
export class CreatePackageTemplate extends Template<Answers> {
    constructor(
        @inject(Logger) private logger: Logger,
        @inject(LocalFileSystem) private localFileSystem: LocalFileSystem,
        @inject(FileGenerator) private fileGenerator: FileGenerator<Answers>,
    ) {
        super('ts:create-package');
    }

    /**
     * Returns the inquirer.js questions
     *
     * @param {IConfig} projectSpecification The read project configuration
     * @return {Question<Answers>[]}
     * @memberof CreatePackageTemplate
     */
    public getQuestions(projectSpecification: IConfig): Question<Answers>[] {
        return [
            {
                type: 'list',
                name: 'packageName',
                message: 'What kind of package do you want to generate?',
                choices: [
                    {
                        name: 'Application',
                        value: PackageType.Application,
                    },
                    {
                        name: 'Library',
                        value: PackageType.Library,
                    },
                ],
            } as Question,
            {
                type: 'autocomplete',
                name: 'license',
                message: 'Which license should the new package have?',
                default: 'MIT',
                source: (_: Answers, searchTerm: string | undefined) =>
                    spdxLicenses.filter((license: string) => {
                        if (
                            searchTerm === undefined ||
                            searchTerm.length === 0
                        ) {
                            return true;
                        }

                        return license.includes(searchTerm);
                    }),
            } as Question,
            {
                type: 'list',
                name: 'packageDirectory',
                message: 'Where should the new package be created?',
                choices: (answers: Answers) => {
                    switch (answers.packageType) {
                        case PackageType.Application:
                            return projectSpecification.apps;
                        case PackageType.Library:
                            return projectSpecification.libs;
                        default:
                            throw new Error(
                                `Could not handle package type: ${answers.packageType}`,
                            );
                    }
                },
            } as Question,
            {
                type: 'input',
                name: 'packageName',
                message: 'The name of the new package:',
            },
        ];
    }

    public async render(context: Answers) {
        const rootPackageConfiguration = this.localFileSystem.resolve(
            process.cwd(),
            'package.json',
        );

        // Check if the package.json file exists in the current directory
        if (!this.localFileSystem.checkIfFileExists(rootPackageConfiguration)) {
            // The file was not found so we throw an error
            throw new Error(
                `Could not find root package configuration at: ${rootPackageConfiguration}`,
            );
        }

        // Define the root package configuration file variable
        let rootPackageConfig: INPMConfig;

        try {
            // The file contents of the root package.json file
            const fileContents = this.localFileSystem.readFile(
                rootPackageConfiguration,
            );

            // Set the parsed file contents to the root package config
            rootPackageConfig = JSON.parse(fileContents);
        } catch (error) {
            throw new Error(
                `Could not read the root package configuration file: ${error}`,
            );
        }

        // Convert the entered package name to param case
        let packageName = paramCase(context.packageName);

        // Defines the path of the package which should be created
        const packagePath = this.localFileSystem.resolve(
            context.packageDirectory,
            packageName,
        );

        // Checks if the root package name is scoped
        // Scoped packages matches the following example "@myscope/root", "@myscope/my-example-package"
        if (isScoped(rootPackageConfig.name)) {
            // Apply the scope correctly to the new package
            packageName = [
                rootPackageConfig.name.split('/')[0],
                packageName,
            ].join('/');
        }

        // Check if the new package directory exists
        if (!this.localFileSystem.checkIfDirectoryExists(packagePath)) {
            // Create the directory because it does not exists
            // Add the directories recursily to avoid any future errors
            mkdirSync(packagePath, {
                recursive: true,
            });
        }

        // Generate the package.json file from the template
        await this.fileGenerator.generateFileFromTemplate(
            this.localFileSystem.resolve(packagePath, 'package.json'),
            this.localFileSystem.resolve(
                __dirname,
                '..',
                '..',
                'templates',
                'CreatePackage',
                'package.json.hbs',
            ),
            {
                ...context,
                packageName,
            },
        );
    }
}
