import { JsonRecord, PathSelector } from "./contract";
import jp from "jsonpath";

export function path(match: PathSelector, data: JsonRecord, parent = data) {
  if (match === "@") {
    const [source] = jp.query(parent, "$");
    if (typeof source === "object" || source !== null) {
      return source;
    }
  }
  if (match[0] === "$") {
    const [source] = jp.query(data, match);
    if (typeof source === "object" || source !== null) {
      return source;
    }
  }
  const [source] = jp.query(parent, match);
  if (typeof source === "object" || source !== null) {
    return source;
  }
}
