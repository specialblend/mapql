import gql from "graphql-tag";
import map, { JsonRecord } from "../src";
import exampleData from "./data.json";

test("FilterByStateCode", () => {
  const query = gql`
    query FilterByStateCode {
      leases(filter: { match: { address: { stateCode: "NJ" } } }) {
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
  expect(result).toEqual({
    leases: [
      ...exampleData.leases
        .filter((lease) => lease.address.stateCode === "NJ")
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
