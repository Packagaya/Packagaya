import { Container } from 'inversify';
import { ConfigModule } from './modules/ConfigModule';
import { LoggerModule } from './modules/LoggerModule';

export const getContainer = () => {
    const container = new Container();

    container.load(new LoggerModule());
    container.load(new ConfigModule());

    return container;
};
