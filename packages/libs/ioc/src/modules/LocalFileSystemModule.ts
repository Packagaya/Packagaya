import { LocalFileSystem } from '@packagaya/definitions/dist/LocalFileSystem';
import { ContainerModule } from 'inversify';

export class LocalFileSystemModule extends ContainerModule {
    constructor() {
        super((bind) => {
            bind(LocalFileSystem.name).to(LocalFileSystem);
        });
    }
}
