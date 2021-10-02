import { JsonSelector, JsonValue } from "./contract";
import { islist, isrecord, isset } from "./util";
import { equals, keys, pick } from "rambda";

export const MATCH_ANY = Symbol("MATCH_ANY");
export const MATCH_NONE = Symbol("MATCH_NONE");

export function matches(selector: JsonSelector, data: JsonValue): boolean {
  if (selector === MATCH_NONE) {
    return false;
  }
  if (selector === MATCH_ANY) {
    return true;
  }
  if (isrecord(data)) {
    const selectorKeys = keys(selector);
    const subdata = pick(selectorKeys, data);
    return equals(selector, subdata);
  }
  return equals(selector, data);
}

export function filter(
  selector: JsonSelector = MATCH_ANY,
  root: JsonValue
): JsonValue | undefined {
  if (islist(root)) {
    return root.filter((child) => {
      return filter(selector, child);
    });
  }
  if (matches(selector, root)) {
    return root;
  }
}

export function reject(
  selector: JsonSelector = MATCH_NONE,
  root: JsonValue
): JsonValue | undefined {
  if (isset(root)) {
    if (islist(root)) {
      return root.filter((child) => {
        return !filter(selector, child);
      });
    }
    if (!matches(selector, root)) {
      return root;
    }
  }
}
