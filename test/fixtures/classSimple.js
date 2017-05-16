class Board {
  constructor(b) {
    const newRow = (val) => Array(8).fill(val);
    const newBox = (val) => Array(8).fill(val).map(v => newRow(v));
    const dupe   = (box) => box.map(row => row.slice(0));
    this.data = b ? dupe(b.data) : newBox(false);
    this.safe = b ? dupe(b.safe) : newBox(true);
  }
  inspect() {
    return String(this);
  }
  toString() {
    return this.data
      .map((row, y) => row.map(
        (cell, x) => cell
          ? "♕"
          : this.safe[y][x]
            ? "."
            : "x"
        ).join(" "))
      .join("\n");
  }
  *safeSpaces(start_x, start_y) {
    for (var x=start_x||0; x<8; x++) {
      for (var y=start_y||0; y<8; y++) {
        start_y = 0;
        if (!this.safe[y][x]) { continue; }
        yield { x, y };
      }
    }
  }
  setSpace(x, y) {
    var i;
    if (!this.safe[y][x]) {
      throw new Error("Tried to set an unsafe cell");
    }

    this.data[y][x] = true;

    // Used for diagonals:
    const maybeSetUnsafe = (x, y) => {
      if (x < 0 || y < 0 || x >= 8 || y >= 8) {
        return;
      }
      this.safe[y][x] = false;
    };

    for(i=0;i<8;i++) {
      this.safe[y][i] = false;
      this.safe[i][x] = false;
      maybeSetUnsafe(x+i, y+i);
      maybeSetUnsafe(x+i, y-i);
      maybeSetUnsafe(x-i, y+i);
      maybeSetUnsafe(x-i, y-i);
    }
  }

  static solveFor(n) {
    var cur = Board.solutionsFor(n).next();
    return cur.done ? null : cur.value;
  }

  static *solutionsFor(n) {
    yield *_solveLevel(0, 0, 0, new Board());

    function *_solveLevel(lvl, x, y, b) {
      if (lvl >= n) {
        yield b;
        return;
      }
      for (var opt of b.safeSpaces(x, y)) {
        var next = new Board(b);
        next.setSpace(opt.x, opt.y);
        yield *_solveLevel(lvl+1, opt.x, opt.y, next);
      }
    }
  }
}

var num = 0;
for (var b of Board.solutionsFor(8)) {
  console.log("\n\nSOLUTION #%d!\n%s", ++num, b);
}
