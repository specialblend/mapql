import type { DocumentNode } from "graphql";
import type { ExecInfo } from "graphql-anywhere";
import type { Json, MapArgs } from "./contract";

import graphql from "graphql-anywhere";
import jp from "jsonpath";
import execDirectives from "./directives";

function _from(defaultTo: any, pathName: string, data: any) {
  const [result = defaultTo] = jp.query(data, pathName);
  return result;
}

function isset<T>(x: T | undefined): x is T {
  return typeof x !== "undefined";
}

function execArgs(root: Json, args: MapArgs, data: Json) {
  const { from, fromConst, fromRoot, defaultTo } = args;
  if (isset(fromConst)) {
    return fromConst;
  }
  if (isset(fromRoot)) {
    return _from(defaultTo, fromRoot, data);
  }
  if (isset(from)) {
    return _from(defaultTo, from, root);
  }
}

function resolve(
  fieldName: string,
  root: Json,
  args: MapArgs,
  data: Json,
  info: ExecInfo
) {
  const {
    isLeaf,
    directives: directiveInfo,
    field: { directives: directiveNodes = [] },
  } = info;
  const _execDirectives = execDirectives(directiveInfo, directiveNodes, isLeaf);
  if (isset(args)) {
    const child = execArgs(root, args, data);
    return _execDirectives(child);
  }
  const child = root[fieldName];
  if (isset(child)) {
    return _execDirectives(child);
  }
  return _execDirectives(root);
}

export default function map(query: DocumentNode, data: Json) {
  return graphql(resolve, query, data, data);
}
