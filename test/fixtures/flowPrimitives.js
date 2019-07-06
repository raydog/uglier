// @flow
const a : number = Date.now();
let b : string = process.env.HOME;
var c : null = null;
var d : *;

function repeat(num: number, str: string):string {
  return Array(num).fill(str).join("");
}

function log(hide: boolean, str: string):void {
  if (hide) { return; }
  console.log(str);
}

function stupid(undef: void, nil: null):number {
  console.log("This is null", nil);
  console.log("This is undefined", undef);
  return 42;
}

function isString(x:mixed):boolean {
  return typeof x === "string";
}

function hasOptions(opts: { optKey?: string, optVal: ?string }):number {
  return 123;
}

const util = require('util');
const otherLog = (msg:string, obj:any):void => console.log(
  new Date().toISOString(),
  msg,
  util.inspect(obj, { colors: true, depth: 10 })
);
