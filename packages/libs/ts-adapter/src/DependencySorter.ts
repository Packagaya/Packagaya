import { injectable } from 'inversify';

type NPMConfig = Record<
    string,
    string | boolean | number | Record<string, string>
>;

@injectable()
export class DependencySorter {
    public processNPMConfiguration(configuration: NPMConfig): NPMConfig {
        if (typeof configuration.dependencies === 'object') {
            configuration.dependencies = this.sortDependencies(
                configuration.dependencies,
            );
        }

        if (typeof configuration.devDependencies === 'object') {
            configuration.devDependencies = this.sortDependencies(
                configuration.devDependencies,
            );
        }

        if (typeof configuration.optionalDependencies === 'object') {
            configuration.optionalDependencies = this.sortDependencies(
                configuration.optionalDependencies,
            );
        }

        if (typeof configuration.peerdependencies === 'object') {
            configuration.peerdependencies = this.sortDependencies(
                configuration.peerdependencies,
            );
        }

        return configuration;
    }

    private sortDependencies(
        dependenciesObject: Record<string, string>,
    ): Record<string, string> {
        const packageNames = Object.keys(dependenciesObject).sort();

        return packageNames.reduce(
            (acc, entry) => ({
                ...acc,
                [entry]: dependenciesObject[entry],
            }),
            {},
        );
    }
}
