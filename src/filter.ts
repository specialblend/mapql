import { JsonSelector, JsonChild } from "./contract";
import { all, equals, keys } from "rambda";
import { islist, isrecord, isset } from "./util";

export function matches(
  selector: JsonSelector,
  data: JsonChild,
  defaultTo = true
): boolean {
  if (isset(selector)) {
    if (isrecord(selector)) {
      if (isrecord(data)) {
        const childKeys = keys(selector);
        return all((k: string | number) => {
          const childData = selector[k];
          const parentData = data[k];
          return matches(childData, parentData);
        })(childKeys);
      }
      return false;
    }
    return equals(selector, data);
  }
  return defaultTo;
}

export function filter(
  match: JsonSelector = undefined,
  noMatch: JsonSelector = undefined,
  parent: JsonChild,
  child = parent
): any {
  if (!isset(match) && !isset(noMatch)) {
    return child;
  }
  if (islist(parent)) {
    return parent.filter((child) => filter(match, noMatch, child));
  }
  if (matches(match, parent)) {
    if (!matches(noMatch, parent, false)) {
      return child;
    }
  }
}
