/**
 * Adds the given entry to the array when it is not included.
 * Otherwise the original array will be returned.
 *
 * @export
 * @param {string[]} array The array which can contain the entry
 * @param {string} entry The entry which is added when the array does not contains it
 * @return {string[]} Returns the updated or original array
 */
export function uniqueStrings(array: string[], entry: string): string[] {
    if (!Array.isArray(array)) {
        throw new Error('First argument is not an array');
    }

    if (typeof entry !== 'string') {
        throw new Error('Second argument is not a string');
    }

    return array.includes(entry) ? array : array.concat(entry);
}
