import { JsonList, JsonRecord } from "./contract";
import { ExecInfo } from "graphql-anywhere";

export function isset<T>(x: T | undefined): x is T {
  return typeof x !== "undefined";
}

export function isstring(x: any): x is string {
  return typeof x === "string";
}

export function isnumber(x: any): x is number {
  return typeof x === "number";
}

export function isrecord(x: any): x is JsonRecord {
  return isobj(x) && !islist(x);
}

export function islist(x: any): x is JsonList {
  return Array.isArray(x);
}

export function isobj(x: any): x is object {
  return typeof x === "object" && x !== null;
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
