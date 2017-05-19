const test = require('ava').test;
const uglier = require('../src/');


test("Can mangle a file", function (t) {
  return uglier.mangleFile(__filename)
    .then(code => {
      t.truthy(code);
    });
});
