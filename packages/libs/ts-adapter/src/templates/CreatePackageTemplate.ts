import { INPMConfig } from '@packagaya/adapter/dist/INPMConfig';
import { IConfig } from '@packagaya/config/dist/IConfig';
import { LocalFileSystem } from '@packagaya/definitions/dist/LocalFileSystem';
import { PackageType } from '@packagaya/package/dist/PackageType';
import { FileGenerator } from '@packagaya/template/dist/FileGenerator';
import { Template } from '@packagaya/template/dist/Template';
import { paramCase } from 'change-case';
import { mkdirSync } from 'fs';
import { inject, injectable } from 'inversify';
import isScoped from 'is-scoped';
import { Logger } from 'tslog';

interface Answers extends Record<string, unknown> {
    packageName: string;
    packageDirectory: string;
    packageType: PackageType;
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

    public getQuestions(projectSpecification: IConfig): any[] {
        return [
            {
                type: 'list',
                name: 'packageType',
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
            },
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
            },
            {
                type: 'input',
                name: 'packageName',
                message: 'The name of the new package:',
            },
        ];
    }

    public render(context: Answers) {
        const rootPackageConfiguration = this.localFileSystem.resolve(
            process.cwd(),
            'package.json',
        );

        if (!this.localFileSystem.checkIfFileExists(rootPackageConfiguration)) {
            throw new Error(
                `Could not find root package configuration at: ${rootPackageConfiguration}`,
            );
        }

        let rootPackageConfig: INPMConfig;

        try {
            const fileContents = this.localFileSystem.readFile(
                rootPackageConfiguration,
            );
            rootPackageConfig = JSON.parse(fileContents);
        } catch (error) {
            throw new Error(
                `Could not read the root package configuration file: ${error}`,
            );
        }

        let packageName = paramCase(context.packageName);
        const packagePath = this.localFileSystem.resolve(
            context.packageDirectory,
            packageName,
        );

        if (isScoped(rootPackageConfig.name)) {
            packageName = [
                rootPackageConfig.name.split('/')[0],
                packageName,
            ].join('/');
        }

        if (!this.localFileSystem.checkIfDirectoryExists(packagePath)) {
            mkdirSync(packagePath, {
                recursive: true,
            });
        }

        this.fileGenerator.generateFileFromTemplate(
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
