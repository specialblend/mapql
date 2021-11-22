import type { ExecInfo } from "graphql-anywhere";
import type { DirectiveInfo } from "apollo-utilities/src/directives";

import { DIRECTIVES } from "./transform";

export type Maybe<T> = T | undefined;
export type PathSelector = string | "@";

export type JsonParent = JsonRecord | JsonList;
export type JsonChild = string | number | boolean | null | JsonParent;
export type JsonRecord = { [k: string]: JsonChild };
export type JsonList = JsonChild[];
export type JsonSelector = JsonChild | undefined;

export interface Filter {
  from?: PathSelector;
  match?: JsonSelector;
  noMatch?: JsonSelector;
}

export type ExecRoot = any;
export type ExecCtx = any;
export type ExecSource = JsonRecord;

export interface ExecArgs {
  from?: PathSelector;
  filter?: Filter;
  head?: boolean;
}

export type Exec = {
  fieldName: string;
  root: ExecRoot;
  args: ExecArgs;
  context: ExecCtx;
  info: ExecInfo;
};

export type ExecInfoConst = ExecInfo & {
  directives: DirectiveInfo & {
    const: {
      of: string;
    };
  };
};

export type HasConst = Exec & {
  info: ExecInfoConst;
};

export type HasFilter = Exec & {
  args: ExecArgs & {
    filter: Filter;
  };
};

export type DirectiveMap = typeof DIRECTIVES;
export type DirectiveId = keyof DirectiveMap;
