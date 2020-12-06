import { ContainerModule } from 'inversify';
import Ajv from 'ajv';
import ConfigSchema from '../ConfigSchema.json';

export class ValidatorModule extends ContainerModule {
    constructor() {
        super((bind) => {
            bind(Ajv).toDynamicValue(() => {
                const ajv = new Ajv();

                ajv.addSchema(ConfigSchema, 'config');

                return ajv;
            });
        });
    }
}
