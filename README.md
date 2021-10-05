# mapql

map, filter, and transform data structures using GraphQL and JSONPath.

## installation

```bash
# install peerDependencies
npm install graphql graphql-anywhere graphql-tag rambda jsonpath
# install package from Github packages
npm install --registry=https://npm.pkg.github.com/specialblend @specialblend/mapql
```

or add `.npmrc`:

```
registry=https://registry.npmjs.org/
@specialblend:registry=https://npm.pkg.github.com/specialblend
```

and run

```bash
npm install @specialblend/mapql graphql graphql-anywhere graphql-tag rambda jsonpath
```

## API usage example

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
            # bar
            baz
        }
    }
`;

const result = map(query, data);
```

## bin script usage example

`mapql [queryFile] [sourceFile]`

- `queryFile` .graphql query file
- `sourceFile` JSON or javascript file exporting object

```bash
# compact JSON output
mapql example/TransformLeases.example.graphql example/data.json > example.result.json
# pretty JSON output
PRETTY=true mapql example/TransformLeases.example.graphql example/data.json > example.result.json
```

## features

GraphQL query is written in desired result structure, using GraphQL arguments and directives for remapping paths and transforming result values.

### mapping fields

⭕ using example data:

<Details>
<summary>expand example data</summary>

```json
{
  "reportMeta": {
    "generated": {
      "date": "12/21/2012",
      "user": {
        "name": "System Admin",
        "email": "admin@example.com"
      }
    }
  },
  "leases": [
    {
      "leaseId": 1234,
      "residents": [
        {
          "name": "Alice",
          "dob": "1/1/1111",
          "email": "alice@example.com"
        },
        {
          "name": "Bob",
          "dob": "12/12/1212",
          "email": "bob@example.com"
        }
      ],
      "address": {
        "street": "1234 Main St.",
        "city": "New York City",
        "stateCode": "NY",
        "zipCode": "11210"
      }
    },
    {
      "leaseId": 2345,
      "residents": [
        {
          "name": "John Smith",
          "dob": "2/2/2222",
          "email": "john.smith@example.com"
        },
        {
          "name": "Jane Doe",
          "dob": "11/11/1111",
          "email": "jane.doe@example.com"
        }
      ],
      "address": {
        "street": "1333 3rd St.",
        "city": "Newark",
        "stateCode": "NJ",
        "zipCode": "07195"
      }
    },
    {
      "leaseId": 4567,
      "residents": [
        {
          "name": "Alice",
          "dob": "1/1/1111",
          "email": "alice@example.com"
        },
        {
          "name": "Bob",
          "dob": "12/12/1212",
          "email": "bob@example.com"
        }
      ],
      "address": {
        "street": "1333 3rd St.",
        "city": "Newark",
        "stateCode": "NJ",
        "zipCode": "07195"
      }
    }
  ]
}
```
</Details>

⭕ with following query:

```graphql
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
```

⭕ we get our result:

```json
{
  "leases": [
    {
      "contractNumber": 1234,
      "address": {
        "street": "1234 Main St.",
        "city": "New York City",
        "stateCode": "NY",
        "zipCode": "11210"
      }
    },
    {
      "contractNumber": 2345,
      "address": {
        "street": "1333 3rd St.",
        "city": "Newark",
        "stateCode": "NJ",
        "zipCode": "07195"
      }
    },
    {
      "contractNumber": 4567,
      "address": {
        "street": "1333 3rd St.",
        "city": "Newark",
        "stateCode": "NJ",
        "zipCode": "07195"
      }
    }
  ],
  "reportInfo": {
    "date": "12/21/2012",
    "manager": "System Admin",
    "exampleVersion": "v1.2.3.4"
  }
}
```

#### 💡 concepts

- ✅ `foo(from:$path)` will map `foo` field in result to JSONPath `$path`.
- ✅ `foo @const(of: "bar")` will map `foo` field in result to fixed value `"bar"`.

⭕ let's see if we can't shorten it a little:

```graphql
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
```

#### 💡 concepts

- ✅ `foo @map` is short for `foo(from: "foo")`.

⭕ let's go little bit shorter.

```graphql
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
```

