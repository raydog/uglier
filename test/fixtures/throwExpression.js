function foo(a = throw new TypeError("A is required")) {
  console.log(a);
}

const throws = () => throw new Error("Oops");

const madness = Math.random() > 0.5
  ? "yep"
  : new Error("Oopsie daisy");

const logical = process.argv[3] || throw new Error("Invalid process args");
