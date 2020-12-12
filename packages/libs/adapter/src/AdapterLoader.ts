import { inject, injectable } from 'inversify';
import { Logger } from 'tslog';
import { Adapter } from './Adapter';
import { LocalFileSystem } from '@packagaya/definitions/dist/LocalFileSystem';

@injectable()
export class AdapterLoader {
    constructor(
        @inject(Logger) private logger: Logger,
        @inject(LocalFileSystem) private localFileSystem: LocalFileSystem,
    ) {}

    public load(adapterNames: string[]): Adapter[] {
        this.logger.info('Loading adapters');

        // Check if the directories exists
        const adapterPaths = adapterNames.map((adapterName) =>
            this.localFileSystem.resolve(
                process.cwd(),
                'node_modules',
                adapterName,
            ),
        );

        const availableAdapters = adapterPaths.filter(
            (adapterPath) =>
                !this.localFileSystem.checkIfDirectoryExists(adapterPath),
        );

        if (availableAdapters.length > 0) {
            throw new Error(
                `The following adapters were not found: ${availableAdapters.join(
                    ', ',
                )}`,
            );
        }

        // TODO: Load package.json
        // TODO: Bind additional container bindings
        // TODO: Load the Node.JS module

        // Return the loaded adapters
        return [];
    }
}
