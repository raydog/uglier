var fn = function(x) {
  var y = x * 2;
  console.log(x);
};
function fn2(a, b, c) {
  fn(a); fn(b + c);
}
(function (lol) {
  var x = function (i) {
    return i * 2;
  };
  fn2(lol, x(lol), y(lol));
  function y(i) {
    return i * (i % 3 + 1);
  }
})(10);
function blah() {
  if (Math.random() < 0.25) { return; }
  fn(Date.now());
}