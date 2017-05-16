function derp(x, y, ...rest) {
  console.log(rest);
}

var a = [ 1, 2, 3, 4, 5 ];
var b = [ "foo", "bar", ...a ];
