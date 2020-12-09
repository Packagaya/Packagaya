import { ContainerModule } from 'inversify';
import Ajv from 'ajv';
import ConfigSchema from '../ConfigSchema.json';
import { Services } from '@packagaya/definitions/dist/Services';

export class ValidatorModule extends ContainerModule {
    constructor() {
        super((bind) => {
            bind(Services.Schema.Config).toConstantValue('config');

            bind(Ajv).toDynamicValue(({ container }) => {
                const ajv = new Ajv();

                ajv.addSchema(
                    ConfigSchema,
                    container.get(Services.Schema.Config),
                );

                return ajv;
            });
        });
    }
}
