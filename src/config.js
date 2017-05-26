const _ = require('lodash');
const VALID_MODES = { console: 1, overwrite: 1 };

module.exports = Config;

function Config() {
  this.patterns = [];
  this.excludes = ["**/node_modules/**"];
  this._excludesDefault = true;
  this.mode = "print"; // "print" or "overwrite"
  this.special = null; // "help" or "version"
}

Config.prototype.loadArgv = function(argv) {
  for (var i=2; i<argv.length; i++) {
    var arg = _parseArg(argv[i]);
    switch (arg.key) {
      case '--help': case '-h':
        this.special = "help";
        return this;

      case '--version': case '-v':
        this.special = "version";
        return this;

      case '--print': case '-p':
        this.mode = "print";
        break;

      case '--overwrite': case '-o':
        this.mode = "overwrite";
        break;

      case '--exclude': case '-x':
        this._notDefaultExcludes()
        if (_.isString(arg.val)) {
          this.excludes.push(arg.val);
        } else if(i+1 < argv.length) {
          this.excludes.push(argv[++i]);
        } else {
          throw new Error("--exclude / -x needs a glob to exclude");
        }
        break;

      default:
        // NOTE: push the original:
        this.patterns.push(argv[i]);
    }
  }
  return this;
};

Config.prototype._notDefaultExcludes = function () {
  if (!this._excludesDefault) { return; }
  this._excludesDefault = false;
  this.excludes = [];
};

function _parseArg(arg) {
  if (/^--/.test(arg) && arg.includes("=")) {
    var m = arg.match(/^(.*?)=(.*)$/);
    return { key: m[1], val: m[2] };
  }
  return { key: arg, val: null };
}

Config.prototype.loadPackage = function(json) {
  var input = _.chain(json)
    .get("uglier")
    .pick("patterns", "mode", "exclude")
    .value();

  if (_.isArray(input.patterns) && _.every(input.patterns, _.isString)) {
    this.patterns = this.patterns.concat(input.patterns);
  }

  if (_.isArray(input.exclude) && _.every(input.exclude, _.isString)) {
    this._notDefaultExcludes();
    this.excludes = this.excludes.concat(input.exclude);
  }

  if (input.mode === "print" || input.mode === "overwrite") {
    this.mode = input.mode;
  }

  return this;
};
