import { JsonList, JsonRecord } from "./contract";
import { ExecInfo } from "graphql-anywhere";

export function isset<T>(x: T | undefined): x is T {
  return typeof x !== "undefined";
}

export function isrecord(x: any): x is JsonRecord {
  return typeof x === "object" && x !== null;
}

export function islist(x: any): x is JsonList {
  return Array.isArray(x);
}

export function orEmpty(x: any) {
  return x || {};
}

export function fixInfo(info: ExecInfo): ExecInfo {
  return {
    ...info,
    directives: orEmpty(info.directives),
  };
}
