import { DirectiveNode } from "graphql";
import { DirectiveId, Exec, JsonRecord } from "./contract";
import {
  defaultTo,
  has,
  head,
  identity,
  init,
  last,
  not,
  of,
  path,
  pipe,
  prop,
  tail,
} from "rambda";

export const DIRECTIVES: Record<string, CallableFunction> = {
  parseInt: () => (x: string) => parseInt(x),
  parseFloat: () => (x: string) => parseFloat(x),
  String: () => (x: any) => String(x),
  Boolean: () => (x: any) => Boolean(x),
  toJson: () => (x: any) => JSON.stringify(x),
  fromJson: () => (x: any) => parseJson(x),
  not: () => not,
  of: () => of,
  default: (args: any) => defaultTo(args.to),
  concat: concatStr,
  substr: substr, // TODO unit test
  slice: slice, // TODO unit test
  add: withx((x: number) => (y: number) => y + x), // TODO unit test
  sub: withx((x: number) => (y: number) => y - x), // TODO unit test
  mul: withx((x: number) => (y: number) => y * x), // TODO unit test
  head: (args?: any) => head, // TODO unit test
  init: (args?: any) => init, // TODO unit test
  tail: (args?: any) => tail, // TODO unit test
  last: (args?: any) => last, // TODO unit test
  prop: (args?: any) => prop(args._), // TODO unit test
  path: (args?: any) => path(args._), // TODO unit test
};

function withx(fn: CallableFunction) {
  return function (args: any) {
    if (args.x) {
      return fn(args.x);
    }
    return () => identity;
  };
}

function parseJson(x: any) {
  try {
    return JSON.parse(String(x));
  } catch (err) {}
}

function concatStr(args: Record<string, any>) {
  const { before = "", after = "" } = args;
  return function (str: string) {
    return String(before) + String(str) + String(after);
  };
}

function substr(args: any) {
  return function substr(str: string) {
    const { from = 0, len = str.length } = args;
    return str.substr(from, len);
  };
}

function slice(args: any) {
  return function slice(x: any[]) {
    const { start = 0, end = x.length } = args;
    return x.slice(start, end);
  };
}

function initDirectives(
  info: Record<DirectiveId, JsonRecord>,
  ids: DirectiveId[]
): CallableFunction[] {
  return ids.map((id) => DIRECTIVES[id](info[id]));
}

export function mapDxIds(nodes: readonly DirectiveNode[]): DirectiveId[] {
  return nodes
    .map((node) => node.name.value)
    .filter((id) => has(id, DIRECTIVES)) as DirectiveId[];
}

export function pipeDx(ex: Exec) {
  const {
    info: {
      directives: info,
      field: { directives: nodes = [] },
    },
  } = ex;
  const directiveIds = mapDxIds(nodes);
  const handlers = initDirectives(info, directiveIds);
  if (handlers.length) {
    // @ts-ignore
    return pipe(...handlers);
  }
  return identity;
}
