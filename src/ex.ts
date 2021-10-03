import { ExecInfo } from "graphql-anywhere";

import {
  DirectiveMap,
  Exec,
  ExecSource,
  JsonChild,
  JsonRecord,
} from "./contract";

import { path } from "./path";
import { filter } from "./filter";
import { mapDxIds, pipeDx } from "./transform";
import { fixInfo, isset, orEmpty } from "./util";

function isConst(ex: Exec): any {
  const {
    info: {
      isLeaf,
      directives: { const: constTag },
    },
  } = ex;
  if (isLeaf && constTag) {
    const { of: constValue } = constTag;
    if (isset(constValue)) {
      return constValue;
    }
  }
}

function shouldExPath(ex: Exec) {
  const {
    args: { from: pathSelector, filter: filterSelector },
    info: {
      isLeaf,
      directives: { map: mapTag, nomap: noMapTag },
      field: { directives: directiveNodes = [] },
    },
  } = ex;

  const directiveIds = mapDxIds(directiveNodes);

  return (
    !isset(noMapTag) &&
    (isLeaf ||
      pathSelector ||
      isset(mapTag) ||
      isset(filterSelector) ||
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
    return fn({
      fieldName,
      root: orEmpty(root),
      args: orEmpty(args),
      context: orEmpty(context),
      info: fixInfo(info),
    });
  };
}

function execPath(ex: Exec) {
  const { fieldName, root, args, info } = ex;
  return function exPath(source: ExecSource) {
    if (shouldExPath(ex)) {
      const { from: pathSelector } = args;
      const pathName = isset(pathSelector) ? pathSelector : fieldName;
      return path(pathName, source, root);
    }
    return root;
  };
}

function execFilter(ex: Exec) {
  const { root, args } = ex;
  return function exFilter(source: ExecSource, child: JsonChild) {
    const { filter: query = { match: undefined, nomatch: undefined } } = args;
    if (isset(query.match) || isset(query.nomatch)) {
      const { from, match, nomatch } = query;
      if (isset(from)) {
        const target = path(from, source, root);
        return filter(match, nomatch, target, child);
      }
      return filter(match, nomatch, child);
    }
    return child;
  };
}

function execTransform(ex: Exec) {
  const {
    info: {
      // isLeaf,
      directives,
      field: { directives: nodes = [] },
    },
  } = ex;
  return function (data: any) {
    const exec = pipeDx(directives as Partial<DirectiveMap>, nodes);
    if (isset(data) || isset(directives.default)) {
      return exec(data);
    }
  };
}

function execConst(ex: Exec) {
  return function exConst(data: ExecSource) {
    const constValue = isConst(ex);
    if (isset(constValue)) {
      return constValue;
    }
  };
}

export function exQuery(source: ExecSource) {
  return applyEx(function exec(ex: Exec) {
    const constValue = execConst(ex)(source);
    if (isset(constValue)) {
      return constValue;
    }
    const selected = execPath(ex)(source);
    const filtered = execFilter(ex)(source, selected);
    const transformed = execTransform(ex)(filtered);
    const [result] = [transformed];
    return result;
  });
}
