import { Container } from 'inversify';
import { LoggerModule } from './modules/LoggerModule';

export const getContainer = () => {
    const container = new Container();

    container.load(new LoggerModule());

    return container;
};
