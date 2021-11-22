import gql from "graphql-tag";
import map from "../src";

test("PathHead", () => {
  const data = {
    exampleObj: {
      exampleStr: "hello world",
    },
    destinations: [
      {
        array_string: "foo",
      },
      {
        array_string: "bar",
      },
      {
        array_string: "baz",
      },
    ],
  };
  const query = gql`
    query PathHead {
      exampleStr(from: "exampleObj.exampleStr")
      exampleStrHead(from: "exampleObj.exampleStr", head: true)
      exampleStrNoHead(from: "exampleObj.exampleStr", head: false)
      destinationsHead(from: "destinations[*].array_string", head: true)
      destinationsNoHead(from: "destinations[*].array_string", head: false)
      destinations(from: "destinations[*].array_string")
    }
  `;
  const result = map(query, data);
  expect(result).toEqual(
    //
    {
      destinations: "foo",
      destinationsHead: "foo",
      destinationsNoHead: ["foo", "bar", "baz"],
      exampleStr: "hello world",
      exampleStrHead: "hello world",
      exampleStrNoHead: ["hello world"],
    }
  );
});
