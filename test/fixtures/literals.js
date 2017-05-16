var hello = "Hi";
var world = "Earth";
[
  1,
  100000,
  -200,
  1.2345,
  1e100,
  -2e9837,
  Infinity,
  null,
  this,
  true,
  false,
  NaN,
  "foo",
  'bar',
  "this string isn't going to be short. Actually, it is quite long. The goal is to make it unwrappable, to trigger some other test case. Basically, I just want to make sure that at least one line in all these tests is unwrappable. Since we no longer chunk strings into shorter ones (since that changes the parse tree...), this one line will have to do. Yay.",
  'this string is "shorter". But still not entirely short.',
  /this is a regular expression/i,
  /(?:\/mu[c][h])\s+l\x0nger/gi,
  /^no ?flags$/,
].map(x => console.log(x));