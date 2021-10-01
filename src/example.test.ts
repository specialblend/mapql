import gql from "graphql-tag";
import map from "./map";

test("example", () => {
  const data = {
    myStr: "example string",
    myInt: 1234,
    myBool: true,
    myNumStr: "1234.5678",
    myObj: {
      myStr: "example nested string",
      myInt: 2345,
      myBool: false,
      myNumStr: "3456.7890",
      myObj: {
        myStr: "example double nested string",
        myInt: 3456,
        myBool: false,
        myNumStr: "4567.8901",
      },
    },
    myObjArr: [
      {
        myStr: "example nested string #1",
        myInt: 4567,
        myBool: false,
        myNumStr: "5678.9012",
        myObj: {
          myStr: "example double nested string #1",
          myInt: 5678,
          myBool: false,
          myNumStr: "6789.0123",
        },
      },
      {
        myStr: "example nested string #2",
        myInt: 5678,
        myBool: false,
        myNumStr: "5678.9012",
        myObj: {
          myStr: "example double nested string #2",
          myInt: 6789,
          myBool: false,
          myNumStr: "7890.1234",
        },
      },
    ],
  };
  const query = gql`
    query ExampleQuery {
      myStr # jsonpath("myStr") => "example string"
      myInt # jsonpath("myInt") => 1234
      myAliasStr(from: "myStr") # jsonpath("myStr") => "example string"
      myDoubleNestedInt(from: "myObj.myObj.myInt") # => 3456
      myObj {
        myStr # jsonpath("myObj.myStr") => "example nested string"
        myRootStr(fromRoot: "myStr") # jsonpath("$.myStr") => "example string"
        myParsedInt(from: "myNumStr") @parseInt # => parseInt("3456.7890")
        myIntPlus42(from: "myInt") @add(x: 42) # => 2345 + 42
        myFoo(from: "myNumStr") @parseInt @subtract(x: 13) # => parseInt("3456.7890") - 13
      }
      myObjArr {
        myStr @concat(before: "#hello") # => "#hello" + jsonpath("myObjArr[@].myStr")
        myStrFoo(from: "myStr") @concat(after: "#bye") # => jsonpath("myObjArr[@].myStr") + "#bye"
        myStrBar(from: "myStr") @concat(before: "#hello", after: "#bye") # => jsonpath("myObjArr[@].myStr") + "#bye"
      }
      myJson(from: "myObj.myObj") @toJson # => JSON.stringify(jsonpath("myObj.myObj"))
    }
  `;
  const result = map(query, data);
  expect(result).toEqual({
    myStr: data.myStr,
    myInt: data.myInt,
    myAliasStr: data.myStr,
    myDoubleNestedInt: data.myObj.myObj.myInt,
    myObj: {
      myStr: data.myObj.myStr,
      myRootStr: data.myStr,
      myParsedInt: parseInt(data.myObj.myNumStr),
      myIntPlus42: data.myObj.myInt + 42,
      myFoo: parseInt(data.myObj.myNumStr) - 13,
    },
    myObjArr: [
      {
        myStr: "#hello" + data.myObjArr[0].myStr,
        myStrFoo: data.myObjArr[0].myStr + "#bye",
        myStrBar: "#hello" + data.myObjArr[0].myStr + "#bye",
      },
      {
        myStr: "#hello" + data.myObjArr[1].myStr,
        myStrFoo: data.myObjArr[1].myStr + "#bye",
        myStrBar: "#hello" + data.myObjArr[1].myStr + "#bye",
      },
    ],
    myJson: JSON.stringify(data.myObj.myObj),
  });
});
