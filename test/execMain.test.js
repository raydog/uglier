const test = require('ava');
const path = require('path');
const spawn = require('child_process').spawn;
const temp = require('temp').track();
const fs = require('fs');
const files = require('../src/files');


const MAIN_PATH = path.join(__dirname, "../src/main.js");
const SELF_CONTENTS = fs.readFileSync(__filename, { encoding: "utf8" });
const BAD_CONTENTS = SELF_CONTENTS.split("").reverse().join(""); // lol.


// Spawns the program in a promise, yielding useful datas:
function _spawnP(cwd, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(MAIN_PATH, args, { cwd, stdio: 'pipe' });
    const out = [];
    const store = (data) => out.push(data);
    proc.stdout.setEncoding('utf8');
    proc.stderr.setEncoding('utf8');
    proc.stdout.on('data', store);
    proc.stderr.on('data', store);
    proc.on('error', reject);
    proc.on('exit', code => resolve({code, out: out.join("")}));
  });
}


// Builds the structure:
// <root>
//  |-a
//  | |- foo.js
//    `- bad.js
//  |-b
//  | `- bar.js
//  ~~`-package.json~~
//
// Resolves to a lookup table of paths:
function _tempProject() {

  return _makeRootDir()
    .then(_makeSubdirs)
    .then(_makeFiles);

  function _makeRootDir() {
    return new Promise((resolve, reject) => {
      temp.mkdir("uglier-test", function (err, dir) {
        if (err) { return reject(err); }
        resolve(dir);
      });
    });
  }

  // Resolves to { rootDir, aDir, bDir}
  function _makeSubdirs(rootDir) {
    var aDir = files.mkdir(path.join(rootDir, "a"));
    var bDir = files.mkdir(path.join(rootDir, "b"));
    return Promise.all([aDir, bDir])
      .then(res => ({ rootDir, aDir: res[0], bDir: res[1] }));
  }

  function _makeFiles(dirs) {
    var foo = files.writeFile(path.join(dirs.aDir, "foo.js"), SELF_CONTENTS);
    var bad = files.writeFile(path.join(dirs.aDir, "bad.js"), BAD_CONTENTS);
    var bar = files.writeFile(path.join(dirs.bDir, "bar.js"), SELF_CONTENTS);

    return Promise.all([foo, bad, bar])
      .then(out => ({ rootDir: dirs.rootDir, foo: out[0], bad: out[1], bar: out[2] }));
  }
}


/**
 * The actual test cases:
 */

test("Can show help", function (t) {
  return _spawnP("/", ["-h"])
    .then(res => {
      t.falsy(res.code); // Ok status
      t.regex(res.out, /Usage:/); // Has 'usage' section
      t.regex(res.out, /--overwrite/); // Mentions --overwrite somewhere
    });
});

test("Can show version", function (t) {
  return _spawnP("/", ["-v"])
    .then(res => {
      t.falsy(res.code); // Ok status
      t.regex(res.out, /^\s*\d+(\.\d+)+\s*$/); // Only shows version
    });
});

test("Rejects no pattern", function (t) {
  return _spawnP(__dirname, [])
    .then(res => {
      t.truthy(res.code); // Bad status
      t.regex(res.out, /no patterns/i); // Explains no patterns
      t.regex(res.out, /Usage:/i); // Has 'usage' section
    });
});

test("Handles printing with a basic pattern", function (t) {
  var paths;
  return _tempProject()
    .then(out => {
      paths = out;
      return paths.rootDir;
    })
    .then(rootDir => _spawnP(rootDir, ["-p", "b/**/*.js"]))
    .then(res => {
      t.falsy(res.code); // Ok status
      t.regex(res.out, /b\/bar\.js/);
      t.regex(res.out, /SIMPLE_PRINT_DIDNT_BREAK_THIS_RE/);
      t.regex(res.out, /0 fail/i);
      t.regex(res.out, /1 total/i);
    })
    .then(() => files.readFile(paths.bar))
    .then(data => {
      // File wasn't edited:
      t.is(data, SELF_CONTENTS);
    });
});

test("Handles printing with an error", function (t) {
  var paths;
  return _tempProject()
    .then(out => {
      paths = out;
      return paths.rootDir;
    })
    .then(rootDir => _spawnP(rootDir, ["-p", "a/**/*.js"]))
    .then(res => {
      t.truthy(res.code); // Bad status
      t.regex(res.out, /a\/foo\.js/);
      t.regex(res.out, /a\/bad\.js/);
      t.regex(res.out, /BIGGER_PRINT_DIDNT_BREAK_THIS_RE/);
      t.regex(res.out, /failed to parse js/i);
      t.regex(res.out, /1 fail/i);
      t.regex(res.out, /2 total/i);
    })
    .then(() => Promise.all([paths.bar, paths.bad].map(files.readFile)))
    .then(datas => {
      // Files weren't edited:
      t.is(datas[0], SELF_CONTENTS);
      t.is(datas[1], BAD_CONTENTS);
    });
});

test("Handles basic writing", function (t) {
  var paths;
  return _tempProject()
    .then(out => {
      paths = out;
      return paths.rootDir;
    })
    .then(rootDir => _spawnP(rootDir, ["-o", "b/**/*.js"]))
    .then(res => {
      t.falsy(res.code); // Ok status
      t.regex(res.out, /0 fail/i);
      t.regex(res.out, /1 total/i);
    })
    .then(() => Promise.all([paths.bar].map(files.readFile)))
    .then(datas => {
      // File wasn't edited:
      t.not(datas[0], SELF_CONTENTS);
      t.regex(datas[0], /BASIC_WRITE_DIDNT_BREAK_THIS_RE/);
    });
});

test("Handles writing with an error", function (t) {
  var paths;
  return _tempProject()
    .then(out => {
      paths = out;
      return paths.rootDir;
    })
    .then(rootDir => _spawnP(rootDir, ["-o", "a/**/*.js"]))
    .then(res => {
      t.truthy(res.code); // Bad status
      t.regex(res.out, /1 fail/i);
      t.regex(res.out, /2 total/i);
    })
    .then(() => Promise.all([paths.foo, paths.bad].map(files.readFile)))
    .then(datas => {
      // File wasn't edited:
      t.not(datas[0], SELF_CONTENTS);
      t.is(datas[1], BAD_CONTENTS);
      t.regex(datas[0], /BIGGER_WRITE_DIDNT_BREAK_THIS_RE/);
    });
});

test("Handles excluding paths", function (t) {
  var paths;
  return _tempProject()
    .then(out => {
      paths = out;
      return paths.rootDir;
    })
    .then(rootDir => _spawnP(rootDir, ["-o", "**/*.js", "-x", "**/bad.js"]))
    .then(res => {
      t.falsy(res.code); // Ok status
      t.regex(res.out, /0 fail/i);
      t.regex(res.out, /2 total/i);
    })
    .then(() => Promise.all([paths.foo, paths.bad, paths.bar].map(files.readFile)))
    .then(datas => {
      // File wasn't edited:
      t.not(datas[0], SELF_CONTENTS);
      t.is(datas[1], BAD_CONTENTS);
      t.not(datas[2], SELF_CONTENTS);
      t.regex(datas[0], /EXCLUDE_A_DIDNT_BREAK_THIS_RE/);
      t.regex(datas[2], /EXCLUDE_B_DIDNT_BREAK_THIS_RE/);
    });
});

