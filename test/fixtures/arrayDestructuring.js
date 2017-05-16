var [ a, b ] = [ 1, 2, 3 ];
var [ c, d, ...rest ] = [ 1, 2, 3, 4, 5, 6, 7 ];
var [ e, , [ g, h ] ] = [ 1, 2, [ 3, 4 ], 5];
(function ([ a, b ]) {
  console.log(a, b);
})([1, 2, 3]);
(function ([ a, b, c = 99 ]) {
  console.log(a, b, c);
})([1, 2]);
var x = 1, y = 2;
[x, y] = [y, x];
[z,,];
