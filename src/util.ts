export function isset<T>(x: T | undefined): x is T {
  return typeof x !== "undefined";
}
