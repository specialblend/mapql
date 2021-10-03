import { JsonSelector, JsonValue } from "./contract";
import { equals, keys } from "rambda";
import { islist, isrecord, isset } from "./util";

export const MATCH_ANY = Symbol("MATCH_ANY");
export const MATCH_NONE = Symbol("MATCH_NONE");

export function matches(match: JsonSelector, data: JsonValue): boolean {
  if (match === MATCH_NONE) {
    return false;
  }
  if (match === MATCH_ANY) {
    return true;
  }
  if (isrecord(match)) {
    if (isrecord(data)) {
      const childKeys = keys(match);
      for (const k of childKeys) {
        const childData = match[k];
        const parentData = data[k];
        if (!matches(childData, parentData)) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  return equals(match as JsonValue, data as JsonValue);
}

export function filter(
  match: JsonSelector = MATCH_ANY,
  nomatch: JsonSelector = MATCH_NONE,
  parent: JsonValue,
  child = parent
): any {
  if (islist(parent)) {
    return parent.filter((child) =>
      filter(
        //
        match,
        nomatch,
        child
      )
    );
  }
  if (matches(match, parent)) {
    if (!matches(nomatch, parent)) {
      return child;
    }
  }
}

// export function reject(
//   match: JsonSelector = MATCH_NONE,
//   parent: JsonValue,
//   child = parent
// ): JsonValue | undefined {
//   if (isset(parent)) {
//     if (islist(parent)) {
//       return parent.filter((child) => {
//         return !filter(match, child);
//       });
//     }
//     if (!matches(match, parent)) {
//       return child;
//     }
//   }
// }
