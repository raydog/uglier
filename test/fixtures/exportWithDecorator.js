@comment("This class is stupid")
export class FooBar {
  get foo() {
    return Math.random();
  }
  set bar(x) {
    console.log("LOL", x);
  }
}
