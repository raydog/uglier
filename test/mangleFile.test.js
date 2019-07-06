const test = require('ava');
const uglier = require('../src/');


test("Can mangle a file", function (t) {
  return uglier.mangleFile(__filename)
    .then(code => {
      t.truthy(code);
    });
});
