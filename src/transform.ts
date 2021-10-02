import { DirectiveNode } from "graphql";
import { ExecInfo } from "graphql-anywhere";
import {
  defaultTo,
  has,
  head,
  identity,
  init,
  last,
  not,
  of,
  pipe,
  tail,
} from "rambda";

type DirectiveMap = typeof DIRECTIVES;
type DirectiveId = keyof DirectiveMap;

const DIRECTIVES: Record<string, CallableFunction> = {
  parseInt: () => (x: string) => parseInt(x),
  parseFloat: () => (x: string) => parseFloat(x),
  String: () => (x: any) => String(x),
  Boolean: () => (x: any) => Boolean(x),
  toJson: () => (x: any) => JSON.stringify(x),
  not: () => not,
  of: () => of,
  default: (args: any) => defaultTo(args.to),
  concat: concatStr,
  // head: (args?: any) => head,
  // last: (args?: any) => last,
  // init: (args?: any) => init,
  // tail: (args?: any) => tail,
  // add: withx((x: number) => (y: number) => y + x),
  // sub: withx((x: number) => (y: number) => y - x),
  // mul: withx((x: number) => (y: number) => y * x),
  // none: (args?: any) => () => {},
};

function withx(fn: CallableFunction) {
  return function (args: any) {
    if (args.x) {
      return fn(args.x);
    }
    return () => identity;
  };
}

function concatStr(args: Record<string, any>) {
  const { before = "", after = "" } = args;
  return function (str: string) {
    return String(before) + String(str) + String(after);
  };
}

function initDirectives(
  info: Partial<DirectiveMap>,
  ids: DirectiveId[]
): CallableFunction[] {
  return ids.map((id) => DIRECTIVES[id](info[id]));
}

export function parseDirectiveIds(
  nodes: readonly DirectiveNode[]
): DirectiveId[] {
  return nodes
    .map((node) => node.name.value)
    .filter((id) => has(id, DIRECTIVES)) as DirectiveId[];
}

function pipeDirectives(
  info: Partial<DirectiveMap>,
  nodes: readonly DirectiveNode[]
) {
  const directiveIds = parseDirectiveIds(nodes);
  const handlers = initDirectives(info, directiveIds);
  if (handlers.length) {
    // @ts-ignore
    return pipe(...handlers);
  }
  return identity;
}

export function executesDirectives(info: ExecInfo) {
  const {
    isLeaf,
    directives,
    field: { directives: nodes = [] },
  } = info;
  if (isLeaf) {
    return function execDirective(result: any) {
      return pipeDirectives(directives as Partial<DirectiveMap>, nodes)(result);
    };
  }
  return function execNoDirective(result: any) {
    return result;
  };
}
