const derp = { foo: 1, bar: 2, hello: 3, world: 4, baz: 5 };
const { foo, bar, ...rest } = derp;

// foo is 1
// bar is 2
// rest is { hello, world, baz }
