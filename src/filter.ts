import { JsonSelector, JsonValue } from "./contract";
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
      for (const key of Object.keys(selector)) {
        if (data[key] !== selector[key]) {
          return false;
        }
      }
      return true;
    }
  }
  if (isrecord(data)) {
    return false;
  }
  return data === selector;
}

export function filter(
  selector: JsonSelector = MATCH_ANY,
  root: JsonValue | undefined
): JsonValue | undefined {
  if (isset(root)) {
    if (islist(root)) {
      return root.filter((child) => {
        return filter(selector, child);
      });
    }
    if (matches(selector, root)) {
      return root;
    }
  }
}

export function reject(
  selector: JsonSelector = MATCH_NONE,
  root: JsonValue | undefined
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
