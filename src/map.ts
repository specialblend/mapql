import { Json, JsonRecord, JsonSelector, JsonValue, MapArgs } from "./contract";
import { DocumentNode } from "graphql";
import graphql, { ExecInfo } from "graphql-anywhere";
import { fixInfo, isset, orEmpty } from "./util";
import { filter, reject } from "./filter";
import { path } from "./path";

function shouldMap(args: any, info: any) {
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

function execFilters(
  filterSelector: JsonSelector,
  rejectSelector: JsonSelector,
  data: JsonValue
) {
  const result = filter(filterSelector, data);
  if (result) {
    return reject(rejectSelector, result);
  }
}

function exec(
  fieldName: string,
  parent: JsonRecord,
  args: MapArgs,
  context: any,
  info: ExecInfo
) {
  if (shouldMap(args, info)) {
    const {
      from: pathSelector,
      filter: filterSelector,
      reject: rejectSelector,
    } = args;
    const pathName = pathSelector || fieldName;
    const child = path(pathName, parent);
    if (isset(filterSelector) || isset(rejectSelector)) {
      return execFilters(filterSelector, rejectSelector, child);
    }
    return child;
  }
  return parent;
}

export function map(query: DocumentNode, data: Json) {
  return graphql(
    (fieldName, root, args, context, info) =>
      exec(fieldName, root, orEmpty(args), context, fixInfo(info)),
    query,
    data
  );
}
