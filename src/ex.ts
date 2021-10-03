import { ExecInfo } from "graphql-anywhere";
import {
  DirectiveMap,
  Exec,
  ExecData,
  JsonChild,
  JsonRecord,
} from "./contract";
import { path } from "./path";
import { filter } from "./filter";
import { mapDxIds, pipeDx } from "./transform";
import { fixInfo, isset, orEmpty } from "./util";

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

function shouldExPath(args: any, info: ExecInfo) {
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

  const directiveIds = mapDxIds(directiveNodes);

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

function applyEx(fn: (ex: Exec) => any) {
  return function (
    fieldName: string,
    root: any,
    args: any,
    context: any,
    info: any
  ): Exec {
    return fn([
      fieldName,
      orEmpty(root),
      orEmpty(args),
      orEmpty(context),
      fixInfo(info),
    ]);
  };
}

function exPath([fieldName, root, args, context, info]: Exec) {
  return function exPath(data: ExecData) {
    if (shouldExPath(args, info)) {
      const { from: pathSelector } = args;
      const pathName = isset(pathSelector) ? pathSelector : fieldName;
      return path(pathName, data, root);
    }
    return root;
  };
}

function exFilter([fieldName, root, args, context, info, data]: Exec) {
  return function exFilter(child: JsonChild) {
    const { filter: query = { match: undefined, nomatch: undefined } } = args;
    if (isset(query.match) || isset(query.nomatch)) {
      const { from, match, nomatch } = query;
      if (isset(from)) {
        const target = path(from, data as JsonRecord, root as JsonRecord);
        return filter(match, nomatch, target, child);
      }
      return filter(match, nomatch, child);
    }
    return child;
  };
}

function exDirectives([fieldName, root, args, context, info, data]: Exec) {
  const {
    isLeaf,
    directives,
    field: { directives: nodes = [] },
  } = info;
  if (isLeaf || true) {
    return function exDirectives(data: any) {
      const exec = pipeDx(directives as Partial<DirectiveMap>, nodes);
      if (isset(data) || isset(directives.default)) {
        return exec(data);
      }
    };
  }
  return function execNoDirective(result: any) {
    return result;
  };
}

function exConst([fieldName, root, args, context, info]: Exec) {
  return function exConst(data: ExecData) {
    const constValue = isConst(info);
    if (isset(constValue)) {
      return constValue;
    }
  };
}

export function exQuery(data: ExecData) {
  return applyEx(function exec(ex: Exec) {
    const execConst = exConst(ex);
    const execPath = exPath(ex);
    const execFilters = exFilter(ex);
    const execDirectives = exDirectives(ex);
    const constValue = execConst(data);
    if (isset(constValue)) {
      return constValue;
    }
    return execDirectives(execFilters(execPath(data)));
  });
}
