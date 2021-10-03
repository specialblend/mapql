import { FilterQuery, JsonRecord, JsonValue, MapArgs } from "./contract";
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
function executesFilters(
  args: Partial<MapArgs>,
  data: JsonValue,
  parent: JsonValue
) {
  return function execFilters(child: JsonValue) {
    const {
      filter: filterQuery = { match: undefined },
      reject: rejectQuery = { match: undefined },
    } = args;
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
  };
}

function executesPath(
  fieldName: string,
  args: MapArgs,
  context: any,
  info: ExecInfo,
  data: JsonRecord
) {
  return function execPath(parent = data) {
    if (shouldExecPath(args, info)) {
      const { from: pathSelector } = args;
      const pathName = isset(pathSelector) ? pathSelector : fieldName;
      return path(pathName, data, parent);
    }
    return parent;
  };
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
    const execPath = executesPath(fieldName, args, context, info, data);
    const execFilters = executesFilters(args, data, parent);
    const execDirectives = executesDirectives(info);
    return execDirectives(execFilters(execPath(parent)));
  };
}

export function map(query: DocumentNode, data: JsonRecord) {
  const exec = executes(data);
  return graphql(
    (fieldName, root, args, context, info) =>
      exec(
        fieldName,
        orEmpty(root),
        orEmpty(args),
        orEmpty(context),
        fixInfo(info)
      ),
    query,
    data,
    data
  );
}
