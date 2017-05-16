//@flow

type enumThing = "cat" | "dog" | "bird" | "other";
type awful = true;

function whatever(a: "cat" | "dog" | "octopus", b: true, c: 3.14, d: { foo: number, bar: empty}): string {
  return [a, b, c].join(" ");
}
