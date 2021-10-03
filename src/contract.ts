import { ExecInfo } from "graphql-anywhere";
import { MATCH_ANY, MATCH_NONE } from "./filter";
import { DIRECTIVES } from "./transform";

export type JsonChild = string | number | boolean | null | Json | Json[];
export type JsonRecord = { [k: string]: JsonChild };
export type JsonList = JsonChild[];
export type Json = JsonRecord | JsonList;

export type JsonSelector =
  | JsonChild
  | undefined
  | typeof MATCH_ANY
  | typeof MATCH_NONE;

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
export type ExecData = JsonRecord;
export type ExecParent = any;
export type ExecChild = JsonChild;

export type Exec = {
  fieldName: string;
  root: ExecRoot;
  args: ExecArgs;
  context: ExecCtx;
  info: ExecInfo;
  data?: ExecData;
  parent?: ExecParent;
  child?: ExecChild;
};

export type DirectiveMap = typeof DIRECTIVES;
export type DirectiveId = keyof DirectiveMap;
