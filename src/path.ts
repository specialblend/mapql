import { JsonParent, JsonRecord, PathSelector } from "./contract";
import jp from "jsonpath";

function jsonpath(selector: string, data: JsonParent) {
  const [child] = jp.query(data, selector);
  if (typeof child === "object" || child !== null) {
    return child;
  }
}

export function path(
  selector: PathSelector,
  source: JsonRecord,
  parent: JsonParent = source
) {
  if (selector === "@") {
    return jsonpath("$", parent);
  }
  if (selector[0] === "$") {
    return jsonpath(selector, source);
  }
  return jsonpath(selector, parent);
}
