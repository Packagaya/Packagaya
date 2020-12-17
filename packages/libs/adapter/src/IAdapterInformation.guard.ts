/*
 * Generated type guards for "IAdapterInformation.ts".
 * WARNING: Do not manually change this file.
 */
import { IAdapterInformation } from "./IAdapterInformation";

export function isIAdapterInformation(obj: any, _argumentName?: string): obj is IAdapterInformation {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function") &&
        typeof obj.name === "string" &&
        typeof obj.version === "string" &&
        typeof obj.adapterDirectoryPath === "string" &&
        typeof obj.main === "string" &&
        Array.isArray(obj.containerBindings) &&
        obj.containerBindings.every((e: any) =>
            typeof e === "string"
        )
    )
}
