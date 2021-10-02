import { JsonRecord } from "./contract";
import jp from "jsonpath";

export function path(selector: string, root: JsonRecord) {
  const [source] = jp.query(root, selector);
  if (typeof source === "object" || source !== null) {
    return source;
  }
  return {};
}
