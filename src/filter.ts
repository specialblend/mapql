import { JsonSelector, JsonChild } from "./contract";
import { all, equals, keys } from "rambda";
import { islist, isrecord, isset } from "./util";

export function matches(
  selector: JsonSelector,
  data: JsonChild,
  _default = true
): boolean {
  if (isset(selector)) {
    if (isrecord(selector)) {
      if (isrecord(data)) {
        return all((k) => matches(selector[k], data[k]), keys(selector));
      }
      return false;
    }
    return equals(selector, data);
  }
  return _default;
}

export function filter(
  match: JsonSelector = undefined,
  noMatch: JsonSelector = undefined
) {
  return function filter(parent: JsonChild, child = parent): any {
    if (!isset(match) && !isset(noMatch)) {
      return child;
    }
    if (islist(parent)) {
      return parent.filter((child) => filter(child));
    }
    if (matches(match, parent) && !matches(noMatch, parent, false)) {
      return child;
    }
  };
}
