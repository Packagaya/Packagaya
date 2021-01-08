import { Services } from '@packagaya/definitions/dist/Services';
import Ajv from 'ajv';
import { ContainerModule } from 'inversify';

import ConfigSchema from '../ConfigSchema.json';

export class ValidatorModule extends ContainerModule {
    constructor() {
        super((bind) => {
            bind(Services.Schema.Config).toConstantValue('config');

            bind(Ajv.name).toDynamicValue(({ container }) => {
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
