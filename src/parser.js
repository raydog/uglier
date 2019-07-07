const parser = require("@babel/parser");
const files = require('./files');
const _ = require('lodash');


exports.parseFile = parseFile;
exports.parseJS = parseJS;


function parseFile(fname) {
  return files.readFile(fname)
    .then(parseJS);
}

function parseJS(text) {
  // This bit pulled from the 'prettier' source:
  try {
    var out = parser.parse(text, {
      sourceType: "module",
      allowImportExportEverywhere: false,
      allowReturnOutsideFunction: false,
      strictMode: false, // Allows 'with' statements, cause that's a good idea. </sarcasm>
      plugins: [
        "asyncGenerators",
        "classProperties",
        ["decorators", { decoratorsBeforeExport: true }],
        "doExpressions",
        "dynamicImport",
        "exportExtensions",
        "exportNamespaceFrom",
        "flow",
        "functionBind",
        "functionSent",
        // "jsx", // << TODO....
        "objectRestSpread",
      ]
    });
    return out;

  } catch (ex) {
    if (ex.name === "SyntaxError") {
      throw new SyntaxError(formatSyntaxError(text, ex));
    }
    throw ex;
  }
}


const CONTEXT = 2;
function formatSyntaxError(code, err) {
  var lines = code.split('\n');
  var line = err.loc.line;
  var col = err.loc.column;
  var min = Math.max(0, line - CONTEXT - 1);
  var max = Math.min(lines.length, line + CONTEXT);
  var maxlen = String(max+1).length;

  var marker = _.padStart("v", col + maxlen + 3 + 1);
  var cleanerr = err.message.replace(/\([\d:]*\)$/i, '');

  var msg = "Failed to parse JS code:\n\n"
    + cleanerr + "\n\n"
    + marker + "\n"
    + lines.slice(min, max)
      .map(_fmtLine)
      .join("\n") + "\n";
  
  return msg;

  function _fmtLine(str, idx) {
    var lineno = min + idx + 1;
    var sep = (lineno === line) ? " > " : "   ";
    var out = _.padStart(String(lineno), maxlen) + sep + str;
    return out;
  }
}
