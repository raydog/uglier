function doIt(opts) {
  const a = opts.foo ?? "foo";
  const b = opts.bar ?? 1234;
  console.log(a, b);
}
