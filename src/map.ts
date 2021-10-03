import { DocumentNode } from "graphql";
import { JsonRecord } from "./contract";
import graphql from "graphql-anywhere";
import { exec } from "./exec";

export function map(query: DocumentNode, data: JsonRecord) {
  return graphql(exec(data), query, data);
}
