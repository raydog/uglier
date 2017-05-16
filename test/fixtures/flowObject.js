type Coord = {|
  x: number,
  y: number,
  z: number,
  label?: string
|};

function lol(pos: Coord): Coord {
  var len = Math.sqrt(x**2 + y**2 + z**2);
  return {
    x: x / len,
    y: y / len,
    z: z/len
  } ;
}

function sumHours(employees: {[name: string]: number}): number {
  return Object.keys(employees)
    .map(x => employees[x])
    .reduce((a, b) => a + b, 0);
}

