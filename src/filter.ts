import { JsonSelector, JsonValue } from "./contract";
import { equals, keys } from "rambda";
import { islist, isrecord, isset } from "./util";

export const MATCH_ANY = Symbol("MATCH_ANY");
export const MATCH_NONE = Symbol("MATCH_NONE");

export function matches(selector: JsonSelector, data: JsonValue): boolean {
  if (selector === MATCH_NONE) {
    return false;
  }
  if (selector === MATCH_ANY) {
    return true;
  }
  if (isrecord(selector)) {
    if (isrecord(data)) {
      const childKeys = keys(selector);
      for (const k of childKeys) {
        const childData = selector[k];
        const parentData = data[k];
        if (!matches(childData, parentData)) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  return equals(selector as JsonValue, data as JsonValue);
}

export function filter(
  selector: JsonSelector = MATCH_ANY,
  parent: JsonValue,
  child = parent
): JsonValue | undefined {
  if (islist(parent)) {
    return parent.filter((child) => {
      return filter(selector, child);
    });
  }
  if (matches(selector, parent)) {
    return child;
  }
}

export function reject(
  selector: JsonSelector = MATCH_NONE,
  parent: JsonValue,
  child = parent
): JsonValue | undefined {
  if (isset(parent)) {
    if (islist(parent)) {
      return parent.filter((child) => {
        return !filter(selector, child);
      });
    }
    if (!matches(selector, parent)) {
      return child;
    }
  }
}
