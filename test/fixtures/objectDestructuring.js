var { a, b } = { a: "foo", b: "bar" };
var { c, d = 100 } = { c: 100, e: "blargh" };
var { e, f: g } = { e: 2, f: 1 };
(function ({a, b: { c, d: e }, ...rest}) {
  console.log(a, c, e, rest);
})({a: 1, b: { c: 2, d: 3 }, derpityDoo: 12345 });
