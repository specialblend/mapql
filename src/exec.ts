import type {
  Exec,
  ExecSource,
  HasConst,
  HasFilter,
  JsonChild,
  Maybe,
} from "./contract";

import { path } from "./path";
import { filter } from "./filter";
import { mapDxIds, pipeDx } from "./transform";
import { fixInfo, isset, orEmpty } from "./util";

function isConst(ex: Exec): ex is HasConst {
  const {
    info: { isLeaf, directives: { const: _const = {} } = {} },
  } = ex;
  return isLeaf && isset(_const.of);
}

function shouldExPath(ex: Exec) {
  const {
    args: { from: pathSelector, filter },
    info: {
      isLeaf,
      directives: { map, nomap },
      field: { directives: directiveNodes = [] },
    },
  } = ex;

  if (isset(nomap)) {
    return false;
  }

  return (
    isLeaf ||
    pathSelector ||
    isset(map) ||
    isset(filter) ||
    mapDxIds(directiveNodes).length
  );
}

function applyEx(fn: (ex: Exec) => any) {
  return function apply(
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

function hasFilter(ex: Exec): ex is HasFilter {
  return isset(ex.args.filter);
}

function execPath(ex: Exec) {
  return function select(data: ExecSource) {
    const {
      fieldName,
      root,
      args: { from, head = true },
    } = ex;
    if (shouldExPath(ex)) {
      const pathName = isset(from) ? from : fieldName;
      return path(pathName, data, root, head);
    }
    return root;
  };
}

function execFilter(ex: Exec) {
  return function (data: ExecSource, child: Maybe<JsonChild>) {
    if (hasFilter(ex)) {
      const {
        root,
        args: {
          filter: { from, match, noMatch },
        },
      } = ex;
      const filterData = filter(match, noMatch);
      if (isset(from)) {
        const target = path(from, data, root);
        if (isset(target)) {
          return filterData(target, child);
        }
        return;
      }
      if (isset(child)) {
        return filterData(child);
      }
    }
    return child;
  };
}

function execTransform(ex: Exec) {
  return function transform(child: Maybe<JsonChild>) {
    const {
      info: {
        directives: { default: { to: fallback } = { to: undefined } },
      },
    } = ex;
    if (isset(child)) {
      return pipeDx(ex)(child);
    }
    return fallback;
  };
}

function execConst(ex: HasConst) {
  const {
    info: {
      directives: {
        const: { of: value },
      },
    },
  } = ex;
  return value;
}

export function exec(data: ExecSource) {
  return applyEx(function exec(ex: Exec): any {
    if (isConst(ex)) {
      return execConst(ex);
    }
    const select = execPath(ex);
    const filter = execFilter(ex);
    const transform = execTransform(ex);
    return transform(filter(data, select(data)));
  });
}
