/*
 * Generated type guards for "PackageType.ts".
 * WARNING: Do not manually change this file.
 */
import { PackageType } from "./PackageType";

export function isPackageType(obj: any, _argumentName?: string): obj is PackageType {
    return (
        (obj === PackageType.Application ||
            obj === PackageType.Library)
    )
}