#### 💡 concepts

- ✅ `query` keyword and name are optional.
- ✅ `foo: bar` is short for `foo(from: "bar")` when path is simple field name (not JSONPath).
- ✅ `@map` directive is optional and implicit on leaf nodes.

❓ [see example unit tests.](example/GetAddresses.example.test.ts)

### filtering fields

⭕ query:

```graphql
query FilterActiveLeases {
    leases(filter: { match: { isActive: true } }) {
        isActive
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
```

⭕ result:

<Details>
<summary>expand result</summary>

```json
{
  "leases": [
    {
      "isActive": true,
      "residents": [
        {
          "name": "Alice",
          "email": "alice@example.com"
        },
        {
          "name": "Bob",
          "email": "bob@example.com"
        }
      ],
      "address": {
        "street": "1234 Main St.",
        "city": "New York City",
        "zipCode": "11210"
      }
    },
    {
      "isActive": true,
      "residents": [
        {
          "name": "Alice",
          "email": "alice@example.com"
        },
        {
          "name": "Bob",
          "email": "bob@example.com"
        }
      ],
      "address": {
        "street": "1333 3rd St.",
        "city": "Newark",
        "zipCode": "07195"
      }
    }
  ]
}
```
</Details>

❓ [see example unit test.](example/FilterActiveLeases.example.test.ts)

#### 💡 concepts

- ✅ `foo(filter: { match: { bar: "baz" } })` can be used to filter fields using structured selectors.

⭕ using nested match:

```graphql
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
```

❓ [see example unit test.](example/FilterByStateCode.example.test.ts)

### transforming fields

⭕ query:

```graphql
query TransformLeases {
    leases @map {
        contractNumber: leaseId @String @concat(before: "#")
        address @map {
            street
            streetLine2 @default(to: "N/A")
            city
            stateCode
            zipCode @parseInt
        }
    }
    reportMetaJson: reportMeta @toJson
}
```

⭕ result:

```json
{
  "leases": [
    {
      "contractNumber": "#1234",
      "address": {
        "street": "1234 Main St.",
        "streetLine2": "#789",
        "city": "New York City",
        "stateCode": "NY",
        "zipCode": 11210
      }
    },
    {
      "contractNumber": "#2345",
      "address": {
        "street": "1333 3rd St.",
        "streetLine2": "N/A",
        "city": "Newark",
        "stateCode": "NJ",
        "zipCode": 7195
      }
    },
    {
      "contractNumber": "#4567",
      "address": {
        "street": "1333 3rd St.",
        "streetLine2": "N/A",
        "city": "Newark",
        "stateCode": "NJ",
        "zipCode": 7195
      }
    }
  ],
  "reportMetaJson": "{\"generated\":{\"date\":\"12/21/2012\",\"user\":{\"name\":\"System Admin\",\"email\":\"admin@example.com\"}}}"
}
```

#### 💡 concepts

- ✅ directives are composable and will execute in **left-to-right** composition order.
- ⚠️ transformation directives on parent nodes are called **before** child nodes.

❓ [see example unit test.](example/TransformLeases.example.test.ts)

### available transformers

#### ✅ unit tested

- `@default(to: any)`: set default value
- `@parseInt`: cast numeric string to integer
- `@parseFloat` cast numeric string to float
- `@String`: cast value to `string`
- `@Boolean`: cast value into `boolean`
- `@toJson`: format value to JSON string
- `@fromJson`: parse value from JSON string
- `@concat(before?: string, after?: string)`: concatenate string. arguments not mutually exclusive.
- `@not`: logical not.
- `@of`: return singleton array of value.

#### ⭕ not unit tested (yet)
- `@substr(from: $index, len: $index)`: return substring of value.
- `@slice(from: $index, to: $index)`: slice array.
- `@add(x: number)`: add to value.
- `@sub(x: number)`: subtract from value.
- `@mul(x: number)`: multiply value.
- `@prop(_: string)`: return property of object.
- `@path(_: string[])`: return path of object.
- `@head`: return first element of array.
- `@init`: return all except last element of array.
- `@tail`: return all except first element of array.
- `@last`: return last element of array.
