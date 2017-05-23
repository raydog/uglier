const test = require('ava').test;
const Config = require('../src/config');


const ARGV_BASE = ["node", "uglier"];

function argvTestFactory(t, argv, patterns, mode, special) {
  var c = new Config().loadArgv(ARGV_BASE.concat(argv));
  t.deepEqual(c.patterns, patterns);
  t.is(c.mode, mode);
  t.is(c.special, special);
}

test("Has defaults", argvTestFactory, [], [], "print", null);
test("Parses --help", argvTestFactory, ["--help"], [], "print", "help");
test("Parses -h", argvTestFactory, ["-h"], [], "print", "help");
test("Parses --version", argvTestFactory, ["--version"], [], "print", "version");
test("Parses -v", argvTestFactory, ["-v"], [], "print", "version");
test("Parses --print", argvTestFactory, ["--print"], [], "print", null);
test("Parses -p", argvTestFactory, ["-p"], [], "print", null);
test("Parses --overwrite", argvTestFactory, ["--overwrite"], [], "overwrite", null);
test("Parses -o", argvTestFactory, ["-o"], [], "overwrite", null);
test("Parses basic patterns", argvTestFactory, ["a", "-o", "b"], ["a", "b"], "overwrite", null);
test("Parses more patterns", argvTestFactory, ["-o", "src/**/*.js"], ["src/**/*.js"], "overwrite", null);

function packageTestFactory(t, packageJSON, patterns, mode) {
  var c = new Config().loadPackage(packageJSON);
  t.deepEqual(c.patterns, patterns);
  t.is(c.mode, mode);
  t.is(c.special, null);
}

test("Ignores unrelated package.json", packageTestFactory, {}, [], "print", null);
test("Ignores invalid mode", packageTestFactory, { uglier: { mode: 123 } }, [], "print", null);
test("Ignores unknown mode", packageTestFactory, { uglier: { mode: "lol" } }, [], "print", null);
test("Accepts mode", packageTestFactory, { uglier: { mode: "overwrite" } }, [], "overwrite", null);
test("Ignores invalid patterns", packageTestFactory, { uglier: { patterns: 123 } }, [], "print", null);
test("Ignores invalid patterns elements", packageTestFactory, { uglier: { patterns: ["foo", 123] } }, [], "print", null);
test("Accepts patterns", packageTestFactory, { uglier: { patterns: ["foo", "bar"] } }, ["foo", "bar"], "print", null);
