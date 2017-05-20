const test = require('ava').test;
const syntax = require('./utils/syntax');
const path = require('path');

// Only need to test the literal fixture for these:
var fixturePath = path.join(__dirname, "./fixtures/literals.js");
test(`Can do double`, syntax.testFactory, fixturePath, { width: 80, minSpace: 1, quotes: '"' });
test(`Can do single`, syntax.testFactory, fixturePath, { width: 80, minSpace: 1, quotes: "'" });
