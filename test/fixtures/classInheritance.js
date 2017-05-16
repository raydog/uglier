class Animal {
  constructor() {
    this._legs = 0;
  }
  get type() {
    return "Animal";
  }
}

class Cat extends Animal {
  constructor() {
    super();
    this._legs = 4;
  }
  set legs(val) {
    this._legs = val;
  }
  get type() {
    return "Kitty cat";
  }
}

var kitty = new Cat();
kitty.legs = 3; // :(
console.log(kitty, kitty.type);
