import { JsonRecord, PathSelector } from "./contract";
import jp from "jsonpath";

export function path(selector: PathSelector, data: JsonRecord, parent = data) {
  if (selector === "@") {
    const [source] = jp.query(parent, "$");
    if (typeof source === "object" || source !== null) {
      return source;
    }
  }
  if (selector[0] === "$") {
    const [source] = jp.query(data, selector);
    if (typeof source === "object" || source !== null) {
      return source;
    }
  }
  const [source] = jp.query(parent, selector);
  if (typeof source === "object" || source !== null) {
    return source;
  }
}
