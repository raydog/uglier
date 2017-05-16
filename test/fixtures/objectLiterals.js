var hello = "foo", world = "bar";

var a = { foo: hello, bar: world };
var b = { "foo": hello, "bar": world };
var c = { hello, world };
var d = { ... a };
var e = { [ hello + world ]: 1+2+3 };
var f = {
  get foo() { return Math.random(); },
  set foo(x) { this.whatever = x; },
  other() { console.log("WAT"); },
  [hello + world]() { this.other(); },
  *generatorLol() { yield hello; yield world; },
  async eventually() { return 1; }
};

f.other();
f.foo = "lol";
console.log(f, f.foo);
