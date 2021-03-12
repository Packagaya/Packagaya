import { uniqueStrings } from '../stringHelper';

const testString = 'test';

describe('String Helper', () => {
    describe('unique strings', () => {
        it('should not throw an error when the first argument is an array', () => {
            expect(() => {
                uniqueStrings([], '');
            }).not.toThrow('First argument is not an array');
        });

        it('should throw an error when the first argument is not an array', () => {
            expect(() => {
                uniqueStrings({} as any, '');
            }).toThrow('First argument is not an array');
        });

        it('should not throw an error when a string is passed as second argument', () => {
            expect(() => {
                uniqueStrings([], '');
            }).not.toThrow('Second argument is not a string');
        });

        it('should throw an error when the second argument is not a string', () => {
            expect(() => {
                uniqueStrings([], {} as any);
            }).toThrow('Second argument is not a string');
        });

        it('should add the entry when the given array is empty', () => {
            const result = uniqueStrings([], testString);

            expect(result).toHaveLength(1);
            expect(result).toContain(testString);
        });

        it('should not add the entry when the given array already contains the value', () => {
            const result = uniqueStrings([testString], testString);

            expect(result).toHaveLength(1);
            expect(result).toContain(testString);
        });

        it('should add the entry when the given array already contains elements', () => {
            const result = uniqueStrings(['jest-test'], testString);

            expect(result).toHaveLength(2);
            expect(result).toContain(testString);
        });
    });
});
