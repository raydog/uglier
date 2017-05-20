var parser = require('./parser');
var astHandler = require('./astHandler');
var formatter = require('./formatter');
var optionRandomizer = require('./optionRandomizer');
var _ = require('lodash');


exports.mangleFile = mangleFile;
exports.mangleCode = mangleCode;
exports.cleanAST = cleanAST;


function mangleFile(fname, opts) {
  var astP  = parser.parseFile(fname);

  var codeP = astP.then(ast => astHandler.gurgitateAST(ast));
  var confP = astP.then(ast => opts || optionRandomizer.fromAST(ast));

  return Promise.all([codeP, confP])
    .then(res => formatter.mangle(res[0], res[1]));
}


// Mangles code with options. Throws if something's wrong.
// If opts is omitted (or null) it's generated from the AST through Magic™.
function mangleCode(code, opts) {
  var ast   = parser.parseJS(code);
  var conf  = opts || optionRandomizer.fromAST(ast);
  var codez = astHandler.gurgitateAST(ast);
  return formatter.mangle(codez, conf);
}


function cleanAST(code) {
  var ast = parser.parseJS(code);
  var clone = JSON.parse(JSON.stringify(ast));
  return _.cloneDeepWith(clone, (val, key) => {
    if (val && _.isObject(val)) {
      delete val.comments;
      delete val.leadingComments;
      delete val.trailingComments;
      delete val.innerComments;
      delete val.variancePos;
      delete val.loc;
      delete val.start;
      delete val.end;
      delete val.tokens;
      delete val.extra;
      
      // Delete null entries, since some flow fields will be either missing or null
      // in unpredictable contexts...
      _.keys(val).forEach(k => {
        if (val[k] === null) {
          delete val[k];
        }
      })
    }
    if (_.isArray(val)) {
      // We don't care about trailing commas:
      while (val.length && val[val.length-1] == null) {
        val.pop();
      }
    }
  });
}
