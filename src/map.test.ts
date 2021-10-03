import gql from "graphql-tag";
import { map } from "./map";
import { not, of } from "rambda";

const data = {
  exString: "This is an example string",
  exInt: 1234,
  exFloat: 13.37,
  exTrue: true,
  exFalse: false,
  exNull: null,
  exNumericString: "1337.1234",
  exObj: {
    exNestedString: "This is an example nested string",
    exNestedInt: -121212,
    exNestedFloat: 4.1315,
    exNestedTrue: true,
    exNestedFalse: false,
    exNestedObj: {
      exObjNestedString: "This is an example obj nested string",
      exObjNestedInt: -131313,
      exObjNestedFloat: 0.1234,
      exObjNestedTrue: true,
      exObjNestedFalse: false,
    },
  },
  exObjFoo: {
    exNestedString: "This is an example nested string foo",
    exNestedInt: 131313,
    exNestedFloat: 4.4654653,
    exNestedTrue: true,
    exNestedFalse: false,
    exNestedObj: {
      exObjNestedString: "This is an example obj nested string foo",
      exObjNestedInt: 121212,
      exObjNestedFloat: 0.6546345,
      exObjNestedTrue: true,
      exObjNestedFalse: false,
    },
  },
  exObjArr: [
    {
      exNestedString: "This is an example nested string #1",
      exNestedInt: 111,
      exNestedFloat: -0.111,
      exNestedTrue: true,
      exNestedFalse: false,
      exTag: "foo",
      exTag2: "baz",
    },
    {
      exNestedString: "This is an example nested string #2",
      exNestedInt: 222,
      exNestedFloat: -0.222,
      exNestedTrue: true,
      exNestedFalse: false,
      exTag: "bar",
      exTag2: "faz",
    },
    {
      exNestedString: "This is an example nested string #3",
      exNestedInt: 333,
      exNestedFloat: -0.333,
      exNestedTrue: true,
      exNestedFalse: false,
      exTag: "foo",
      exTag2: "bar",
    },
  ],
};

