// Adapted from a prettier test:

function test1(x: { x: { foo: string } }, y: { x: { bar: number } }) {
  x = y; // 2 errors: `foo` not found in y.x; `bar` not found in x.x
}

function test2(x: { foo: string }, y: { foo: number }) {
  x = y; // 2 errors: string !~> number; number !~> string
}

function test3(x: { x: { foo: string } }, y: { x: { foo: number } }) {
  x = y; // 2 errors: string !~> number; number !~> string
}

function test4(x: { +foo: string }, y: { +foo: number }) {
  x = y; // 1 error: number !~> string
}

function test5(x: { x: { +foo: string } }, y: { x: { +foo: number } }) {
  x = y; // 2 errors: string !~> number; number !~> string
}

function test6(x: { -foo: string }, y: { -foo: number }) {
  x = y; // 1 error: string !~> number
}

function test7(x: { x: { -foo: string } }, y: { x: { -foo: number } }) {
  x = y; // 2 errors: string !~> number; number !~> string
}

const herp = "foo";
const derp = "bar";
const blah = "lol";

function test7(x: { x: { [herp]: string, +[derp]: number, -[blah]: boolean}}) {
  // ?
}