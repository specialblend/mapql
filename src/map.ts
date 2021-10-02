import { Json, JsonRecord } from "./contract";
import { DocumentNode } from "graphql";
import graphql, { ExecInfo } from "graphql-anywhere";
import jp from "jsonpath";
import { isset } from "./util";
import { filter, reject, MATCH_ANY, MATCH_NONE } from "./filter";

function execPath(pathSelector: string, root: JsonRecord) {
  const [source] = jp.query(root, pathSelector);
  if (typeof source === "object" || source !== null) {
    return source;
  }
}

function exec(
  _fieldName: string,
  root: JsonRecord,
  _args: any,
  _data: Json,
  _info: ExecInfo
) {
  const { isLeaf, directives: _directives } = _info;
  const directives = _directives || {};
  const args = _args || {};

  const {
    from: pathSelector,
    filter: filterSelector,
    reject: rejectSelector,
  } = args;

  const { map: mapTag } = directives;

  const shouldExec =
    isLeaf ||
    pathSelector ||
    isset(mapTag) ||
    isset(filterSelector) ||
    isset(rejectSelector);

  if (shouldExec) {
    const pathName = pathSelector || _fieldName;
    const child = execPath(pathName, root);
    return reject(rejectSelector, filter(filterSelector, child));
  }
  return root;
}

export function map(query: DocumentNode, data: Json) {
  const [root] = [data];
  return graphql(exec, query, root, data);
}
