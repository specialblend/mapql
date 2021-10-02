import { Json, JsonRecord, JsonSelector, JsonValue, MapArgs } from "./contract";
import { DocumentNode } from "graphql";
import graphql, { ExecInfo } from "graphql-anywhere";
import jp from "jsonpath";
import { isset } from "./util";
import { filter, reject } from "./filter";

function shouldExec(args: any, info: any) {
  const {
    isLeaf,
    directives: { map: mapTag },
  } = info;

  const {
    from: pathSelector,
    filter: filterSelector,
    reject: rejectSelector,
  } = args;

  return (
    isLeaf ||
    pathSelector ||
    isset(mapTag) ||
    isset(filterSelector) ||
    isset(rejectSelector)
  );
}

function execPath(pathSelector: string, root: JsonRecord) {
  const [source] = jp.query(root, pathSelector);
  if (typeof source === "object" || source !== null) {
    return source;
  }
  return {};
}

function execFilters(
  filterSelector: JsonSelector,
  rejectSelector: JsonSelector,
  data: JsonValue
) {
  return reject(rejectSelector, filter(filterSelector, data));
}

function exec(
  fieldName: string,
  parent: JsonRecord,
  args: MapArgs,
  context: any,
  info: ExecInfo
) {
  if (shouldExec(args, info)) {
    const {
      from: pathSelector,
      filter: filterSelector,
      reject: rejectSelector,
    } = args;
    const pathName = pathSelector || fieldName;
    const child = execPath(pathName, parent);
    if (isset(filterSelector) || isset(rejectSelector)) {
      return execFilters(filterSelector, rejectSelector, child);
    }
    return child;
  }
  return parent;
}

export function map(query: DocumentNode, data: Json) {
  const [root] = [data];
  function resolve(
    fieldName: any,
    _rootValue: any,
    _args: any,
    _context: any,
    _info: ExecInfo
  ) {
    const { directives: _directives } = _info;
    const rootValue = _rootValue || {};
    const args = _args || {};
    const context = _context || {};
    const directives = _directives || {};
    const info = { ..._info, directives };
    return exec(fieldName, rootValue, args, context, info);
  }
  return graphql(resolve, query, root, data);
}
