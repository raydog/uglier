const a = "hello", b = "world", c = 1234;
export { a, b, c };
export { a as foo, b as bar };
export let pi = Math.PI;
export const tau = 2 * pi;
export * from "util";
export { format } from "util";
export { format as lol, inspect as derp } from "util";
export otherDefault from "other-lib";
export {};
