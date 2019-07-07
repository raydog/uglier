
function add3(a, b, c) {
  return a + b + c;
}

console.log(add3(100, 20, 3));
console.log(add3(100, 20, ?)(3));
console.log(add3(?, 20, 3)(100));
console.log(add3(?, 20, ?)(100, 3));

class Add3 {
  derp(a, b, c) {
    return a + b + c;
  }
}

class Another3 extends Add3 {
  foo(a) {
    return super.derp(a, ?, ?);
  }
}

const lol = new Add3();
console.log(lol.derp(100, 20, ?)(3));

const wat = new Another3();
console.log(wat.foo(100)(20, 3));
