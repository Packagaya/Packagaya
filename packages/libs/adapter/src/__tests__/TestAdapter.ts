import { Adapter } from '../Adapter';

export const AdapterName = 'test-adapter';

export class TestAdapter extends Adapter {
    constructor() {
        super(AdapterName);
    }
}