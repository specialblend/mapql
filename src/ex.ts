import { DirectiveMap, Exec, ExecSource, JsonChild, Maybe } from "./contract";
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

function execPath(source: ExecSource) {
  return function (ex: Exec): Maybe<JsonChild> {
    const { fieldName, root, args, info } = ex;
    if (shouldExPath(ex)) {
      const { from: selector } = args;
      const pathName = isset(selector) ? selector : fieldName;
      return path(pathName, source, root);
    }
    return root;
  };
}

function execFilter(source: ExecSource, child: Maybe<JsonChild>) {
  return function (ex: Exec): Maybe<JsonChild> {
    const { root, args } = ex;
    const { filter: query } = args;
    if (isset(query)) {
      const { from, match, nomatch } = query;
      if (isset(from)) {
        const target = path(from, source, root);
        if (isset(target)) {
          return filter(match, nomatch, target, child);
        }
        return;
      }
      if (isset(child)) {
        return filter(match, nomatch, child);
      }
    }
    return child;
  };
}
function execTransform(child: Maybe<JsonChild>) {
  return function (ex: Exec): any {
    const {
      info: {
        // isLeaf,
        directives,
        field: { directives: nodes = [] },
      },
    } = ex;
    const exec = pipeDx(directives as Partial<DirectiveMap>, nodes);
    if (isset(child) || isset(directives.default)) {
      return exec(child);
    }
  };
}

function execConst(source: ExecSource) {
  return function execConst(ex: Exec) {
    const constValue = isConst(ex);
    if (isset(constValue)) {
      return constValue;
    }
  };
}

export function exQuery(source: ExecSource) {
  return applyEx(function exec(ex: Exec): any {
    const constValue = execConst(source)(ex);
    if (isset(constValue)) {
      return constValue;
    }
    const selected = execPath(source)(ex);
    const filtered = execFilter(source, selected)(ex);
    const transformed = execTransform(filtered)(ex);
    const [result] = [transformed];
    return result;
  });
}
