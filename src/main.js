#!/usr/bin/env node

const uglier = require('./');
const Config = require('./config');
const files = require('./files');
const globby = require('globby');
const chalk = require('chalk');
const _ = require('lodash');
const mapLimit = require('../src/promises').mapLimit;
const packageJSON = require('../package.json');


const FILE_PARALLELISM = 16;

var origAST = null, newAST = null;

function main(args) {
  var c = new Config()
    // .loadPackage(packageJSON)
    .loadArgv(args);

  if (c.special === "help") {
    printUsage();
    return Promise.resolve(0);
  }

  if (c.special === "version") {
    console.log(packageJSON.version);
    return Promise.resolve(0);
  }

  if (!c.patterns.length) {
    console.log("No patterns given");
    printUsage();
    return Promise.resolve(1);
  }

  return loadPatterns(c)
    .then(mangleWith(c));
}

function printUsage() {
  console.log([
    "Usage: uglier [options...] <glob> ...",
    "Options:",
    "  -o --overwrite  Overwrite files with uglier (but equivalent) code",
    "  -x --exclude    Exclude a given glob from the list of files being updated.",
    "                  If no excludes are given, then **/node_modules/** is assumed.",
    "  -p --print      Print results without changing them",
    "  -h --help       Print this help message and exit",
    "  -v --version    Print the version and exit",
    "",
    "Glob format is defined by the globby library. Common bits are:",
    "  *               Any part of a single file or directory name.",
    "  **              Any part of the directory structure, excluding the final file.",
    "  ?               Any single character in a file or directory name.",
    "  !pattern        Will negate the pattern, so it matches the OPPOSITE of what was",
    "                  described.",
    "  {pattern,...}   Any one of the given patterns",
    "",
    "A more complete reference for the supported glob features can be found here:",
    "https://github.com/isaacs/node-glob#glob-primer"
  ].join("\n"));
}

function loadPatterns(c) {
  return globby(c.patterns, { ignore: c.excludes });
}

function mangleWith(config) {
  return (files) => {
    var handler = (config.mode === "print")
      ? new TrashPrinter(files)
      : new TrashWriter(files);
    return mapLimit(files, FILE_PARALLELISM, path => trashFile(path, handler))
      .then(() => handler.onDone());
  }
}

function trashFile(path, handler) {
  // NOTE: This is specifically structured so that errors in onCode are passed
  // along to onError. We should be careful to not double-count those cases.
  return uglier.mangleFile(path, null)
    .then(code => handler.onCode(path, code))
    .catch(err => handler.onError(path, err));
}


/**
 * Console methods:
 */
class TrashPrinter {
  constructor(paths) {
    this.ok = 0;
    this.fail = 0;
    this.total = paths.length;
  }

  onCode(path, code) {
    this.ok++;
    console.log('\n');
    console.log(chalk.inverse("// %s"), _.padEnd(path, 77, " "));
    console.log(code);
  }

  onError(path, err) {
    this.fail++;
    console.log('\n');
    console.log(chalk.yellow.inverse("// %s"), _.padEnd(path, 77, " "));
    console.log(err.message);
  }

  onDone() {
    var barLine = _.padEnd("// ", 80, "=");
    var plural = this.total === 1 ? "file" : "files";
    console.log('\n');
    console.log(barLine);
    console.log("// %d total %s: %d ok. %d fail", this.total, plural, this.ok, this.fail);
    console.log(barLine);
    return this.fail ? 1 : 0;
  }
}

/**
 * Overwrite methods:
 */
const STATUS_FREQ = 50; // No more than 1 message per 50 ms.
class TrashWriter {
  constructor(paths) {
    this.ok = 0;
    this.fail = 0;
    this.last = 0;
    this.total = paths.length;
    this.errors = [];
  }

  _printStatus() {
    var t = Date.now();
    /* istanbul ignore next */
    if (t - this.last < STATUS_FREQ) { return; }
    this.last = t;
    var pluralFile = this.total === 1 ? "file" : "files";
    var pluralFail = this.fail === 1 ? "failure" : "failures";
    var line = `${this.ok} / ${this.total} ${pluralFile} ok, ${this.fail} ${pluralFail}`;
    process.stdout.write('\r  ' + _.padEnd(line, 78, " "));
  }

  onCode(path, code) {
    // NOTE: we don't handle the error case here, so that the error will be passed along,
    // and then handled by onError below.
    return files.writeFile(path, code)
      .then(() => {
        this.ok++;
        this._printStatus();
      });
  }

  onError(path, err) {
    this.fail++;
    this.errors.push({ path, err });
    this._printStatus();
  }

  onDone() {
    var barLine = _.padEnd("// ", 80, "=");
    var pluralFile = this.total === 1 ? "file" : "files";

    console.log('\r' + _.repeat(' ', 80));
    
    this.errors.forEach(item => {
      console.log(chalk.yellow.inverse("%s"), _.padEnd(item.path, 77, " "));
      console.log(item.err.message);
    });

    console.log("Done! %d total %s: %d ok. %d fail", this.total, pluralFile, this.ok, this.fail);
    return this.fail ? 1 : 0;
  }
}

/* istanbul ignore else */
if (require.main === module) {
  main(process.argv)
    .then(code => process.exit(code));
}
