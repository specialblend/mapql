import exampleData from "./data.json";
import gql from "graphql-tag";

import map from "../src";

test("filter `leases` by `address.state`", () => {
  const query = gql`
    query Example {
      leases(filter: { address: { state: "NJ" } }) {
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
  const result = map(query, exampleData);
  expect(result).toEqual({
    leases: [
      ...exampleData.leases
        .filter((lease) => lease.address.state === "NJ")
        .map((lease) => {
          const {
            residents,
            address: { street, city, zipCode },
          } = lease;
          return {
            residents: residents.map((resident) => {
              const { name, email } = resident;
              return { name, email };
            }),
            address: {
              street,
              city,
              zipCode,
            },
          };
        }),
    ],
  });
});
