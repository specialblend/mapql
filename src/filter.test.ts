import { filter, matches } from "./filter";
import { JsonSelector } from "./contract";

describe("matches", () => {
  const foo = {
    alpha: "#alpha",
    bravo: "#bravo",
    testNull: null,
  };
  const bar = {
    charlie: "#charlie",
    delta: "#delta",
  };
  const baz = {
    alpha: "#alpha",
    echo: "#echo",
    foxtrot: "#foxtrot",
    bravo: {
      charlie: "#charlie",
    },
  };

  test("it returns true when data obj contains filter obj", () => {
    const data = {
      ...foo,
      ...bar,
    };
    expect(matches(foo, data)).toBe(true);
    expect(matches({}, data)).toBe(true);
  });
  test("it returns true when data obj contains match obj", () => {
    const faz = {
      alpha: {
        foo: "bar",
        bravo: {
          baz: "faz",
          charlie: {
            bar: "foo",
            foo: "baz",
          },
        },
      },
    };
    const match = {
      alpha: {
        bravo: {
          baz: "faz",
          charlie: {
            bar: "foo",
          },
        },
      },
    };
    expect(matches(match, faz)).toBe(true);
  });
  test("it returns true when data obj is filter obj", () => {
    const data = {
      ...foo,
      ...bar,
    };
    expect(matches(foo, foo)).toBe(true);
    expect(matches(bar, bar)).toBe(true);
    expect(matches(baz, baz)).toBe(true);
    expect(matches(data, data)).toBe(true);
    expect(matches({}, {})).toBe(true);
  });
  test("it returns true when data value is filter value", () => {
    expect(matches(foo.alpha, baz.alpha)).toBe(true);
    expect(matches(baz.alpha, foo.alpha)).toBe(true);
    expect(matches(true, true)).toBe(true);
    expect(matches(false, false)).toBe(true);
    expect(matches(1234, 1234)).toBe(true);
    expect(matches(null, null)).toBe(true);
  });
  test("it returns false when data obj does not match filter obj", () => {
    expect(matches(foo, { ...foo, alpha: null })).toBe(false);
    expect(matches(foo, { ...foo, testNull: "notnull" })).toBe(false);
    expect(matches(foo, bar)).toBe(false);
    expect(matches(foo, baz)).toBe(false);
  });
  test("it returns false when data value does not match filter value", () => {
    expect(matches("foo", "bar")).toBe(false);
    expect(matches("foo", 1234)).toBe(false);
    expect(matches("foo", {})).toBe(false);
    expect(matches("foo", true)).toBe(false);
    expect(matches("foo", false)).toBe(false);
    expect(matches("foo", null)).toBe(false);
    expect(matches("foo", "FOO")).toBe(false);
    expect(matches(true, "foo")).toBe(false);
    expect(matches(true, "true")).toBe(false);
    expect(matches(true, 0)).toBe(false);
    expect(matches(true, 1)).toBe(false);
    expect(matches(true, 1234)).toBe(false);
    expect(matches(true, false)).toBe(false);
    expect(matches(true, null)).toBe(false);
    expect(matches(true, {})).toBe(false);
  });
});

describe("filter", () => {
  test("it returns data when match matches root", () => {
    const match: JsonSelector = {
      alpha: "#alpha",
      bravo: "#bravo",
    };
    const root = {
      ...match,
      charlie: "#charlie",
    };
    const result = filter(match, undefined, root);
    expect(result).toBe(root);
  });
  test("it returns nothing when match does not match root", () => {
    const match: JsonSelector = {
      alpha: "#alpha",
      bravo: "#bravo",
    };
    const root = {
      ...match,
      bravo: "#notbravo",
      charlie: "#charlie",
    };
    const result = filter(match, undefined, root);
    expect(result).toBeUndefined();
  });
  test("it returns array values matching match", () => {
    const match: JsonSelector = {
      alpha: "#alpha",
      bravo: "#bravo",
    };
    const matchesSelector = [
      {
        ...match,
        charlie: "#charlie1",
      },
      {
        ...match,
        charlie: "#charlie2",
      },
      {
        ...match,
        charlie: "#charlie3",
      },
    ];
    const notMatchesSelector = [
      {
        ...match,
        alpha: "#notalpha",
        charlie: "#charlie1",
      },
      {
        ...match,
        alpha: "#notalpha",
        charlie: "#charlie2",
      },
      {
        ...match,
        alpha: "#notalpha",
        charlie: "#charlie2",
      },
    ];
    const root = [...matchesSelector, ...notMatchesSelector];
    const result = filter(match, undefined, root);
    expect(result).toEqual(matchesSelector);
  });
});
