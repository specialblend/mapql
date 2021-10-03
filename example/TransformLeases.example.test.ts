import exampleData from "./data.json";
import gql from "graphql-tag";

import map from "../src";
import { Json } from "../src/contract";

test("TransformLeases", () => {
  const query = gql`
    query TransformLeases {
      leases(from: "leases") {
        contractNumber(from: "leaseId") @String @concat(before: "#")
        # transformer ignored on parent node (address)
        address @toJson {
          street(from: "street")
          streetLine2 @default(to: "N/A")
          city(from: "city")
          stateCode(from: "stateCode")
          zipCode(from: "zipCode") @parseInt
        }
      }
      reportMetaJson: reportMeta @toJson
    }
  `;
  const result = map(query, exampleData as Json);
  expect(result).toEqual(
    //
    {
      leases: [
        {
          contractNumber: "#1234",
          address: {
            street: "1234 Main St.",
            streetLine2: "#789",
            city: "New York City",
            stateCode: "NY",
            zipCode: 11210,
          },
        },
        {
          contractNumber: "#2345",
          address: {
            street: "1333 3rd St.",
            streetLine2: "N/A",
            city: "Newark",
            stateCode: "NJ",
            zipCode: 7195,
          },
        },
        {
          contractNumber: "#4567",
          address: {
            street: "1333 3rd St.",
            streetLine2: "N/A",
            city: "Newark",
            stateCode: "NJ",
            zipCode: 7195,
          },
        },
      ],
      reportMetaJson:
        '{"generated":{"date":"12/21/2012","user":{"name":"System Admin","email":"admin@example.com"}}}',
    }
  );
});
