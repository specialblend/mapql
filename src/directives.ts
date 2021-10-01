import { DirectiveNode } from "graphql";
import {
  add,
  flip,
  head,
  identity,
  init,
  last,
  not,
  of,
  pipe,
  subtract,
  tail,
} from "rambda";

type DirectiveName = keyof typeof DIRECTIVES;

const DIRECTIVES = {
  parseInt: _parseInt,
  parseFloat: _parseFloat,
  toJson: _toJson,
  String: () => String,
  Boolean: () => Boolean,
  concat: _concat,
  add: withx(add),
  // @ts-ignore
  subtract: withx(flip(subtract)),
  not: () => not,
  of: () => of,
  head: () => head,
  last: () => last,
  init: () => init,
  tail: () => tail,
  none: () => () => {},
};

function withx<T>(fn: (...args: T[]) => T) {
  return function (args: Record<"x", T>) {
    if (args.x) {
      return fn(args.x);
    }
    return () => identity;
  };
}

function _parseInt(args: Record<string, any>) {
  const { defaultTo } = args || {};
  return function (value: any) {
    const result = parseInt(value);
    if (isNaN(result)) {
      return defaultTo;
    }
    return result;
  };
}

function _parseFloat(args: Record<string, any>) {
  const { defaultTo } = args || {};
  return function (value: any) {
    const result = parseFloat(value);
    if (isNaN(result)) {
      return defaultTo;
    }
    return result;
  };
}

function _toJson() {
  return function toJson(value: any) {
    return JSON.stringify(value);
  };
}

function _concat(args: Record<string, any>) {
  const { before = "", after = "" } = args;
  return function (str: string) {
    return `${before}${str}${after}`;
  };
}

function partialDirective(directiveInfo: Record<string, any>) {
  return function (node: DirectiveNode) {
    const {
      name: { value: directiveName },
    } = node;
    const { [directiveName as DirectiveName]: handler = () => identity } =
      DIRECTIVES;
    const { [directiveName]: args } = directiveInfo;
    return handler(args);
  };
}

function pipeDirectives(
  directiveInfo: Record<string, any>,
  directiveNodes: readonly DirectiveNode[]
) {
  const handlers = directiveNodes.map(partialDirective(directiveInfo));
  if (handlers.length) {
    // @ts-ignore
    return pipe(...handlers);
  }
  return identity;
}

export default function execDirectives(
  directiveInfo: Record<string, any>,
  directiveNodes: readonly DirectiveNode[],
  isLeaf = false
) {
  if (isLeaf) {
    return function (result: any) {
      const evaluateResult = pipeDirectives(directiveInfo, directiveNodes);
      return evaluateResult(result);
    };
  }
  return function (result: any) {
    return result;
  };
}
