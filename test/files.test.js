const test = require('ava');
const files = require('../src/files');


test("Can read from file", function (t) {
  return files.readFile(__filename)
    .then(data => {
      t.regex(data, /THIS_RE_WILL_BE_IN_THERE/);
    });
});

test("Errors on bad reads", function (t) {
  return files.readFile("./this/is/not/a/real/file.js")
    .catch(ex => {
      t.regex(ex.message, /no such file or directory/i);
    });
});

// TODO: File writing...

test("Errors on bad writes", function (t) {
  return files.writeFile("./this/is/not/a/real/file.js", "LOL")
    .catch(ex => {
      t.regex(ex.message, /no such file or directory/i);
    });
});

test("Errors on bad mkdirs", function (t) {
  return files.mkdir("./this/directory/cannot/be/created")
    .catch(ex => {
      t.regex(ex.message, /no such file or directory/i);
    });
});
