function* gen(min, max) {
  yield;
  while (min <= max) {
    yield min;
    min += 1;
  }
}

function *lololol() {
  yield* gen(1, 5);
  yield -1;
  yield;
};


for (let cur of lololol()) {
  console.log(cur);
}
