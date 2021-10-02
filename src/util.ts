import { JsonList, JsonRecord } from "./contract";

export function isset<T>(x: T | undefined): x is T {
  return typeof x !== "undefined";
}

export function isrecord(x: any): x is JsonRecord {
  return typeof x === "object" && x !== null;
}

export function islist(x: any): x is JsonList {
  return Array.isArray(x);
}
