function derp(a:string|number):string {
  if (typeof a === "number") {
    return String(Math.random() * a);
  }
  return a.split("")
    .map(x => Math.random() < 0.5 ? x.toUpperCase() : x.toLowerCase())
    .join("");
}

console.log(derp(100));
console.log(derp("hello world"));

const val : string | string[] = Math.random() < 0.5 ? "hi" : [ "hi" ];
