try {
  throw new Error("Uh oh");
} finally {
  console.log("Finally...");
}

try {
  JSON.parse("not a json string");
} catch (ex) {
  console.log(":(", ex);
}

try {
  var a = null;
  a.foo("lol");
} catch (ex) {
  var thing = Math.random();
  console.log("errors", ex, thing);
} finally {
  console.log("Done", thing);
  throw new Error("Finally");
}

// Optional catch proposal:
try {
  throw new Error("This is a problem");
} catch {
  console.log("That was a problem");
}
