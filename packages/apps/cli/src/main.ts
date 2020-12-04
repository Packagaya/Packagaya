import 'reflect-metadata';
import { getContainer } from '@packagaya/ioc/dist/container';
import { ApplicationModule } from './ioc/ApplicationModule';
import { Application } from './Application';

(async () => {
    const container = getContainer();

    container.load(new ApplicationModule());

    const application = container.get(Application);
    application.run();
})();
