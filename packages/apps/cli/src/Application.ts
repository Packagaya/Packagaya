import { inject, injectable } from 'inversify';
import { Logger } from 'tslog';

@injectable()
export class Application {
    constructor(@inject(Logger) private logger: Logger) {}

    public run() {}
}
