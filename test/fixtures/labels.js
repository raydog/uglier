topLoop: for (var i = 0; i < 10; i++) {
  for (var j = 0; j < 10; j++) {
    console.log(i, j);
    if (j == 1) { continue topLoop; }
    if (i == 3) { break topLoop; }
  }
}

blockity: {
  console.log('hello');
  break blockity;
  throw new Error("DERP");
}
console.log('world');

thatFunc: function F() {
  // ?
}
