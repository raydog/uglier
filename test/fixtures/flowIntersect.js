//@flow

type A = { a: number };
type B = { b: boolean };
type C = { c: string };

type D = A & B & C;

function derp(x: A & B & C): D {
  return {
    a: x.a + 1,
    b: !x.b,
    c: x.c + "!"
  };
}

console.log(derp({ a: 42, b: true, c: "Hello World" }));
