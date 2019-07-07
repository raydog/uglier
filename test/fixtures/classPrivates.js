class MyThing {
  #privateVar = 1;
  #privateMethod() {
    this.#privateVar += 1;
    return this.#privateVar;
  }
  publicMethod() {
    return this.#privateMethod() * 2;
  }
}

const x = new MyThing();
console.log(x.publicMethod()); // 4