describe("map", () => {
  describe("path", () => {
    test("passthru @map works as expected", () => {
      const query = gql`
        query Example {
          exString
          exInt
          exFloat
          exTrue
          exFalse
          exNull
          exNumericString
          exObj @map {
            exNestedString
            exNestedInt
            exNestedFloat
            exNestedTrue
            exNestedFalse
            exNestedObj @map {
              exObjNestedString
              exObjNestedInt
              exObjNestedFloat
              exObjNestedTrue
              exObjNestedFalse
            }
          }
          exObjFoo @map {
            exNestedString
            exNestedInt
            exNestedFloat
            exNestedTrue
            exNestedFalse
            exNestedObj @map {
              exObjNestedString
              exObjNestedInt
              exObjNestedFloat
              exObjNestedTrue
              exObjNestedFalse
            }
          }
          exObjArr @map {
            exNestedString
            exNestedInt
            exNestedFloat
            exNestedTrue
            exNestedFalse
            exTag
            exTag2
          }
        }
      `;
      const result = map(query, data);
      expect(result).toEqual(data);
    });
    test("partial @map works as expected", () => {
      const query = gql`
        query Example {
          exString
          #        exInt
          #        exFloat
          #        exTrue
          #        exFalse
          #        exNull
          #        exNumericString
          exObj @map {
            exNestedString
            #          exNestedInt
            #          exNestedFloat
            #          exNestedTrue
            #          exNestedFalse
            exNestedObj @map {
              exObjNestedString
              #            exObjNestedInt
              #            exObjNestedFloat
              #            exObjNestedTrue
              #            exObjNestedFalse
            }
          }
          exObjArr @map {
            exNestedString
            #            exNestedInt
            #            exNestedFloat
            #            exNestedTrue
            #            exNestedFalse
            #            exTag
          }
        }
      `;
      const result = map(query, data);
      expect(result).toEqual({
        exString: data.exString,
        exObj: {
          exNestedString: data.exObj.exNestedString,
          exNestedObj: {
            exObjNestedString: data.exObj.exNestedObj.exObjNestedString,
          },
        },
        exObjArr: data.exObjArr.map(({ exNestedString }) => ({
          exNestedString,
        })),
      });
    });
    test("field aliasing works as expected", () => {
      const query = gql`
        query Example {
          exString
          #        exInt
          #        exFloat
          #        exTrue
          #        exFalse
          #        exNull
          #        exNumericString
          exObj @map {
            exNestedStringFoo: exNestedString
            #          exNestedInt
            #          exNestedFloat
            #          exNestedTrue
            #          exNestedFalse
            exNestedObj @map {
              exObjNestedStringFoo: exObjNestedString
              #            exObjNestedInt
              #            exObjNestedFloat
              #            exObjNestedTrue
              #            exObjNestedFalse
            }
          }
          exObjArr @map {
            exNestedString
            #            exNestedInt
            #            exNestedFloat
            #            exNestedTrue
            #            exNestedFalse
            #            exTag
          }
        }
      `;
      const result = map(query, data);
      expect(result).toEqual({
        exString: data.exString,
        exObj: {
          exNestedStringFoo: data.exObj.exNestedString,
          exNestedObj: {
            exObjNestedStringFoo: data.exObj.exNestedObj.exObjNestedString,
          },
        },
        exObjArr: data.exObjArr.map(({ exNestedString }) => ({
          exNestedString,
        })),
      });
    });
    test("from: works as expected", () => {
      const query = gql`
        query Example {
          exString
          exObj(from: "exObjFoo") @map {
            exNestedStringFoo: exNestedString
            exNestedObj @map {
              exObjNestedStringFoo: exObjNestedString
            }
          }
          exObjArr @map {
            exNestedString
          }
        }
      `;
      const result = map(query, data);
      expect(result).toEqual({
        exString: data.exString,
        exObj: {
          exNestedStringFoo: data.exObjFoo.exNestedString,
          exNestedObj: {
            exObjNestedStringFoo: data.exObjFoo.exNestedObj.exObjNestedString,
          },
        },
        exObjArr: data.exObjArr.map(({ exNestedString }) => ({
          exNestedString,
        })),
      });
    });
    test("implicit @map works as expected", () => {
      const query = gql`
        query Example {
          exString
          exObj(from: "exObjFoo") {
            exNestedStringFoo: exNestedString
            exNestedObj @map {
              exObjNestedStringFoo: exObjNestedString
            }
          }
          exObjArr @map {
            exNestedString
          }
          foo {
            bar(from: "exObj") {
              exNestedStringFoo: exNestedString
              exNestedObj @map {
                exObjNestedStringFoo: exObjNestedString
              }
            }
          }
          alpha {
            bravo {
              charlie {
                baz(from: "exObjFoo") {
                  exNestedStringFoo: exNestedString
                  exNestedObj @map {
                    exObjNestedStringFoo: exObjNestedString
                  }
                }
              }
            }
          }
        }
      `;
      const result = map(query, data);
      expect(result).toEqual({
        exString: data.exString,
        exObj: {
          exNestedStringFoo: data.exObjFoo.exNestedString,
          exNestedObj: {
            exObjNestedStringFoo: data.exObjFoo.exNestedObj.exObjNestedString,
          },
        },
        exObjArr: data.exObjArr.map(({ exNestedString }) => ({
          exNestedString,
        })),
        foo: {
          bar: {
            exNestedStringFoo: data.exObj.exNestedString,
            exNestedObj: {
              exObjNestedStringFoo: data.exObj.exNestedObj.exObjNestedString,
            },
          },
        },
        alpha: {
          bravo: {
            charlie: {
              baz: {
                exNestedStringFoo: data.exObjFoo.exNestedString,
                exNestedObj: {
                  exObjNestedStringFoo:
                    data.exObjFoo.exNestedObj.exObjNestedString,
                },
              },
            },
          },
        },
      });
    });
  });
  describe("filter", () => {
    test("match works as expected on array root", () => {
      const query = gql`
        query FilterExample {
          exObjArr(filter: { match: { exTag: "foo" } }) {
            exNestedString
          }
        }
      `;
      const result = map(query, data);
      expect(result).toEqual({
        exObjArr: [
          {
            exNestedString: data.exObjArr[0].exNestedString,
          },
          {
            exNestedString: data.exObjArr[2].exNestedString,
          },
        ],
      });
    });
    test("match works as expected on array child", () => {
      const query = gql`
        query FilterExample {
          exObjArr @map {
            exNestedString
            exTag(filter: { match: "foo" })
          }
        }
      `;
      const result = map(query, data);
      expect(result).toEqual({
        exObjArr: [
          {
            exNestedString: data.exObjArr[0].exNestedString,
            exTag: "foo",
          },
          {
            exNestedString: data.exObjArr[1].exNestedString,
          },
          {
            exNestedString: data.exObjArr[2].exNestedString,
            exTag: "foo",
          },
        ],
      });
    });
    test("noMatch works as expected", () => {
      const query = gql`
        query RejectExample {
          exObjArr(filter: { noMatch: { exTag: "foo" } }) {
            exNestedString
          }
        }
      `;
      const result = map(query, data);
      expect(result).toEqual({
        exObjArr: [
          {
            exNestedString: data.exObjArr[1].exNestedString,
          },
        ],
      });
    });
    test("match and noMatch work together as expected", () => {
      const query = gql`
        query MatchNoMatchExample {
          exObjArr(
            filter: { match: { exTag: "foo" }, noMatch: { exTag2: "bar" } }
          ) {
            exNestedString
          }
        }
      `;
      const result = map(query, data);
      expect(result).toEqual({
        exObjArr: [
          {
            exNestedString: data.exObjArr[0].exNestedString,
          },
        ],
      });
    });
    test("match and noMatch can negate each other as expected", () => {
      const query = gql`
        query MatchNoMatchExample {
          exObjArr(
            filter: { match: { exTag: "foo" }, noMatch: { exTag: "foo" } }
          ) {
            exNestedString
          }
        }
      `;
      const result = map(query, data);
      expect(result).toEqual({
        exObjArr: [],
      });
    });
  });
  describe("transform", () => {
    describe("@parseInt", () => {
      test("it parses numeric string into integer", () => {
        const query = gql`
          query ParseIntExample {
            exInt @parseInt
            exFloat @parseInt
            exNumericString @parseInt
          }
        `;
        const result = map(query, data);
        expect(result).toEqual({
          exInt: parseInt(String(data.exInt)),
          exFloat: parseInt(String(data.exFloat)),
          exNumericString: parseInt(data.exNumericString),
        });
      });
    });
    describe("@parseFloat", () => {
      test("it parses numeric string into float", () => {
        const query = gql`
          query ParseFloatExample {
            exInt @parseFloat
            exFloat @parseFloat
            exNumericString @parseFloat
          }
        `;
        const result = map(query, data);
        expect(result).toEqual({
          exInt: parseFloat(String(data.exInt)),
          exFloat: parseFloat(String(data.exFloat)),
          exNumericString: parseFloat(data.exNumericString),
        });
      });
    });
    describe("@String", () => {
      test("it casts value to string", () => {
        const query = gql`
          query StringExample {
            exString @String
            exInt @String
            exFloat @String
            exTrue @String
            exFalse @String
            exNull @String
            exNumericString @String
          }
        `;
        const result = map(query, data);
        expect(result).toEqual({
          exString: String(data.exString),
          exInt: String(data.exInt),
          exFloat: String(data.exFloat),
          exTrue: String(data.exTrue),
          exFalse: String(data.exFalse),
          exNull: String(data.exNull),
          exNumericString: String(data.exNumericString),
        });
      });
    });
    describe("@Boolean", () => {
      test("it casts value to boolean", () => {
        const query = gql`
          query BooleanExample {
            exString @Boolean
            exInt @Boolean
            exFloat @Boolean
            exTrue @Boolean
            exFalse @Boolean
            exNull @Boolean
            exNumericString @Boolean
          }
        `;
        const result = map(query, data);
        expect(result).toEqual({
          exString: Boolean(data.exString),
          exInt: Boolean(data.exInt),
          exFloat: Boolean(data.exFloat),
          exTrue: Boolean(data.exTrue),
          exFalse: Boolean(data.exFalse),
          exNull: Boolean(data.exNull),
          exNumericString: Boolean(data.exNumericString),
        });
      });
    });
    describe("@toJson", () => {
      test("it formats value to JSON string", () => {
        const query = gql`
          query ToJsonExample {
            exString @toJson
            exInt @toJson
            exFloat @toJson
            exTrue @toJson
            exFalse @toJson
            exNull @toJson
            exNumericString @toJson
            exObj @toJson
          }
        `;
        const result = map(query, data);
        expect(result).toEqual({
          exString: JSON.stringify(data.exString),
          exInt: JSON.stringify(data.exInt),
          exFloat: JSON.stringify(data.exFloat),
          exTrue: JSON.stringify(data.exTrue),
          exFalse: JSON.stringify(data.exFalse),
          exNull: JSON.stringify(data.exNull),
          exNumericString: JSON.stringify(data.exNumericString),
          exObj: JSON.stringify(data.exObj),
        });
      });
      test.skip("it ignores directive on parent node", () => {
        const query = gql`
          query IgnoresToJsonExample {
            exString @toJson
            exInt @toJson
            exFloat @toJson
            exTrue @toJson
            exFalse @toJson
            exNull @toJson
            exNumericString @toJson
            exObj @toJson
            exObjFoo @toJson {
              exNestedString
            }
          }
        `;
        const result = map(query, data);
        expect(result).toEqual({
          exString: JSON.stringify(data.exString),
          exInt: JSON.stringify(data.exInt),
          exFloat: JSON.stringify(data.exFloat),
          exTrue: JSON.stringify(data.exTrue),
          exFalse: JSON.stringify(data.exFalse),
          exNull: JSON.stringify(data.exNull),
          exNumericString: JSON.stringify(data.exNumericString),
          exObj: JSON.stringify(data.exObj),
          exObjFoo: {
            exNestedString: data.exObjFoo.exNestedString,
          },
        });
      });
    });
    describe("@not", () => {
      test("it casts value to negated boolean", () => {
        const query = gql`
          query NotExample {
            exString @not
            exInt @not
            exFloat @not
            exTrue @not
            exFalse @not
            exNull @not
            exNumericString @not
          }
        `;
        const result = map(query, data);
        expect(result).toEqual({
          exString: not(data.exString),
          exInt: not(data.exInt),
          exFloat: not(data.exFloat),
          exTrue: not(data.exTrue),
          exFalse: not(data.exFalse),
          exNull: not(data.exNull),
          exNumericString: not(data.exNumericString),
        });
      });
    });
    describe("@of", () => {
      test("it returns singleton array of value", () => {
        const query = gql`
          query OfExample {
            exString @of
            exInt @of
            exFloat @of
            exTrue @of
            exFalse @of
            exNull @of
            exNumericString @of
          }
        `;
        const result = map(query, data);
        expect(result).toEqual({
          exString: of(data.exString),
          exInt: of(data.exInt),
          exFloat: of(data.exFloat),
          exTrue: of(data.exTrue),
          exFalse: of(data.exFalse),
          exNull: of(data.exNull),
          exNumericString: of(data.exNumericString),
        });
      });
    });
    describe("@concat", () => {
      test("it concats string before value", () => {
        const query = gql`
          query ConcatBeforeExample {
            exString @concat(before: "hello#")
          }
        `;
        const result = map(query, data);
        expect(result).toEqual({
          exString: String("hello#") + String(data.exString),
        });
      });
      test("it concats string after value", () => {
        const query = gql`
          query ConcatAfter {
            exString @concat(after: "#bye")
          }
        `;
        const result = map(query, data);
        expect(result).toEqual({
          exString: String(data.exString) + String("#bye"),
        });
      });
      test("it concats string before and after value", () => {
        const query = gql`
          query ConcatAfter {
            exString @concat(before: "#hello", after: "#bye")
          }
        `;
        const result = map(query, data);
        expect(result).toEqual({
          exString: String("#hello") + String(data.exString) + String("#bye"),
        });
      });
    });
    describe("@default", () => {
      test("it returns default value", () => {
        const query = gql`
          query DefaultToExample {
            exString
            exFooDoesNotExist @default(to: "hello")
          }
        `;
        const result = map(query, data);
        expect(result).toEqual({
          exString: data.exString,
          exFooDoesNotExist: "hello",
        });
      });
      test("it concats string after value", () => {
        const query = gql`
          query ConcatAfter {
            exString @concat(after: "#bye")
          }
        `;
        const result = map(query, data);
        expect(result).toEqual({
          exString: String(data.exString) + String("#bye"),
        });
      });
      test("it concats string before and after value", () => {
        const query = gql`
          query ConcatAfter {
            exString @concat(before: "#hello", after: "#bye")
          }
        `;
        const result = map(query, data);
        expect(result).toEqual({
          exString: String("#hello") + String(data.exString) + String("#bye"),
        });
      });
    });
    describe("composed directives", () => {
      test("it parses numeric string into integer", () => {
        const query = gql`
          query ComposedExample {
            exNumericString @parseInt @of @toJson
          }
        `;
        const result = map(query, data);
        expect(result).toEqual({
          exNumericString: JSON.stringify(of(parseInt(data.exNumericString))),
        });
      });
    });
  });
  describe("@const", () => {
    test("it returns constant value", () => {
      const query = gql`
        query ConstExample {
          exString
          exInt
          exConstStr @const(of: "hello")
          exConstInt @const(of: 1234)
          exConstTrue @const(of: true)
          exConstFalse @const(of: false)
          exConstNull @const(of: null)
          exConstObj @const(of: { foo: "bar" })
          exConstArr @const(of: [{ foo: "bar" }])
        }
      `;
      const result = map(query, data);
      expect(result).toEqual({
        exString: data.exString,
        exInt: data.exInt,
        exConstStr: "hello",
        exConstInt: 1234,
        exConstTrue: true,
        exConstFalse: false,
        exConstNull: null,
        exConstObj: { foo: "bar" },
        exConstArr: [{ foo: "bar" }],
      });
    });
  });
});
