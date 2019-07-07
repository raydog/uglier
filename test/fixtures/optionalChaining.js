const fun = {
  a: rand({
    b: rand({
      c: Date.now(),
      foo: rand(n => "hi".repeat(n))
    }),
    foobar: 3,
  })
};

function rand(thing) {
  if (Math.random() < 0.2)
    return Math.random() < 0.5 ? null : undefined;
  return thing;
}

console.log(fun?.a?.b?.c);
console.log(fun?.a?.b?.foo?.(4));
console.log(fun?.a?.["foo" + "bar"]);

const not_ambiguous = Math.random()?.3:2;
