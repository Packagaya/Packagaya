import 'reflect-metadata';
import { getContainer } from '@packagaya/ioc/dist/container';
import { ApplicationModule } from './ioc/ApplicationModule';
import { Application } from './Application';
import { Container } from 'inversify';

(async () => {
    const container = getContainer();

    // Bind the container to itself
    container.bind(Container.name).toConstantValue(container);

    // Bind the specific application module
    container.load(new ApplicationModule());

    // Get the application from the dependency injection container
    const application = container.get(Application);

    // Run and await the application
    await application.run();
})();
