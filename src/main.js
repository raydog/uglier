const uglier = require('./');
const Config = require('./config');
const globby = require('globby');
const chalk = require('chalk');
const _ = require('lodash');
const mapLimit = require('../src/promises').mapLimit;
const packageJSON = require('../package.json');


const FILE_PARALLELISM = 16;

var origAST = null, newAST = null;

function main(args) {
  var c = new Config()
    .loadPackage(packageJSON)
    .loadArgv(args);

  if (!c.patterns.length) {
    console.log("No patterns given");
    printUsage();
    return Promise.resolve(1);
  }

  if (c.special === "help") {
    printUsage();
    return Promise.resolve(0);
  }

  if (c.special === "version") {
    console.log(packageJSON.version);
    return Promise.resolve(0);
  }

  console.log(c);

  return loadPatterns(c.patterns)
    .then(mangleWith(c));
}

function printUsage() {
  console.log([
    //                                                                             |
    "Usage: uglier [options...] <glob> ...",
    "Options:",
    "  -o --overwrite  Overwrite files with uglier (but equivalent) code",
    "  -p --print      Print results without changing them",
    "  -h --help       Print this help message and exit",
    "  -v --version    Print the version and exit",
    "",
    "Glob format is defined by the globby library. In summary:",
    "  *               Any part of the path except for '/' characters",
    "  **              Any part of the path including '/' characters, except for the final",
    "                  part of the path",
    "  ?               Any single character, except '/'",
    "  !pattern        Will negate the pattern, so it matches the OPPOSITE of what was",
    "                  described.",
    "  {pattern,...}   Any one of the given patterns",
  ].join("\n"));
}

function loadPatterns(patterns) {
  return globby(patterns);
}

function mangleWith(config) {
  var onCode = printTrash;
  var onError = printError;

  return (files) => mapLimit(files, FILE_PARALLELISM, path => trashIt(path, onCode, onError));
}

function trashIt(path, onCode, onError) {
  return uglier.mangleFile(path, { width: 80 })
    .then(code => onCode(path, code))
    .catch(err => onError(path, err));
}

/**
 * Console methods:
 */
function printTrash(path, code) {
  console.log('\n');
  console.log(chalk.inverse("// %s"), _.padEnd(path, 77, " "));
  console.log(code);
}

function printError(path, err) {
  console.log('\n');
  console.log(chalk.yellow.inverse("// %s"), _.padEnd(path, 77, " "));
  console.log(err.message);
}

/**
 * Overwrite methods:
 */

// ...


if (require.main === module) {
  main(process.argv)
    .then(code => process.exit(code));
}
