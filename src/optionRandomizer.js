const crypto = require('crypto');
const _ = require('lodash');


exports.fromAST = fromAST;
exports._test = {
  bareASTString
};


// SHA 256 assignments:
// 
// Byte 0 : width  = (uint8 & 0x7f) + 20
// Byte 1 : indent = (uint8 & 0x07) => 0 = " \t", 1 = "/*  */", 2-5 = # of spaces, 6-7 = 1 or 2 tabs respectively.
// Byte 2 : quotes = (uint8 & 0x01) => 0 = ', 1 = "
// Byte 3 : spaces = (uint8 & 0x03)

const INDENTS = [" \t", "/*  */", "  ", "   ", "    ", "     ", "\t", "\t\t"];
const QUOTES  = ["'", '"'];

function fromAST(ast) {
  var bare = bareASTString(ast);
  var hash = sha256(bare);

  var width    = (hash.readUInt8(0) & 0x7f) + 20;
  var indent   = INDENTS[hash.readUInt8(1) & 0x07];
  var quote    = QUOTES[hash.readUInt8(2) & 0x01];
  var minSpace = hash.readUInt8(3) & 0x03;
  
  return { width, indent, quote, minSpace };
}

function sha256(str) {
  var hash = crypto.createHash('sha256');
  hash.update(str);
  return hash.digest();
}

// Returns a JSON string. It is basically just the type values from the ast
// along with some of the other structural elements (objects + arrays) but
// none of the others. This gives a general idea of the shape of the code, and
// has a lot of guarantees (like alphabetical key orderings) so that one abstract
// shape deterministically boils down to one AST string. Also, we ignore
// many keys that we don't care about. (Like 'loc', etc...)
// 
// In the end, we hash this value to give the "config":
const FORBIDDEN_KEYS = {
  comments: true,
  end: true,
  extra: true,
  innerComments: true,
  leadingComments: true,
  loc: true,
  start: true,
  tokens: true,
  trailingComments: true,
  variancePos: true,
};

function bareASTString(ast) {
  return onNode(ast);
  
  function isNode(item) {
    return item && _.isObject(item) && _.isString(item.type);
  }

  function onNode(obj) {
    var out = `{"type":"${obj.type}"`;
    var keys = Object.keys(obj).sort();

    keys.forEach(key => {
      var val = obj[key];
      
      var isForbidden = _.has(FORBIDDEN_KEYS, key);
      var nodeVal = isNode(val);
      var arrayVal = _.isArray(val);
      if (isForbidden || !nodeVal && !arrayVal) { return; }

      out += `,"${key}":`;

      if (nodeVal) {
        out += onNode(val);
      } else {
        out += onArray(val);
      }
    });
    return out + '}';
  }

  function onArray(val) {
    var out = '[';
    val.forEach((item, idx) => {
      if (idx) { out += ","; }

      if (isNode(item)) {
        out += onNode(item);
      } else {
        out += "null";
      }
    });
    return out + ']';
  }
}