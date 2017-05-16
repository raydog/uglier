var a = Math.random() < 0.5;

a ? 1 : 2;
(!a) ? console.log(1) : console.warn(2);
var b = (Math.random() < 1 / Date.now())
  ? Math.random()
  : process.env["THING"] === "derp"
    ? Math.random() * 100
    : -1;
