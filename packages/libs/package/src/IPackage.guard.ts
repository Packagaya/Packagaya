/*
 * Generated type guards for "IPackage.ts".
 * WARNING: Do not manually change this file.
 */
import { IDependency, IPackage } from './IPackage';
import { PackageType } from './PackageType';

export function isIDependency(
    obj: any,
    _argumentName?: string,
): obj is IDependency {
    return (
        (((obj !== null && typeof obj === 'object') ||
            typeof obj === 'function') &&
            typeof obj.name === 'string' &&
            typeof obj.version === 'string' &&
            Array.isArray(obj.dependencies) &&
            obj.dependencies.every((e: any) => isIDependency(e) as boolean) &&
            Array.isArray(obj.devDependencies) &&
            obj.devDependencies.every(
                (e: any) => isIDependency(e) as boolean,
            )) ||
        (((obj !== null && typeof obj === 'object') ||
            typeof obj === 'function') &&
            typeof obj.name === 'string' &&
            typeof obj.version === 'string' &&
            Array.isArray(obj.dependencies) &&
            obj.dependencies.every((e: any) => isIDependency(e) as boolean) &&
            Array.isArray(obj.devDependencies) &&
            obj.devDependencies.every((e: any) => isIDependency(e) as boolean))
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
        Array.isArray(obj.dependencies) &&
        obj.dependencies.every((e: any) => isIDependency(e) as boolean) &&
        Array.isArray(obj.devDependencies) &&
        obj.devDependencies.every((e: any) => isIDependency(e) as boolean)
    );
}
