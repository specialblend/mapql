import { MATCH_ANY, MATCH_NONE } from "./filter";

export type JsonValue = string | number | boolean | null | Json | Json[];

export type JsonRecord = {
  [k: string]: string | number | boolean | null | Json;
};

export type PathSelector = string | "@";

export type JsonSelector =
  | string
  | number
  | boolean
  | null
  | Json
  | undefined
  | typeof MATCH_ANY
  | typeof MATCH_NONE;

export type Json = JsonRecord | JsonList;

export type JsonList = JsonValue[];

export interface FilterQuery {
  from?: PathSelector;
  match: JsonSelector;
}

export interface MapArgs {
  from?: PathSelector;
  filter?: FilterQuery;
  reject?: FilterQuery;
}
