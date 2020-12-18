#!/bin/env node
import 'reflect-metadata';

import { getContainer } from '@packagaya/ioc/dist/container';
import { Container } from 'inversify';

import { Application } from './Application';
import { ApplicationModule } from './ioc/ApplicationModule';

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
