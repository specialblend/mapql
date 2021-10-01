import gql from "graphql-tag";
import { head, tail, last, of } from "rambda";
import map from "./map";

describe("map", () => {
  const data = {
    exString: `This is an example string`,
    exInt: 1234,
    exFloat: 13.37,
    exTrue: true,
    exFalse: false,
    exNull: null,
    exNumericString: `1337.1234`,
    exObj: {
      exNestedString: `This is an example nested string`,
      exNestedInt: -121212,
      exNestedFloat: 4.1315,
      exNestedTrue: true,
      exNestedFalse: false,
      exNestedObj: {
        exObjNestedString: `This is an example obj nested string`,
        exObjNestedInt: -131313,
        exObjNestedFloat: 0.1234,
        exObjNestedTrue: true,
        exObjNestedFalse: false,
      },
    },
    exObjArr: [
      {
        exNestedString: `This is an example nested string #1`,
        exNestedInt: 111,
        exNestedFloat: -0.111,
        exNestedTrue: true,
        exNestedFalse: false,
      },
      {
        exNestedString: `This is an example nested string #2`,
        exNestedInt: 222,
        exNestedFloat: -0.222,
        exNestedTrue: true,
        exNestedFalse: false,
      },
      {
        exNestedString: `This is an example nested string #3`,
        exNestedInt: 333,
        exNestedFloat: -0.333,
        exNestedTrue: true,
        exNestedFalse: false,
      },
    ],
  };
  describe("args", () => {
    test("it formats implicit mappings as expected", () => {
      const query = gql`
        query ImplicitMapExample {
          exString
          exInt
          exFloat
          exTrue
          exFalse
          exNumericString
          exObj
          exObjArr
        }
      `;
      const result = map(query, data);
      expect(result).toEqual({
        exString: data.exString,
        exInt: data.exInt,
        exFloat: data.exFloat,
        exTrue: data.exTrue,
        exFalse: data.exFalse,
        exNumericString: data.exNumericString,
        exObj: data.exObj,
        exObjArr: data.exObjArr,
      });
    });
    test("it filters implicit mappings as expected", () => {
      const query = gql`
        query FilterMapExample {
          exString
          exInt
          exFloat
          exTrue
          exFalse
          exObj {
            exNestedString
            exNestedTrue
            exNestedObj {
              exObjNestedString
            }
          }
          exObjArr {
            exNestedInt
            exNestedFalse
          }
        }
      `;
      const result = map(query, data);
      expect(result).toEqual({
        exString: data.exString,
        exInt: data.exInt,
        exFloat: data.exFloat,
        exTrue: data.exTrue,
        exFalse: data.exFalse,
        exObj: {
          exNestedString: data.exObj.exNestedString,
          exNestedTrue: data.exObj.exNestedTrue,
          exNestedObj: {
            exObjNestedString: data.exObj.exNestedObj.exObjNestedString,
          },
        },
        exObjArr: data.exObjArr.map(
          ({ exNestedInt, exNestedFalse }, index) => ({
            exNestedInt: data.exObjArr[index].exNestedInt,
            exNestedFalse: data.exObjArr[index].exNestedFalse,
          })
        ),
      });
      expect(result.exObj.exNestedInt).toBeUndefined();
      expect(result.exObjArr[0].exNestedTrue).toBeUndefined();
    });
    test("it formats `from` mappings as expected", () => {
      const query = gql`
        query FormatFromPathExample {
          exStringFoo(from: "exString")
          exStringBar(from: "exString", defaultTo: "bar")
          exStringFooBar(from: "exString_erdftgvyhbuj", defaultTo: "foobar")
          exIntFoo(from: "exInt")
          exFloatFoo(from: "exFloat")
          exTrueFoo(from: "exTrue")
          exFalseFoo(from: "exFalse")
          exObjFoo(from: "exObj") {
            exNestedStringFoo(from: "exNestedString")
            exNestedTrueFoo(from: "exNestedTrue")
          }
          exObjArr {
            exString(from: "exNestedString")
            exStringRoot(fromRoot: "exString")
            exInt(from: "exNestedInt")
            exIntRoot(fromRoot: "exInt")
          }
          exObjNestedString(from: "exObj.exNestedObj.exObjNestedString")
        }
      `;
      const result = map(query, data);
      expect(result).toEqual({
        exStringFoo: data.exString,
        exStringBar: data.exString,
        exStringFooBar: "foobar",
        exIntFoo: data.exInt,
        exFloatFoo: data.exFloat,
        exTrueFoo: data.exTrue,
        exFalseFoo: data.exFalse,
        exObjFoo: {
          exNestedStringFoo: data.exObj.exNestedString,
          exNestedTrueFoo: data.exObj.exNestedTrue,
        },
        exObjArr: data.exObjArr.map((item) => {
          return {
            exString: item.exNestedString,
            exStringRoot: data.exString,
            exInt: item.exNestedInt,
            exIntRoot: data.exInt,
          };
        }),
        exObjNestedString: data.exObj.exNestedObj.exObjNestedString,
      });
      expect(result.exObjFoo.exNestedInt).toBeUndefined();
    });
    test("it formats `fromConst` mappings as expected", () => {
      const query = gql`
        query FromConstExample {
          exStringFoo(fromConst: "exStringConst")
          exIntFoo(fromConst: 123456789)
          exFloatFoo(fromConst: 123.456)
          exTrueFoo(fromConst: true)
          exFalseFoo(fromConst: false)
          exObjFoo(fromConst: { alpha: "#alpha", bravo: "#bravo" })
          exObjArr(fromConst: ["#alpha", "#bravo"])
        }
      `;
      const result = map(query, data);
      expect(result).toEqual({
        exStringFoo: "exStringConst",
        exIntFoo: 123456789,
        exFloatFoo: 123.456,
        exTrueFoo: true,
        exFalseFoo: false,
        exObjFoo: { alpha: "#alpha", bravo: "#bravo" },
        exObjArr: ["#alpha", "#bravo"],
      });
      expect(result.exObjFoo.exNestedInt).toBeUndefined();
    });
    test("it formats `fromRoot` mappings as expected", () => {
      const query = gql`
        query FormatFromExample {
          alpha {
            bravo {
              charlie(from: "exObj") {
                exStringFoo(from: "exNestedString") # => $.exObj.exNestedString
                exStringFooBar(fromRoot: "exString") # => $.exString
                exIntFooBar(fromRoot: "exInt")
                exFloatFooBar(fromRoot: "exFloat")
                exTrueFooBar(fromRoot: "exTrue")
                exFalseFooBar(fromRoot: "exFalse")
                exObjFooBar(fromRoot: "exObj") {
                  exNestedStringFooBar(from: "exNestedString")
                  exNestedTrueFooBar(from: "exNestedTrue")
                }
              }
            }
          }
          exStringFoo(from: "exString")
          exIntFoo(from: "exInt")
          exFloatFoo(from: "exFloat")
          exTrueFoo(from: "exTrue")
          exFalseFoo(from: "exFalse")
          exObjFoo(from: "exObj") {
            exNestedStringFoo(from: "exNestedString")
            exNestedTrueFoo(from: "exNestedTrue")
          }
        }
      `;
      const result = map(query, data);
      expect(result).toEqual({
        exStringFoo: data.exString,
        exIntFoo: data.exInt,
        exFloatFoo: data.exFloat,
        exTrueFoo: data.exTrue,
        exFalseFoo: data.exFalse,
        exObjFoo: {
          exNestedStringFoo: data.exObj.exNestedString,
          exNestedTrueFoo: data.exObj.exNestedTrue,
        },
        alpha: {
          bravo: {
            charlie: {
              exStringFoo: data.exObj.exNestedString,
              exStringFooBar: data.exString,
              exIntFooBar: data.exInt,
              exFloatFooBar: data.exFloat,
              exTrueFooBar: data.exTrue,
              exFalseFooBar: data.exFalse,
              exObjFooBar: {
                exNestedStringFooBar: data.exObj.exNestedString,
                exNestedTrueFooBar: data.exObj.exNestedTrue,
              },
            },
          },
        },
      });
    });
    test("it formats mixed mappings as expected", () => {
      const data = {
        charlie: "#charlie",
        delta: [
          {
            echo: "delta#echo#0",
            foxtrot: "delta#foxtrot#0",
            gulf: "delta#gulf#0",
            foo: "delta#foo#0",
          },
          {
            echo: "delta#echo#2",
            foxtrot: "delta#foxtrot#2",
            gulf: "delta#gulf#2",
            foo: "delta#foo#2",
          },
          {
            echo: "delta#echo#2",
            foxtrot: "delta#foxtrot#2",
            gulf: "delta#gulf#2",
            foo: "delta#foo#2",
          },
        ],
        echo: "#echo",
        foxtrot: "#foxtrot",
        gulf: "#gulf",
        india: "#india",
        juliet: {
          echo: "juliet#echo",
          foxtrot: "juliet#foxtrot",
          gulf: "juliet#gulf",
          foo: "juliet#foo",
          kilo: {
            echo: "juliet#kilo#echo",
            foxtrot: "juliet#kilo#foxtrot",
            gulf: "juliet#kilo#gulf",
            foo: "juliet#kilo#foo",
          },
        },
      };
      const query = gql`
        {
          alphaExample {
            bravoExample {
              charlie(from: "echo") # => $.echo
              ExampleInvalidField(from: "ertyguhijo") # => none
              ExampleFallbackField(
                from: "erdtfgyvbhu"
                defaultTo: "testdefault"
              ) # => none
            }
            deltaExample(from: "delta") {
              echo(from: "echo") # => $.delta.echo
              foxtrot # => $.delta.foxtrot
              gulf(from: "foo") # => $.delta.foo
              gulfAbsolutePath(fromRoot: "gulf") # => $.gulf
            }
            hotelExample {
              india # => $.india
            }
            julietPathExample {
              echo(from: "juliet.kilo.echo") # => $.juliet.kilo.echo
              foxtrot # => $.foxtrot
              gulf(from: "juliet.kilo.foo") # => $.juliet.kilo.foo
            }
            julietPathPropExample(from: "juliet.kilo") {
              echo(from: "echo") # => $.juliet.kilo.echo
              foxtrot # => $.juliet.kilo.foxtrot
              gulf(from: "foo") # => $.juliet.kilo.foo
            }
            julietPropPathExample(from: "juliet") {
              echo(from: "kilo.echo") # => $.juliet.kilo.echo
              foxtrot # => $.juliet.foxtrot
              gulf(from: "foo") # => $.juliet.kilo.foo
            }
          }
        }
      `;
      const result = map(query, data);
      expect(result).toMatchObject({
        alphaExample: {
          bravoExample: {
            charlie: data.echo,
            ExampleFallbackField: "testdefault",
          },
          deltaExample: [
            {
              echo: data.delta[0].echo,
              foxtrot: data.delta[0].foxtrot,
              gulf: data.delta[0].foo,
              gulfAbsolutePath: data.gulf,
            },
            {
              echo: data.delta[1].echo,
              foxtrot: data.delta[1].foxtrot,
              gulf: data.delta[1].foo,
              gulfAbsolutePath: data.gulf,
            },
            {
              echo: data.delta[2].echo,
              foxtrot: data.delta[2].foxtrot,
              gulf: data.delta[2].foo,
              gulfAbsolutePath: data.gulf,
            },
          ],
          hotelExample: {
            india: data.india,
          },
          julietPathExample: {
            echo: data.juliet.kilo.echo,
            foxtrot: data.foxtrot,
            gulf: data.juliet.kilo.foo,
          },
          julietPathPropExample: {
            echo: data.juliet.kilo.echo,
            foxtrot: data.juliet.kilo.foxtrot,
            gulf: data.juliet.kilo.foo,
          },
          julietPropPathExample: {
            echo: data.juliet.kilo.echo,
            foxtrot: data.juliet.foxtrot,
            gulf: data.juliet.foo,
          },
        },
      });
    });
  });
  describe("directives", () => {
    describe("parseInt", () => {
      test("it parses numeric string as integer", () => {
        const query = gql`
          query ParseIntExample {
            exString
            exInt
            exFloat
            exTrue
            exFalse
            exNumericString @parseInt
            exNumericStringInt(from: "exNumericString") @parseInt
            exObj
            exObjArr
          }
        `;
        const result = map(query, data);
        expect(result).toMatchObject({
          exString: data.exString,
          exInt: data.exInt,
          exFloat: data.exFloat,
          exTrue: data.exTrue,
          exFalse: data.exFalse,
          exNumericString: parseInt(data.exNumericString),
          exNumericStringInt: parseInt(data.exNumericString),
          exObj: data.exObj,
          exObjArr: data.exObjArr,
        });
      });
    });
    describe("parseFloat", () => {
      test("it parses numeric string as float", () => {
        const query = gql`
          query ParseIntExample {
            exString
            exInt
            exFloat
            exTrue
            exFalse
            exNumericString @parseFloat
            exNumericStringFloat(from: "exNumericString") @parseFloat
            exObj
            exObjArr
          }
        `;
        const result = map(query, data);
        expect(result).toMatchObject({
          exString: data.exString,
          exInt: data.exInt,
          exFloat: data.exFloat,
          exTrue: data.exTrue,
          exFalse: data.exFalse,
          exNumericString: parseFloat(data.exNumericString),
          exNumericStringFloat: parseFloat(data.exNumericString),
          exObj: data.exObj,
          exObjArr: data.exObjArr,
        });
      });
    });
    describe("String", () => {
      test("it stringifies value", () => {
        const query = gql`
          query StringExample {
            exString
            exInt
            exFloat
            exObj
            exIntString(from: "exInt") @String
            exFloatString(from: "exFloat") @String
            exObjString(from: "exObj") @String
          }
        `;
        const result = map(query, data);
        expect(result).toMatchObject({
          exString: data.exString,
          exInt: data.exInt,
          exFloat: data.exFloat,
          exObj: data.exObj,
          exIntString: String(data.exInt),
          exFloatString: String(data.exFloat),
          exObjString: String(data.exObj),
        });
      });
    });
    describe("Boolean", () => {
      test("it evalutes value to boolean", () => {
        const query = gql`
          query StringExample {
            exString
            exInt
            exFloat
            exObj
            exTrue
            exFalse
            exNull
            exIntBool(from: "exInt") @Boolean
            exFloatBool(from: "exFloat") @Boolean
            exNullBool(from: "exNull") @Boolean
            exTrueBool(from: "exTrue") @Boolean
            exFalseBool(from: "exFalse") @Boolean
            exObjBool(from: "exObj") @Boolean
          }
        `;
        const result = map(query, data);
        expect(result).toMatchObject({
          exString: data.exString,
          exInt: data.exInt,
          exFloat: data.exFloat,
          exTrue: data.exTrue,
          exFalse: data.exFalse,
          exNull: data.exNull,
          exNullBool: Boolean(data.exNull),
          exIntBool: Boolean(data.exInt),
          exTrueBool: Boolean(data.exTrue),
          exFalseBool: Boolean(data.exFalse),
          exFloatBool: Boolean(data.exFloat),
          exObjBool: Boolean(data.exObj),
          exObj: data.exObj,
        });
      });
    });
    describe("toJson", () => {
      test("it stringifies to json", () => {
        const query = gql`
          query ParseIntExample {
            exObj @toJson
          }
        `;
        const result = map(query, data);
        expect(result).toMatchObject({
          exObj: JSON.stringify(data.exObj),
        });
      });
    });
    describe("concat", () => {
      test("it concatenates string as expected", () => {
        const query = gql`
          query ConcatExample {
            exString @concat(before: "hello#")
            exFoo(from: "exString") @concat(before: "foo#")
            exBar(from: "exString") @concat(after: "#bar")
            exFooBar(from: "exString") @concat(before: "foo#", after: "#bar")
          }
        `;
        const result = map(query, data);
        expect(result).toMatchObject({
          exString: `hello#${data.exString}`,
          exFoo: `foo#${data.exString}`,
          exBar: `${data.exString}#bar`,
          exFooBar: `foo#${data.exString}#bar`,
        });
      });
    });
    describe("add", () => {
      test("it performs arithmetic add operation as expected", () => {
        const query = gql`
          query AddExample {
            exInt
            exPlus1(from: "exInt") @add(x: 1)
            exMinus5(from: "exInt") @add(x: -5)
          }
        `;
        const result = map(query, data);
        expect(result).toMatchObject({
          exInt: data.exInt,
          exPlus1: data.exInt + 1,
          exMinus5: data.exInt - 5,
        });
      });
    });
    describe("add", () => {
      test("it performs arithmetic add operation as expected", () => {
        const query = gql`
          query AddExample {
            exInt
            exPlus1(from: "exInt") @add(x: 1)
            exMinus5(from: "exInt") @add(x: -5)
          }
        `;
        const result = map(query, data);
        expect(result).toMatchObject({
          exInt: data.exInt,
          exPlus1: data.exInt + 1,
          exMinus5: data.exInt - 5,
        });
      });
    });
    describe("not", () => {
      test("it evalutes to logical inverse of value", () => {
        const query = gql`
          query StringExample {
            exString
            exInt
            exFloat
            exObj
            exTrue
            exFalse
            exNull
            exIntBool(from: "exInt") @Boolean @not
            exFloatBool(from: "exFloat") @Boolean @not
            exNullBool(from: "exNull") @Boolean @not
            exTrueBool(from: "exTrue") @Boolean @not
            exFalseBool(from: "exFalse") @Boolean @not
            exObjBool(from: "exObj") @Boolean @not
          }
        `;
        const result = map(query, data);
        expect(result).toMatchObject({
          exString: data.exString,
          exInt: data.exInt,
          exFloat: data.exFloat,
          exTrue: data.exTrue,
          exFalse: data.exFalse,
          exNull: data.exNull,
          exNullBool: !Boolean(data.exNull),
          exIntBool: !Boolean(data.exInt),
          exTrueBool: !Boolean(data.exTrue),
          exFalseBool: !Boolean(data.exFalse),
          exFloatBool: !Boolean(data.exFloat),
          exObjBool: !Boolean(data.exObj),
          exObj: data.exObj,
        });
      });
    });
    describe("of", () => {
      test("it evaluates to array of value", () => {
        const query = gql`
          query StringExample {
            exString
            exInt
            exFloat
            exObj
            exIntOf(from: "exInt") @of
            exFloatOf(from: "exFloat") @of
            exObjOf(from: "exObj") @of
          }
        `;
        const result = map(query, data);
        expect(result).toMatchObject({
          exString: data.exString,
          exInt: data.exInt,
          exFloat: data.exFloat,
          exObj: data.exObj,
          exIntOf: of(data.exInt),
          exFloatOf: of(data.exFloat),
          exObjOf: of(data.exObj),
        });
      });
    });
    describe("head", () => {
      test("it evaluates to first element of list", () => {
        const query = gql`
          query StringExample {
            exObjArr
            exObjArrHead(from: "exObjArr") @head
          }
        `;
        const result = map(query, data);
        expect(result).toMatchObject({
          exObjArr: data.exObjArr,
          exObjArrHead: head(data.exObjArr),
        });
      });
    });
    describe("tail", () => {
      test("it evaluates to tail of list", () => {
        const query = gql`
          query StringExample {
            exObjArr
            exObjArrTail(from: "exObjArr") @tail
          }
        `;
        const result = map(query, data);
        expect(result).toMatchObject({
          exObjArr: data.exObjArr,
          exObjArrTail: tail(data.exObjArr),
        });
      });
    });
    describe("last", () => {
      test("it evaluates to last element of list", () => {
        const query = gql`
          query StringExample {
            exObjArr
            exObjArrLast(from: "exObjArr") @last
          }
        `;
        const result = map(query, data);
        expect(result).toMatchObject({
          exObjArr: data.exObjArr,
          exObjArrLast: last(data.exObjArr),
        });
      });
    });
    describe("none", () => {
      test("it evaluates to nothing", () => {
        const query = gql`
          query StringExample {
            exString
            exInt
            exFloat
            exObj
            exIntString(from: "exInt") @none
            exFloatString(from: "exFloat") @none
            exObjString(from: "exObj") @none
          }
        `;
        const result = map(query, data);
        expect(result).toMatchObject({
          exString: data.exString,
          exInt: data.exInt,
          exFloat: data.exFloat,
          exObj: data.exObj,
        });
        expect(result.exIntString).toBeUndefined();
        expect(result.exFloatString).toBeUndefined();
        expect(result.exObjString).toBeUndefined();
      });
    });
  });
});
