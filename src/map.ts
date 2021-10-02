import { Json } from "./contract";
import { DocumentNode } from "graphql";
import graphql, { ExecInfo } from "graphql-anywhere";
import jp from "jsonpath";
import { isset } from "./util";

function exec(
  _fieldName: string,
  _parent: Json,
  _args: any,
  _data: Json,
  _info: ExecInfo
) {
  const { directives: _directives } = _info;
  const directives = _directives || {};
  const args = _args || {};
  const { root: isRoot } = directives;
  if (isset(isRoot)) {
    return _parent;
  }
  const { from: sourcePath } = args;
  if (sourcePath) {
    const [source] = jp.query(_parent, sourcePath);
    if (typeof source === "object" || source !== null) {
      return source;
    }
  }
  return _parent[_fieldName];
}

export function map(query: DocumentNode, data: Json) {
  return graphql(exec, query, data, data);
}
