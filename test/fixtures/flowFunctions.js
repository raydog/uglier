function eventually(fn: Function):void {
  setTimeout(fn, Math.random() * 1000);
}

function ignoreFn(ignore?: boolean): (string[]) => string {
  return (ignore === true)
    ? () => ""
    : (...args : string[]) => args.join(" ");
}

const blah = (a: number) : { a: number } => ({ a });
console.log(blah(100));

function reduceSoon(data: number[], fn: (...rest:number[]) => number) {
  setImmediate(() => fn(data));
}

function idunno(fn: <T>(a:number, b:string, ...rest:T[]) => T) {
  // ?
}

function blahblah<T, S:number>(a:T, b:S):void {
  console.log(a); console.log(b);
  return;
}