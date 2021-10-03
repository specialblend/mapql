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

function executesFilter(executor: typeof filter | typeof reject) {
  return function execFilter(
    query: FilterQuery,
    parent: JsonValue,
    child: JsonValue,
    data = child
  ) {
    const { from, selector } = query;
    if (isset(from)) {
      const target = path(from, parent as JsonRecord, data as JsonRecord);
      return executor(selector, target, child);
    }
    return executor(selector, child);
  };
}

function execFilters(
  filterQuery: FilterQuery,
  rejectQuery: FilterQuery,
  parent: JsonValue,
  child: JsonValue,
  data = child
) {
  if (isset(filterQuery.selector) || isset(rejectQuery.selector)) {
    const execFilter = executesFilter(filter);
    const execReject = executesFilter(reject);
    const result = execFilter(filterQuery, parent, child, data) as JsonValue;
    if (result) {
      return execReject(rejectQuery, parent, result);
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
      filter: filterQuery = { selector: undefined },
      reject: rejectQuery = { selector: undefined },
    } = args;

    if (shouldMap(args, info)) {
      const pathName = isset(pathSelector) ? pathSelector : fieldName;
      const child = path(pathName, parent, data);
      const result = execFilters(filterQuery, rejectQuery, parent, child, data);
      return execDirectives(result);
    }
    const result = execFilters(filterQuery, rejectQuery, parent, parent, data);
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
