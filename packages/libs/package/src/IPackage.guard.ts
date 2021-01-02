/*
 * Generated type guards for "IPackage.ts".
 * WARNING: Do not manually change this file.
 */
import { PackageType } from './PackageType';
import { IPackage } from './IPackage';

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
        ((obj.dependencies !== null && typeof obj.dependencies === 'object') ||
            typeof obj.dependencies === 'function') &&
        ((obj.devDependencies !== null &&
            typeof obj.devDependencies === 'object') ||
            typeof obj.devDependencies === 'function')
    );
}
