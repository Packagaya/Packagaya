/*
 * Generated type guards for "INPMConfig.ts".
 * WARNING: Do not manually change this file.
 */
import { INPMConfig } from "./INPMConfig";

export function isNPMConfig(obj: any, _argumentName?: string): obj is INPMConfig {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function") &&
        typeof obj.name === "string" &&
        typeof obj.version === "string" &&
        typeof obj.main === "string" &&
        (obj.config !== null &&
            typeof obj.config === "object" ||
            typeof obj.config === "function") &&
        (obj.config.packagaya !== null &&
            typeof obj.config.packagaya === "object" ||
            typeof obj.config.packagaya === "function") &&
        Array.isArray(obj.config.packagaya.containerBindings) &&
        obj.config.packagaya.containerBindings.every((e: any) =>
            typeof e === "string"
        )
    )
}
