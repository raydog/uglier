const path = require('path');
const fs = require('fs');
const uglier = require('../../src');

exports.testFactory = testFactory;
exports.fixtures = fs.readdirSync(path.join(__dirname, "../fixtures"))
  .filter(fname => fname.endsWith(".js"))
  .map(fname => path.join(__dirname, "../fixtures", fname));


/**
 * This test is to just make sure that the AST returned by uglier is equivalent to the AST in the
 * original code:
 */

function testFactory(t, path, conf) {
  return _loadTestFile(path)
    .then(code => {
      var codeOriginal = code;
      // console.log("--------");
      // console.log(codeOriginal);
      // console.log("--------");
      var codeMangled = uglier.mangleCode(codeOriginal, conf);
      // console.log(codeMangled);
      // console.log("--------");
      // ASTs are equal:
      t.deepEqual(uglier.cleanAST(codeOriginal), uglier.cleanAST(codeMangled));
    });
}

function _loadTestFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, { encoding: 'utf8' }, (err, data) => {
      if (err) { return reject(err); }
      resolve(data);
    });
  });
}
