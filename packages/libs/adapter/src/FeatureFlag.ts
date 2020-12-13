import { injectable, unmanaged } from 'inversify';

/**
 * FeatureFlag.
 */
@injectable()
export abstract class FeatureFlag {
    /**
     * Constructs a new instance of a feature flag
     * @param {string} name The name of the feature flag
     * @param {boolean} fixable Indicates if the feature flag is fixable
     * @protected
     */
    /**
     * constructor.
     *
     * @param {string} name
     * @param {boolean} fixable
     */
    protected constructor(
        @unmanaged() public readonly name: string,
        @unmanaged() public readonly fixable: boolean,
    ) {
    }

    /**
     * Returns all differences (for example between the configuration files)
     */
    /**
     * getDifferences.
     *
     * @returns {string[]}
     */
    public abstract getDifferences(): string[];

    /**
     * Fixes all differences. This method gets only executed when the "fixable"
     * property equals true
     */
    /**
     * fixDifferences.
     *
     * @returns {boolean}
     */
    public abstract fixDifferences(): boolean;
}
