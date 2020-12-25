/*
 * Generated type guards for "IPackage.ts".
 * WARNING: Do not manually change this file.
 */
import { IDependency, IPackage } from './IPackage';
import { PackageType } from './PackageType';

export function isRecord(obj: any, _argumentName?: string): obj is IDependency {
    return (
        (obj !== null && typeof obj === 'object') || typeof obj === 'function'
    );
}

export function isIPackage(obj: any, _argumentName?: string): obj is IPackage {
    return (
        ((obj !== null && typeof obj === 'object') ||
            typeof obj === 'function') &&
        typeof obj.id === 'string' &&
        typeof obj.name === 'string' &&
        typeof obj.version === 'string' &&
        (obj.packageType === PackageType.Application ||
            obj.packageType === PackageType.Library) &&
        typeof obj.path === 'string' &&
        (isRecord(obj.dependencies) as boolean) &&
        (isRecord(obj.devDependencies) as boolean)
    );
}
