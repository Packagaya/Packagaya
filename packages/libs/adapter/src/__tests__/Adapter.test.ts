import { Adapter } from '../Adapter';
import { AdapterName, TestAdapter } from './TestAdapter';

describe('Adapter', function() {
    it('should be defined', function() {
        expect(Adapter).toBeDefined();
    });

    it('should have a name', function() {
        const testAdapter = new TestAdapter();

        expect(testAdapter.name).toEqual(AdapterName);
    });

    it('should have feature flags', () => {
        const testAdapter = new TestAdapter();

        expect(testAdapter.featureFlags).toHaveLength(0);
    });
});