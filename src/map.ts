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

function shouldExecPath(args: any, info: ExecInfo) {
  const {
    isLeaf,
    directives: { map: mapTag, nomap: noMapTag },
    field: { directives: directiveNodes = [] },
  } = info;

  const {
    from: pathSelector,
    filter: filterSelector,
    reject: rejectSelector,
  } = args;

  const directiveIds = parseDirectiveIds(directiveNodes);

  return (
    !isset(noMapTag) &&
    (isLeaf ||
      pathSelector ||
      isset(mapTag) ||
      isset(filterSelector) ||
      isset(rejectSelector) ||
      directiveIds.length)
  );
}

function execFilter(
  executor: typeof filter | typeof reject,
  query: FilterQuery,
  data: JsonValue,
  parent = data,
  child = parent
) {
  const { from, match } = query;
  if (isset(from)) {
    const target = path(from, data as JsonRecord, parent as JsonRecord);
    return executor(match, target, child);
  }
  return executor(match, child);
}

function execFilters(
  filterQuery: FilterQuery,
  rejectQuery: FilterQuery,
  data: JsonValue,
  parent: JsonValue,
  child: JsonValue
) {
  if (isset(filterQuery.match) || isset(rejectQuery.match)) {
    const result = execFilter(
      filter,
      filterQuery,
      data,
      parent,
      child
    ) as JsonValue;
    if (result) {
      return execFilter(reject, rejectQuery, child, parent, result);
    }
    return result;
  }
  return child;
}

function executes(data: JsonRecord) {
  return function exec(
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
    const execDirectives = executesDirectives(info);
    const {
      from: pathSelector,
      filter: filterQuery = { match: undefined },
      reject: rejectQuery = { match: undefined },
    } = args;

    if (shouldExecPath(args, info)) {
      const pathName = isset(pathSelector) ? pathSelector : fieldName;
      const child = path(pathName, data, parent);
      const result = execFilters(filterQuery, rejectQuery, data, parent, child);
      return execDirectives(result);
    }
    const result = execFilters(filterQuery, rejectQuery, data, parent, parent);
    return execDirectives(result);
  };
}

export function map(query: DocumentNode, data: JsonRecord) {
  const exec = executes(data);
  return graphql(
    (fieldName, root, args, context, info) =>
      exec(fieldName, root, orEmpty(args), context, fixInfo(info)),
    query,
    data,
    data
  );
}
