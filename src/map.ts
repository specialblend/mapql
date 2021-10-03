import { DocumentNode } from "graphql";
import { JsonRecord } from "./contract";
import graphql from "graphql-anywhere";
import { exQuery } from "./ex";

export function map(query: DocumentNode, data: JsonRecord) {
  return graphql(exQuery(data), query, data);
}
