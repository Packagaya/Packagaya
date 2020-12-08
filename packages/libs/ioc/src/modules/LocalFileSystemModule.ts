import { ContainerModule } from 'inversify';
import { LocalFileSystem } from '@packagaya/definitions/dist/LocalFileSystem';

export class LocalFileSystemModule extends ContainerModule {
    constructor() {
        super((bind) => {
            bind(LocalFileSystem).toSelf();
        });
    }
}
