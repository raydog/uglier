var _ = require('lodash');


exports.mangle = mangle;


function mangle(codez, conf) {
  var conf = _.defaults(conf, { width: 100, minSpace: 3, quote: '"', indent: "\t\t" });
  return codez
    .map(line => fuckUpLine(line, conf))
    .join("\n");
}

function fuckUpLine(line, conf) {
  var lines = [];
  var width = conf.width;
  var indent = "";

  // Not 100% accurate for tabs (at least not in my term) but whatever:
  var confIndentWidth = conf.indent.split("")
    .map(x => x === '\t' ? 8 : 1)
    .reduce((a,b) => a+b, 0);

  while (line.length) {
    var newConf = _.clone(conf);
    newConf.width = width;
    // Keep adding tokens until those tokens can no longer fit on a line with the current char spacing:
    for (var i=1; i<=line.length && _canFit(line.slice(0,i), newConf); i++) {
      // pass
    }
    i = Math.max(1, i-1);
    lines.push(indent + _spaceOut(line.slice(0, i), newConf));
    line = line.slice(i);
    indent = conf.indent;
    width = conf.width - confIndentWidth;
  }
  return lines.join("\n");
}

function _canFit(line, conf) {
  if (!isFinite(conf.width)) { return true; }
  var flat = _flatten(line, conf);
  var spaceCount = Math.max(0, flat.length-1) * conf.minSpace;
  var wc = _wordChars(flat);
  return wc + spaceCount <= conf.width;
}

// Not only flattens a line, but will add spaces to the ends of tokens that
// should be kept separate:
function _flatten(line, conf) {
  var flat = _.flattenDeep(line)
    .map(_convertQuotes.bind(null, conf));
  
  // If there's some minimum on spacing, just depend on that:
  if (conf.minSpace) { return flat; }
  
  // Else, there's no minimum, so we need to add spaces to some situations:
  for (var i=0; i<flat.length-1; i++) {
    var left = flat[i];
    var right = flat[i+1];
    if (_uncrunchable(left, right)) {
      flat[i] += " ";
    }
  }
  return flat;
}

// true if these tokens can't be safely joined without spaces:
const ID_RE = /[a-z0-9_$]/i;
function _uncrunchable(left, right) {
  var lc = left.charAt(left.length-1), rc = right.charAt(right.length-1);
  
  if (ID_RE.test(lc) && ID_RE.test(rc)) { return true; }

  // NOTE: +s and -s are also unsafe, but we use generous parens to disambiguate
  // these situations, so we should be fine without those special cases.
  return false;
}

function _wordChars(flat) {
  return _.sumBy(flat, "length");
}

function _spaceOut(line, conf) {
  var flat = _flatten(line, conf);
  var sc = Math.max(0, flat.length-1) * conf.minSpace;
  var wc = _wordChars(flat);
  var spaces = flat.length - 1;

  // If we've selected more tokens than can normally fit in this line, then
  // we'll just cut our losses, and join with minimal spacing. This is to
  // handle situations where a large number of unsplittable tokens are in a
  // narrow width scenario...
  if (wc + sc >= conf.width || !isFinite(conf.width)) {
    return flat.join(_.repeat(" ", conf.minSpace));
  }

  var remain = conf.width - wc;
  var each = Math.floor(remain / spaces);
  var mod = remain % spaces;

  return flat
    .map((word, idx) => {
      var suffix = (idx < spaces) ? _.repeat(" ", each) : "";
      if (idx < mod) { suffix += " "; }
      return word + suffix;
    })
    .join("");
}

function _convertQuotes(conf, word) {
  var f = word.charAt(0), l = word.charAt(word.length-1), q = conf.quote;
  return (f === l && f === "'")
    ? q + word.slice(1, -1) + q
    : word;
}
