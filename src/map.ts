import { FilterQuery, Json, JsonRecord, JsonValue, MapArgs } from "./contract";
import { DocumentNode } from "graphql";
import graphql, { ExecInfo } from "graphql-anywhere";
import { fixInfo, isset, orEmpty } from "./util";
import { filter, reject } from "./filter";
import { path } from "./path";
import { executesDirectives, parseDirectiveIds } from "./transform";

function isConst(info: ExecInfo): any {
  const {
    isLeaf,
    directives: { const: constTag },
  } = info;
  if (isLeaf && constTag) {
    const { of: constValue } = constTag;
    if (isset(constValue)) {
      return constValue;
    }
  }
}

function shouldMap(args: any, info: ExecInfo) {
  const {
    isLeaf,
    directives: { map: mapTag },
    field: { directives: directiveNodes = [] },
  } = info;

  const {
    from: pathSelector,
    filter: filterSelector,
    reject: rejectSelector,
  } = args;

  const directiveIds = parseDirectiveIds(directiveNodes);

  return (
    isLeaf ||
    pathSelector ||
    isset(mapTag) ||
    isset(filterSelector) ||
    isset(rejectSelector) ||
    directiveIds.length
  );
}

function executesFilter(executor: typeof filter | typeof reject) {
  return function execFilter(
    query: FilterQuery,
    parent: JsonValue,
    child: JsonValue
  ) {
    const { from, selector } = query;
    if (from) {
      const target = path(from, parent as JsonRecord);
      return filter(selector, target, child);
    }
    return filter(selector, child);
  };
}

function execFilters(
  filterQuery: FilterQuery,
  rejectQuery: FilterQuery,
  parent: JsonValue,
  child: JsonValue
) {
  const execFilter = executesFilter(filter);
  const execReject = executesFilter(reject);
  return execReject(
    rejectQuery,
    parent,
    execFilter(filterQuery, parent, child) as JsonValue
  );
}

function exec(
  fieldName: string,
  parent: JsonRecord,
  args: MapArgs,
  context: any,
  info: ExecInfo
) {
  const constValue = isConst(info);
  if (isset(constValue)) {
    return constValue;
  }
  if (shouldMap(args, info)) {
    const execDirectives = executesDirectives(info);
    const {
      from: pathSelector,
      filter: filterQuery = { selector: undefined },
      reject: rejectQuery = { selector: undefined },
    } = args;
    const pathName = pathSelector || fieldName;
    const child = path(pathName, parent);
    if (isset(filterQuery) || isset(rejectQuery)) {
      return execFilters(filterQuery, rejectQuery, parent, child);
    }
    return execDirectives(child);
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
