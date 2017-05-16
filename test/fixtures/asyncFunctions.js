var fn = async function(x) {
  var y = x * 2;
  console.log(x);
};
async function fn2(a, b, c) {
  fn(a); fn(b + c);
}
(async function (lol) {
  var x = async function (i) {
    return i * 2;
  };
  return fn2(lol, await x(lol), await y(lol));
  async function y(i) {
    return i * (i % 3 + 1);
  }
})(10);

const asyncArrow = async x => 200;
const anotherOne = async (x, y) => fn2(a, b, 2);