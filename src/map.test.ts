import gql from "graphql-tag";
import { map } from "./map";

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
  test("filter: works as expected", () => {
    const query = gql`
      query FilterExample {
        exObjArr(filter: { exTag: "foo" }) {
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
  test("reject: works as expected", () => {
    const query = gql`
      query RejectExample {
        exObjArr(reject: { exTag: "foo" }) {
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
  test("filter: and reject: work together as expected", () => {
    const query = gql`
      query RejectExample {
        exObjArr(filter: { exTag: "foo" }, reject: { exTag2: "bar" }) {
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
  test("filter: and reject: can negate each other as expected", () => {
    const query = gql`
      query RejectExample {
        exObjArr(filter: { exTag: "foo" }, reject: { exTag: "foo" }) {
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
