var parser = require('./parser');
var astHandler = require('./astHandler');
var formatter = require('./formatter');
var jsondiffpatch = require('jsondiffpatch');
var util = require('util');
var _ = require('lodash');

/*

uglify <script.js> -> code to stdout
uglify

 */

// var fname = "/users/Ray/webflow/lib/helpers/util.js";
// "/users/Ray/webflow/models/dynamoDrivers/mongodb.js";
var fname = "/users/Ray/webflow/lib/dnsUtils.js";

var origAST = null, newAST = null;

parser.parseFile(fname)
  .then(saveOrigAST)
  .then(astHandler.gurgitateAST)
  .then(codez => formatter.mangle(codez, {}))
  .then(saveNewAST)
  .then(uglycode => console.log(uglycode))
  .then(findASTDiffs)
  .catch(err => {
    console.error("ERROR: ", err.stack || String(err));
  });

function saveOrigAST(ast) {
  origAST = ast;
  return ast;
}

function saveNewAST(code) {
  newAST = parser.parseJS(code);
  return code;
}

function findASTDiffs() {
  var delta = jsondiffpatch.diff(
    _normalizeAST(origAST),
    _normalizeAST(newAST)
  );
  if (!delta) { return; }
  jsondiffpatch.console.log(delta);
}

function _normalizeAST(ast) {
  ast = JSON.parse(JSON.stringify(ast));
  return _.cloneDeepWith(ast, (val, key) => {
    if (val && _.isObject(val)) {
      delete val.comments;
      delete val.leadingComments;
      delete val.trailingComments;
      delete val.loc;
      delete val.start;
      delete val.end;
      delete val.tokens;
      delete val.extra;
    }
  });
}