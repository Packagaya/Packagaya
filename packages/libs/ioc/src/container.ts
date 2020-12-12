import { Container } from 'inversify';
import { ConfigModule } from './modules/ConfigModule';
import { LoggerModule } from './modules/LoggerModule';
import { ValidatorModule } from '@packagaya/config/dist/ioc/ValidatorModule';
import { LocalFileSystemModule } from './modules/LocalFileSystemModule';
import { AdapterModule } from './modules/AdapterModule';

export const getContainer = () => {
    const container = new Container();

    container.load(new LoggerModule());
    container.load(new ConfigModule());
    container.load(new ValidatorModule());
    container.load(new LocalFileSystemModule());
    container.load(new AdapterModule());

    return container;
};
