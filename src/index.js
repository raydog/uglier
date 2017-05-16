var parser = require('./parser');
var astHandler = require('./astHandler');
var formatter = require('./formatter');
// var jsondiffpatch = require('jsondiffpatch');
// var util = require('util');
var _ = require('lodash');

// var fname = "/users/Ray/webflow/lib/helpers/util.js";
// "/users/Ray/webflow/models/dynamoDrivers/mongodb.js";
// var fname = "/users/Ray/webflow/lib/dnsUtils.js";

exports.mangleCode = mangleCode;
exports.cleanAST = cleanAST;


// Mangles code with options. Throws if something's wrong.
function mangleCode(code, opts) {
  var ast   = parser.parseJS(code);
  var codez = astHandler.gurgitateAST(ast);

  return formatter.mangle(codez, opts);
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
