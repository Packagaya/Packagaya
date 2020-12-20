import { inject, injectable, multiInject } from 'inversify';
import { Logger } from 'tslog';

import { Adapter } from './Adapter';
import { FeatureFlag } from './FeatureFlag';

@injectable()
export class FeatureFlagManager {
    /**
     * Contains all the feature flags from the adapters
     *
     * @private
     */
    private featureFlags: FeatureFlag[];

    /**
     * Creates a new instance of the feature flag manager
     *
     * @param {Logger} logger The logger which should be used to log messages
     * @param {Adapter[]} adapters The loaded adapters which are specified in the configuration file
     */
    constructor(
        @inject(Logger) private logger: Logger,
        @multiInject(Adapter) adapters: Adapter[],
    ) {
        this.featureFlags = adapters.reduce<FeatureFlag[]>(
            (acc, entry) => [...acc, ...entry.featureFlags],
            [],
        );
    }

    /**
     * Runs the feature flags by the given names and fixes them when needed
     *
     * @param {string[]} flagNames The names of the flags
     * @param {boolean} fix Indicates if the feature flags should be fixed
     */
    public async runFeatureFlags(flagNames: string[], fix: boolean = false) {
        const availableFlags = flagNames
            .map((flag) => (flag.startsWith('--') ? flag.substr(2) : flag))
            .map((flag) =>
                this.featureFlags.find((entry) => entry.name === flag),
            )
            .filter((flag) => typeof flag !== 'undefined') as FeatureFlag[];

        const differences: string[] = [];

        for (const availableFlag of availableFlags) {
            differences.push(...(await availableFlag.getDifferences()));
        }

        differences.forEach((diff) => console.log(diff));

        if (!fix) {
            return;
        }

        const fixableFlags = availableFlags.filter((flag) => flag.fixable);

        for (const fixableFlag of fixableFlags) {
            const fixResult = await fixableFlag.fixDifferences();
            if (!fixResult) {
                this.logger.warn(`Could not fix flag: ${fixableFlag.name}`);
            }
        }
    }
}
