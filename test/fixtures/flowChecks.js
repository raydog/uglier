// @flow

declare function isString(x:any):boolean %checks(typeof x === "string");

function isString(x): boolean %checks {
  return typeof x === 'string';
}

function isError(x): %checks {
  return y instanceof Error;
}
