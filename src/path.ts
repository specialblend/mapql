import {
  JsonChild,
  JsonParent,
  JsonRecord,
  Maybe,
  PathSelector,
} from "./contract";
import jp from "jsonpath";
import { isset } from "./util";

function jsonpath(selector: string, data: JsonParent): Maybe<JsonChild> {
  try {
    const [child] = jp.query(data, selector);
    if (isset(child)) {
      return child;
    }
  } catch (err) {
    throw err;
  }
}

export function path(
  selector: PathSelector,
  source: JsonRecord,
  parent: JsonParent = source
): Maybe<JsonChild> {
  if (selector === "@") {
    return jsonpath("$", parent);
  }
  if (selector[0] === "$") {
    return jsonpath(selector, source);
  }
  return jsonpath(selector, parent);
}
