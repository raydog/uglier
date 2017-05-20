const test = require('ava').test;
const syntax = require('./utils/syntax');


// Test each one:
syntax.fixtures.forEach(path => {
  var purtyName = path.replace(/^.*\/|\..*?$/g, '');
  test(`Handles ${purtyName}`, syntax.testFactory, path, { width: 80, minSpace: 1 });
});
