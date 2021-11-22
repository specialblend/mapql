import type {
  JsonChild,
  JsonParent,
  JsonRecord,
  Maybe,
  PathSelector,
} from "./contract";

import jp from "jsonpath";

function jsonpath(
  selector: string,
  data: JsonParent,
  head = true
): Maybe<JsonChild> {
  const result = jp.query(data, selector);
  const [first] = result;
  if (head) {
    return first;
  }
  return result;
}

export function path(
  selector: PathSelector,
  source: JsonRecord,
  parent: JsonParent = source,
  head = true
): Maybe<JsonChild> {
  if (selector === "@") {
    return jsonpath("$", parent);
  }
  if (selector[0] === "$") {
    return jsonpath(selector, source, head);
  }
  return jsonpath(selector, parent, head);
}
