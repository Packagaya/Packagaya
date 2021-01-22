import { IConfig } from '@packagaya/config/dist/IConfig';
import { Change } from 'diff';
import { injectable, unmanaged } from 'inversify';

export interface IDifference {
    filePath: string;
    changes: Change[];
}

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
    protected constructor(
        @unmanaged() public readonly name: string,
        @unmanaged() public readonly fixable: boolean,
    ) {}

    /**
     * Returns all differences (for example between the configuration files)
     *
     * @param {IConfig} projectSpecification The project configuration
     * @param {Record<string, unknown> | undefined} configuration The configuration for the feature flag
     * @returns {string[]}
     */
    public abstract getDifferences(
        projectSpecification: IConfig,
        configuration?: Record<string, unknown>,
    ): Promise<IDifference[]>;

    /**
     * Fixes all differences. This method gets only executed when the "fixable"
     * property equals true
     *
     * @param {IConfig} projectSpecification The project configuration
     * @param {Record<string, unknown> | undefined} configuration The configuration for the feature flag
     * @returns {Promise<boolean>} Returns true when the fixed could be applied successfully
     */
    public abstract fixDifferences(
        projectSpecification: IConfig,
        configuration?: Record<string, unknown>,
    ): Promise<boolean>;
}
