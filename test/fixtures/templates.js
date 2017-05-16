var a = "lol";
var b = { foo: "bar" };

console.log(``);
console.log(`[${a} ${b.foo}]`);
console.log(`${1 * 2 + 3}${a}`);
console.log(format`${0} ${1}`);

function format(strings, ... vals) {
  var lookup = [ "hello", "world" ];
  var out = "";
  for (var i=0; i<strings.length; i++) {
    out += strings[i];
    if (i < vals.length) { out += lookup[vals[i]]; }
  }
  return out;
}
