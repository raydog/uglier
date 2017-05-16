var a : [number, number] = [ 1, 2 ];

function posForIndex(idx : number) : [number, number] {
  return [
    idx % 100,
    idx / 100 | 0
  ];
}

const drawPoint = (color:string, pos:[number, number]):void => {
  // Uhh... draw in here...
}
