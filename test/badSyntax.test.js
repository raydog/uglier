const test = require('ava');
const astHandler = require('../src/astHandler');
const parser = require('../src/parser');

test("Throws on a null AST", function (t) {
  t.throws(
    () => astHandler.gurgitateAST(null),
    /Unknown AST Node.*null/i
  );
});

test("Throws on an unknown AST", function (t) {
  t.throws(
    () => astHandler.gurgitateAST({ type: "DerpityNode" }),
    /Unknown AST Node.*derpitynode/i
  );
});

test("Pretty prints bad syntax from parser", function (t) {
  var bad_syntax = `
  /*
    OH BOY, THIS IS SOME BAAAAAD SYNTAX RIGHT HERE:
   */
  var a{123} = 20;
  `;
  t.throws(
    () => parser.parseJS(bad_syntax),
    /Failed to parse JS code/i
  );
});

test("Passes through other errors", function (t) {
  t.throws(
    () => parser.parseJS(null)
  );
});