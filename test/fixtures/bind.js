var log = ::console.log;
log("Hi");

var { map, filter, slice } = Array.prototype;

var v = [1, 2, 3, 4, 5, 6, 7, 8]
  ::map(x => x**2)
  ::filter(x => x <= 25)
  ::slice(-1);

console.log(v);
