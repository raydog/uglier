type foo<T> = Array<T, T>;

const arrayify = <T>(x:T|T[]):T[] => Array.isArray(x) ? x : [ x ];

function derp<S,T=string>(x:S, y:T): [S,T] {
  return [x, y];
}
