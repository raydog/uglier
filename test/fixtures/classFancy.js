const foo = "foo", bar = "bar";

const klass = class Blah {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  static thing(n) {
    return Blah.val * n;
  }

  async whatever() {
    var a = await wasteOfTime();
    return 1;
  }

  static val = Math.PI;
  otherVal = 1 * 2 + 3;
  ["lol" + foo + bar] = "hi";

  [foo + bar]() {
    console.log(this);
    return this.a * this.b;
  }

  static [bar + foo]() {
    return "!?!";
  }
};

function wasteOfTime() {
  return new Promise(resolve => {
    setTimeout(resolve, 1000);
  });
}

var k = new klass(1, 2);
console.log(k.foobar());

var blah = (class {});
