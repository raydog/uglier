const test = require('ava');
const Config = require('../src/config');
const _ = require('lodash');


const DEF_EXCLUDE = "**/node_modules/**";
const ARGV_BASE = ["node", "uglier"];


function argvTest(t, argv, ref) {
  var c = new Config().loadArgv(ARGV_BASE.concat(argv));
  
  var ours = _.pick(c, "patterns", "mode", "special", "excludes");
  var shouldBe = _.pick(ref, "patterns", "mode", "special", "excludes");
  
  t.deepEqual(ours, shouldBe);
}


test("Has defaults",          argvTest, [],                     { patterns:[], mode:"print", special:null, excludes: [DEF_EXCLUDE] });
test("Parses --help",         argvTest, ["--help"],             { patterns:[], mode:"print", special:"help", excludes: [DEF_EXCLUDE] });
test("Parses -h",             argvTest, ["-h"],                 { patterns:[], mode:"print", special:"help", excludes: [DEF_EXCLUDE] });
test("Parses --version",      argvTest, ["--version"],          { patterns:[], mode:"print", special:"version", excludes: [DEF_EXCLUDE] });
test("Parses -v",             argvTest, ["-v"],                 { patterns:[], mode:"print", special:"version", excludes: [DEF_EXCLUDE] });
test("Parses --print",        argvTest, ["--print"],            { patterns:[], mode:"print", special:null, excludes: [DEF_EXCLUDE] });
test("Parses -p",             argvTest, ["-p"],                 { patterns:[], mode:"print", special:null, excludes: [DEF_EXCLUDE] });
test("Parses --overwrite",    argvTest, ["--overwrite"],        { patterns:[], mode:"overwrite", special:null, excludes: [DEF_EXCLUDE] });
test("Parses -o",             argvTest, ["-o"],                 { patterns:[], mode:"overwrite", special:null, excludes: [DEF_EXCLUDE] });
test("Parses --exclude=x",    argvTest, ["--exclude=x"],        { patterns:[], mode:"print", special:null, excludes: ["x"] });
test("Parses --exclude x",    argvTest, ["--exclude", "x"],     { patterns:[], mode:"print", special:null, excludes: ["x"] });
test("Parses -x x",           argvTest, ["-x", "x"],            { patterns:[], mode:"print", special:null, excludes: ["x"] });
test("Parses multiple -x",    argvTest, ["-x", "x", "-x", "y"], { patterns:[], mode:"print", special:null, excludes: ["x", "y"] });
test("Parses basic patterns", argvTest, ["a", "-o", "b"],       { patterns:["a", "b"], mode:"overwrite", special:null, excludes: [DEF_EXCLUDE] });
test("Parses more patterns",  argvTest, ["-o", "src/**/*.js"],  { patterns:["src/**/*.js"], mode:"overwrite", special:null, excludes: [DEF_EXCLUDE] });

test("Rejects -x without a value", function (t) {
  t.throws(
    () => new Config().loadArgv(ARGV_BASE.concat(["-x"])),
    /needs a glob to exclude/i
  );
});


function jsonTest(t, packageJSON, ref) {
  var c = new Config().loadPackage(packageJSON);
  
  var ours = _.pick(c, "patterns", "mode", "special", "excludes");
  var shouldBe = _.pick(ref, "patterns", "mode", "special", "excludes");
  
  t.deepEqual(ours, shouldBe);
}

test("Ignores unrelated package.json", jsonTest,
  {},
  { patterns:[], mode:"print", special:null, excludes: [DEF_EXCLUDE] }
);
test("Ignores invalid mode", jsonTest,
  { uglier: { mode: 123 } },
  { patterns:[], mode:"print", special:null, excludes: [DEF_EXCLUDE] }
);
test("Ignores unknown mode", jsonTest,
  { uglier: { mode: "lol" } },
  { patterns:[], mode:"print", special:null, excludes: [DEF_EXCLUDE] }
);
test("Accepts mode", jsonTest,
  { uglier: { mode: "overwrite" } },
  { patterns:[], mode:"overwrite", special:null, excludes: [DEF_EXCLUDE] }
);
test("Ignores invalid patterns", jsonTest,
  { uglier: { patterns: 123 } },
  { patterns:[], mode:"print", special:null, excludes: [DEF_EXCLUDE] }
);
test("Ignores invalid patterns elements", jsonTest,
  { uglier: { patterns: ["foo", 123] } },
  { patterns:[], mode:"print", special:null, excludes: [DEF_EXCLUDE] }
);
test("Accepts patterns", jsonTest,
  { uglier: { patterns: ["foo", "bar"] } },
  { patterns:["foo", "bar"], mode:"print", special:null, excludes: [DEF_EXCLUDE] }
);
test("Ignores invalid excludes", jsonTest,
  { uglier: { exclude: 123 } },
  { patterns:[], mode:"print", special:null, excludes: [DEF_EXCLUDE] }
);
test("Ignores invalid excludes elements", jsonTest,
  { uglier: { exclude: ["**/blah.js", 123] } },
  { patterns:[], mode:"print", special:null, excludes: [DEF_EXCLUDE] }
);
test("Accepts excludes", jsonTest,
  { uglier: { exclude: ["**/lol.js", "**/hi.js"] } },
  { patterns:[], mode:"print", special:null, excludes: ["**/lol.js", "**/hi.js"] }
);
