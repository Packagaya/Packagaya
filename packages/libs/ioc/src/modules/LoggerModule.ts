import { ContainerModule } from 'inversify';
import { Logger } from 'tslog';

export class LoggerModule extends ContainerModule {
    constructor() {
        super((bind) => {
            bind(Logger)
                .toDynamicValue(() => {
                    return new Logger();
                })
                .inSingletonScope();
        });
    }
}
