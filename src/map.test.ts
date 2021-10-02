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
    },
    {
      exNestedString: "This is an example nested string #2",
      exNestedInt: 222,
      exNestedFloat: -0.222,
      exNestedTrue: true,
      exNestedFalse: false,
      exTag: "bar",
    },
    {
      exNestedString: "This is an example nested string #3",
      exNestedInt: 333,
      exNestedFloat: -0.333,
      exNestedTrue: true,
      exNestedFalse: false,
      exTag: "foo",
    },
  ],
};

describe("mapRoots", () => {
  test("full passthru works as expected", () => {
    const query = gql`
      query Example {
        exString
        exInt
        exFloat
        exTrue
        exFalse
        exNull
        exNumericString
        exObj {
          exNestedString
          exNestedInt
          exNestedFloat
          exNestedTrue
          exNestedFalse
          exNestedObj {
            exObjNestedString
            exObjNestedInt
            exObjNestedFloat
            exObjNestedTrue
            exObjNestedFalse
          }
        }
        exObjFoo {
          exNestedString
          exNestedInt
          exNestedFloat
          exNestedTrue
          exNestedFalse
          exNestedObj {
            exObjNestedString
            exObjNestedInt
            exObjNestedFloat
            exObjNestedTrue
            exObjNestedFalse
          }
        }
        exObjArr {
          exNestedString
          exNestedInt
          exNestedFloat
          exNestedTrue
          exNestedFalse
          exTag
        }
      }
    `;
    const result = map(query, data);
    expect(result).toEqual(data);
  });
  test("partial passthru works as expected", () => {
    const query = gql`
      query Example {
        exString
        #        exInt
        #        exFloat
        #        exTrue
        #        exFalse
        #        exNull
        #        exNumericString
        exObj {
          exNestedString
          #          exNestedInt
          #          exNestedFloat
          #          exNestedTrue
          #          exNestedFalse
          exNestedObj {
            exObjNestedString
            #            exObjNestedInt
            #            exObjNestedFloat
            #            exObjNestedTrue
            #            exObjNestedFalse
          }
        }
        exObjArr {
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
        exObj {
          exNestedStringFoo: exNestedString
          #          exNestedInt
          #          exNestedFloat
          #          exNestedTrue
          #          exNestedFalse
          exNestedObj {
            exObjNestedStringFoo: exObjNestedString
            #            exObjNestedInt
            #            exObjNestedFloat
            #            exObjNestedTrue
            #            exObjNestedFalse
          }
        }
        exObjArr {
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
  test("from works as expected", () => {
    const query = gql`
      query Example {
        exString
        exObj(from: "exObjFoo") {
          exNestedStringFoo: exNestedString
          exNestedObj {
            exObjNestedStringFoo: exObjNestedString
          }
        }
        exObjArr {
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
  test("@root works as expected", () => {
    const query = gql`
      query Example {
        exString
        exObj(from: "exObjFoo") {
          exNestedStringFoo: exNestedString
          exNestedObj {
            exObjNestedStringFoo: exObjNestedString
          }
        }
        exObjArr {
          exNestedString
        }
        foo @root {
          bar(from: "exObj") {
            exNestedStringFoo: exNestedString
            exNestedObj {
              exObjNestedStringFoo: exObjNestedString
            }
          }
        }
        alpha @root {
          bravo @root {
            charlie @root {
              baz(from: "exObjFoo") {
                exNestedStringFoo: exNestedString
                exNestedObj {
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
