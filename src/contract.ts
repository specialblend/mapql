import { ExecInfo } from "graphql-anywhere";
import { DIRECTIVES } from "./transform";

export type Maybe<T> = T | undefined;

export type JsonParent = JsonRecord | JsonList;
export type JsonChild = string | number | boolean | null | JsonParent;
export type JsonRecord = { [k: string]: JsonChild };
export type JsonList = JsonChild[];

export type JsonSelector = JsonChild | undefined;

export type PathSelector = string | "@";

export interface Filter {
  from?: PathSelector;
  match?: JsonSelector;
  nomatch?: JsonSelector;
}
export type ExecRoot = any;
export interface ExecArgs {
  from?: PathSelector;
  filter?: Filter;
}
export type ExecCtx = any;
export type ExecSource = JsonRecord;
export type ExecParent = any;
export type ExecChild = JsonChild;

export type Exec = {
  fieldName: string;
  root: ExecRoot;
  args: ExecArgs;
  context: ExecCtx;
  info: ExecInfo;
  data?: ExecSource;
  parent?: ExecParent;
  child?: ExecChild;
};

export type DirectiveMap = typeof DIRECTIVES;
export type DirectiveId = keyof DirectiveMap;
