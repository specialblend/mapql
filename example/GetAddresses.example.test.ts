import gql from "graphql-tag";
import map, { JsonRecord } from "../src";
import exampleData from "./data.json";

test("GetAddresses", () => {
  const query1 = gql`
    query GetAddresses1 {
      leases(from: "leases") {
        contractNumber(from: "leaseId")
        address(from: "address") {
          street(from: "street")
          city(from: "city")
          stateCode(from: "stateCode")
          zipCode(from: "zipCode")
        }
      }
      reportInfo {
        date(from: "reportMeta.generated.date")
        manager(from: "reportMeta.generated.user.name")
        exampleVersion @const(of: "v1.2.3.4")
      }
    }
  `;
  const query2 = gql`
    query GetAddresses2 {
      leases @map {
        contractNumber(from: "leaseId")
        address @map {
          street @map
          city @map
          stateCode @map
          zipCode @map
        }
      }
      reportInfo {
        date(from: "reportMeta.generated.date")
        manager(from: "reportMeta.generated.user.name")
        exampleVersion @const(of: "v1.2.3.4")
      }
    }
  `;
  const query3 = gql`
    {
      leases @map {
        contractNumber: leaseId
        address @map {
          street
          city
          stateCode
          zipCode
        }
      }
      reportInfo(from: "reportMeta.generated") {
        date
        manager(from: "user.name")
        exampleVersion @const(of: "v1.2.3.4")
      }
    }
  `;
  const result = map(query1, exampleData as JsonRecord);
  expect(result).toEqual(
    //
    {
      leases: [
        {
          contractNumber: 1234,
          address: {
            street: "1234 Main St.",
            city: "New York City",
            stateCode: "NY",
            zipCode: "11210",
          },
        },
        {
          contractNumber: 2345,
          address: {
            street: "1333 3rd St.",
            city: "Newark",
            stateCode: "NJ",
            zipCode: "07195",
          },
        },
        {
          contractNumber: 4567,
          address: {
            street: "1333 3rd St.",
            city: "Newark",
            stateCode: "NJ",
            zipCode: "07195",
          },
        },
      ],
      reportInfo: {
        date: "12/21/2012",
        manager: "System Admin",
        exampleVersion: "v1.2.3.4",
      },
    }
  );
  expect(map(query2, exampleData as JsonRecord)).toEqual(
    map(query1, exampleData as JsonRecord)
  );
  expect(map(query3, exampleData as JsonRecord)).toEqual(
    map(query1, exampleData as JsonRecord)
  );
});
