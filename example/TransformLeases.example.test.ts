import exampleData from "./data.json";
import gql from "graphql-tag";

import map, { JsonRecord } from "../src";

test("TransformLeases", () => {
  const query = gql`
    query TransformLeases {
      leases @map {
        contractNumber: leaseId @String @concat(before: "#")
        address @map {
          street
          streetLine2 @default(to: "N/A")
          city
          stateCode
          zipCode @parseInt
        }
      }
      reportMetaJson: reportMeta @toJson
    }
  `;
  const result = map(query, exampleData as JsonRecord);
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
