/**
 * Defines the type of a dependency
 * The following dependency types are available
 * - used in production
 * - used while developing
 * - optional dependencies
 * - peer dependencies (dependencies which should be defined by the using package)
 *
 * @export
 */
export enum DependencyType {
    Dependency = 'Dependency',
    DevelopmentDependency = 'Development dependency',
    OptionalDependency = 'Optional dependency',
    PeerDependency = 'Peer dependency',
}
