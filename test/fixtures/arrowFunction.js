var wrap = (a, b) => ({ first: a, second: b });
var withBlock = (x) => {
  console.log(x);
};
const noArg = () => {
  console.log("HI");
};
(() => console.log("HI"))();