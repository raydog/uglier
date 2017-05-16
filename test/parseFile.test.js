const test = require('ava').test;
const parser = require('../src/parser');


test("Can parse from file", function (t) {
  return parser.parseFile(__filename)
    .then(ast => {
      t.truthy(ast);
      t.is(ast.type, "File")
    });
});

test("Errors on missing files", function (t) {
  return parser.parseFile("./this/is/not/a/real/file.js")
    .catch(ex => {
      t.regex(ex.message, /no such file or directory/i);
    });
});
