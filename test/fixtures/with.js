var a = 1, b = 2;
console.log(a, b);
with ({ a: "foo", b: "bar"}) {
  console.log(a, b);
}
console.log(a, b);

with(Date)console.log(now());