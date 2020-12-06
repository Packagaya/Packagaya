import { Container } from 'inversify';
import { ConfigModule } from './modules/ConfigModule';
import { LoggerModule } from './modules/LoggerModule';
import { ValidatorModule } from '@packagaya/config/dist/ioc/ValidatorModule';

export const getContainer = () => {
    const container = new Container();

    container.load(new LoggerModule());
    container.load(new ConfigModule());
    container.load(new ValidatorModule());

    return container;
};
