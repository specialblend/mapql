import gql from "graphql-tag";
import map, { JsonRecord } from "../src";
import exampleData from "./data.json";

test("FilterActiveLeases", () => {
  const query = gql`
    query FilterActiveLeases {
      leases(filter: { match: { isActive: true } }) {
        isActive
        residents @map {
          name
          email
        }
        address @map {
          street
          city
          zipCode
        }
      }
    }
  `;
  const result = map(query, exampleData as JsonRecord);
  expect(result).toEqual(
    //
    {
      leases: [
        {
          isActive: true,
          residents: [
            {
              name: "Alice",
              email: "alice@example.com",
            },
            {
              name: "Bob",
              email: "bob@example.com",
            },
          ],
          address: {
            street: "1234 Main St.",
            city: "New York City",
            zipCode: "11210",
          },
        },
        {
          isActive: true,
          residents: [
            {
              name: "Alice",
              email: "alice@example.com",
            },
            {
              name: "Bob",
              email: "bob@example.com",
            },
          ],
          address: {
            street: "1333 3rd St.",
            city: "Newark",
            zipCode: "07195",
          },
        },
      ],
    }
  );
});
