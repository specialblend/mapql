# mapql

map and transform data structures using GraphQL and JSONPath.

## features

GraphQL query is written in desired result structure, using GraphQL arguments for remapping paths, and GraphQL directives for transforming result values.

```graphql
query ExampleQuery {
    alpha {
        bravo # no arguments implies current path => "alpha.bravo"
        charlie @foo # run @foo directive on field `charlie`
    }
    delta {
        echo(from: "alpha.bravo") # map field echo from data.alpha.bravo
        foxtrot(from: "charlie") {
            gulf # map field from data.charlie.gulf
            hotel(fromRoot: "alpha.charlie") # map field hotel from data.alpha.charlie
            india(fromConst: "fixed value")
        }
    }
}
```

### available arguments

- `(from: $path, defaultTo: $someFallback)`: map field from relative path. return `$someFallback` if path not exists. `$path` is any valid `JSONPath` string.
- `(fromRoot: $path, defaultTo: $someFallback)`: map field from root path. return `$someFallback` if path not exists. `$path` is any valid `JSONPath` string.
- `(fromConst: $value)`: map field from fixed value. `$value` is any valid `GraphQL` value.

### directives

⚠️ **note: directives are only executed on leaf nodes.**

✅ **note:** directives are composable and will execute in **left-to-right** composition order.

- `@parseInt`: format numeric string into integer
- `@parseFloat` format numeric string into float
- `@toJson`: format value into JSON string
- `@String`: format value into `string`
- `@Boolean`: coerce value into `boolean`
- `@concat(before: $beforeStr, after: $afterStr)`: concatenate string. arguments are not mutually exclusive.
- `@add(x: $i)`: add amount to value. `$i` is any valid `GraphQL` numeric value.
- `@subtract(x: $i)`: subtract amount from value. `$i` is any valid `GraphQL` numeric value.
- `@not`: logical negation. formats truthy value into `false` and falsy value into `true`.
- `@of`: monadic constructor. returns singleton array of value.
- `@head`: returns first element of array value.
- `@init`: returns init (all except last element) of array value.
- `@tail`: returns tail (all except first element) of array value.
- `@last`: returns last element of array value.
- `@none`: ignores field.

## usage example

```typescript
import gql from "graphql-tag";
import map from "@specialblend/mapql";

const data = {
    foo: {
        bar: "baz",
        baz: "faz"
    },
    // ...
};

const query = gql`
    query ExampleFilter {
        foo {
            # bar # field will be excluded
            baz
        }
    }
`;

const result = map(query, data);
```

## extended example

<details>
    <summary>expand extended example</summary>

given `data`:

```json
{
  "myStr": "example string",
  "myInt": 1234,
  "myBool": true,
  "myNumStr": "1234.5678",
  "myObj": {
    "myStr": "example nested string",
    "myInt": 2345,
    "myBool": false,
    "myNumStr": "3456.7890",
    "myObj": {
      "myStr": "example double nested string",
      "myInt": 3456,
      "myBool": false,
      "myNumStr": "4567.8901"
    }
  },
  "myObjArr": [
    {
      "myStr": "example nested string #1",
      "myInt": 4567,
      "myBool": false,
      "myNumStr": "5678.9012",
      "myObj": {
        "myStr": "example double nested string #1",
        "myInt": 5678,
        "myBool": false,
        "myNumStr": "6789.0123"
      }
    },
    {
      "myStr": "example nested string #2",
      "myInt": 5678,
      "myBool": false,
      "myNumStr": "5678.9012",
      "myObj": {
        "myStr": "example double nested string #2",
        "myInt": 6789,
        "myBool": false,
        "myNumStr": "7890.1234"
      }
    }
  ]
}
```
and `query`:

```graphql
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
```

`result`:

```json
{
  "myStr": "example string",
  "myInt": 1234,
  "myAliasStr": "example string",
  "myDoubleNestedInt": 3456,
  "myObj": {
    "myStr": "example nested string",
    "myRootStr": "example string",
    "myParsedInt": 3456,
    "myIntPlus42": 2387,
    "myFoo": 3443
  },
  "myObjArr": [
    {
      "myStr": "#helloexample nested string #1",
      "myStrFoo": "example nested string #1#bye",
      "myStrBar": "#helloexample nested string #1#bye"
    },
    {
      "myStr": "#helloexample nested string #2",
      "myStrFoo": "example nested string #2#bye",
      "myStrBar": "#helloexample nested string #2#bye"
    }
  ],
  "myJson": "{\"myStr\":\"example double nested string\",\"myInt\":3456,\"myBool\":false,\"myNumStr\":\"4567.8901\"}"
}
```
</details>
