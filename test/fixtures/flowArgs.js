// @flow

function thing(arg:string, [more, foo, bar]: [boolean, string, number]) {
  console.log("", arg, more, foo, bar);
}
