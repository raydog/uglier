assertIs(3, 1 + 2);
assertIs(19, 20 - 1);
assertIs(200, 100 * 2);
assertIs(2, 40 / 20);
assertIs(3, 19 % 8);
assertIs(64, 4 ** 3);

function assertIs(correct, val) {
  if (correct !== val) {
    throw new Error(`${val} not ${correct}`);
  }
}