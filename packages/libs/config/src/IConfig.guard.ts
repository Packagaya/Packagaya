/*
 * Generated type guards for "IConfig.ts".
 * WARNING: Do not manually change this file.
 */
import { IConfig } from "./IConfig";

export function isIConfig(obj: any, _argumentName?: string): obj is IConfig {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function") &&
        Array.isArray(obj.apps) &&
        obj.apps.every((e: any) =>
            typeof e === "string"
        ) &&
        Array.isArray(obj.libs) &&
        obj.libs.every((e: any) =>
            typeof e === "string"
        ) &&
        Array.isArray(obj.adapters) &&
        obj.adapters.every((e: any) =>
            typeof e === "string"
        ) &&
        Array.isArray(obj.features) &&
        obj.features.every((e: any) =>
            typeof e === "string"
        )
    )
}
