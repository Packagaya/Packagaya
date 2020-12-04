import { ContainerModule } from 'inversify';
import { Application } from '../Application';

export class ApplicationModule extends ContainerModule {
    constructor() {
        super((bind) => {
            bind(Application).toSelf().inSingletonScope();
        });
    }
}
