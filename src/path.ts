import { JsonRecord, PathSelector } from "./contract";
import jp from "jsonpath";

export function path(selector: PathSelector, root: JsonRecord, data = root) {
  if (selector === "@") {
    const [source] = jp.query(root, "$");
    if (typeof source === "object" || source !== null) {
      return source;
    }
    return {};
  }
  if (selector[0] === "$") {
    const [source] = jp.query(data, selector);
    if (typeof source === "object" || source !== null) {
      return source;
    }
    return {};
  }
  const [source] = jp.query(root, selector);
  if (typeof source === "object" || source !== null) {
    return source;
  }
}
