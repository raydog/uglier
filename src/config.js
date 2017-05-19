const _ = require('lodash');
const VALID_MODES = { console: 1, overwrite: 1 };

module.exports = Config;

function Config() {
  this.patterns = [];
  this.mode = "print"; // "print" or "overwrite"
  this.special = null; // "help" or "version"
}

Config.prototype.loadArgv = function(argv) {
  for (var i=2; i<argv.length; i++) {
    var arg = argv[i];
    switch (arg) {
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

      default:
        this.patterns.push(arg);
    }
  }
  return this;
};

Config.prototype.loadPackage = function(json) {
  var input = _.chain(json)
    .get("uglier")
    .pick("patterns", "mode")
    .value();

  if (_.isArray(input.patterns) && _.every(input.patterns, _.isString)) {
    this.patterns = this.patterns.concat(input.patterns);
  }

  if (input.mode === "print" || input.mode === "overwrite") {
    this.mode = input.mode;
  }

  return this;
};
