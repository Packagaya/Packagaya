/**
 * Caches values in the memory which where fetched by the "fetcher"-function.
 *
 * @export
 * @class InMemoryCache
 */
export class InMemoryCache<T> {
    private cache: Record<string | number, T> = {};

    private fetcherFunction: (key: string) => Promise<T>;

    public constructor(fetcherFunction: (key: string) => Promise<T>) {
        this.fetcherFunction = fetcherFunction;
    }

    public hasEntry(key: string) {
        return Object.keys(this.cache).includes(key);
    }

    public async getEntry(key: string) {
        return this.hasEntry(key) ? this.cache[key] : await this.fetchKey(key);
    }

    public async fetchKey(key: string): Promise<T> {
        try {
            const result = await this.fetcherFunction(key);

            this.cache[key] = result;
            return result;
        } catch (error) {
            throw new Error(`Could not fetch key "${key}": ${error}`);
        }
    }
}
