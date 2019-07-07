function *moneyPile() {
  let monies = 0;
  while (true) {
    const i_got = function.sent;
    if (i_got && typeof i_got === "number") {
      monies += i_got;
    } else if (i_got === "done") {
      return monies;
    }
    yield monies;
  }
}

const wallet = moneyPile();
wallet.next(100);
wallet.next(20);
wallet.next(3);
const final = wallet.next("done");

// final should === 123.
