import { JsonSelector, JsonChild } from "./contract";
import { equals, keys } from "rambda";
import { islist, isrecord, isset } from "./util";

export function matches(
  match: JsonSelector,
  data: JsonChild,
  defaultTo = true
): boolean {
  if (!isset(match)) {
    return defaultTo;
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
  return equals(match as JsonChild, data as JsonChild);
}

export function filter(
  match: JsonSelector = undefined,
  nomatch: JsonSelector = undefined,
  parent: JsonChild,
  child = parent
): any {
  if (!isset(match) && !isset(nomatch)) {
    return child;
  }
  if (islist(parent)) {
    return parent.filter((child) => filter(match, nomatch, child));
  }
  if (matches(match, parent)) {
    if (!matches(nomatch, parent, false)) {
      return child;
    }
  }
}
