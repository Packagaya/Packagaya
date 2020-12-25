import { FeatureFlag } from '@packagaya/adapter/dist/FeatureFlag';
import { inject, injectable } from 'inversify';
import { Logger } from 'tslog';

/**
 * Defines the "sync-ts-paths" feature flag
 *
 * @export
 * @class SyncTSPathsFlag
 * @extends {FeatureFlag}
 */
@injectable()
export class SyncTSPathsFlag extends FeatureFlag {
    /**
     * Creates an instance of SyncTSPathsFlag.
     * @param {Logger} logger The logger which should be used to log messages
     * @memberof SyncTSPathsFlag
     */
    constructor(@inject(Logger) private logger: Logger) {
        super('sync-ts-paths', true);
    }

    /**
     * @inheritdoc
     * @return {string[]}
     * @memberof SyncTSPathsFlag
     */
    public async getDifferences(
        projectSpecification: IConfig,
    ): Promise<string[]> {
        this.logger.info('Checking for TS paths differences');

        return [];
    }

    /**
     * @inheritdoc
     * @return {boolean}
     * @memberof SyncTSPathsFlag
     */
    public async fixDifferences(
        projectSpecification: IConfig,
    ): Promise<boolean> {
        return true;
    }
}
