# Uglier

[![Build Status](https://travis-ci.org/raydog/uglier.svg?branch=master)](https://travis-ci.org/raydog/uglier) [![Coverage Status](https://coveralls.io/repos/github/raydog/uglier/badge.svg?branch=master)](https://coveralls.io/github/raydog/uglier?branch=master) [![NPM Version](https://img.shields.io/npm/v/uglier.svg)](https://www.npmjs.com/package/uglier)

Uglier is a super simple tool that takes modern JS and makes it objectively worse.

Input:
```javascript
// Print fibonacci sequence up to a given value:
function *fibon(limit) {
  var a = 0, b = 1;
  while (a <= limit) {
    yield a;
    [a, b] = [b, a+b];
  }
}

for (let val of fibon(89)) {
  console.log(val);
}
```

Output:
```javascript
function*fibon(limit){let a=0,b=1;while((a<=limit)){yield a;([a,b]=[b,(
    a        +        b       )       ]       )       ;       }       }
for ( let  val  of  fibon ( 89 ) ) { ( console . log ) ( '>>' , val );}
```

There. Much better!

"Features" include:
- Supports most Javascript features supported by Babylon. Also supports many Flow types.
- Convenient globbing features make it easy to overhaul an entire repo.
- All comments are removed. I mean, why would anyone spend precious bytes of storage on code that doesn't *DO* anything?
- Several formatting features (like the number of spaces when indenting or the target characters per line) are determined by a hash of the file's AST structure. So minor changes (variable names, comments, spacing) won't change anything. But adding another variable would cause the whole file to update. Take that, git blame!

## Making Bad Decisions (AKA: Installing)

- npm: `npm install --save-dev uglier`
- yarn: `yarn add -D uglier`

## Inflicting Maximum Damage (AKA: Running)

Usage: `uglier [options...] <glob> ...`

#### Options:
- `<glob>`<br>
  Globs provided in the command line will match file for updating.

- `-p`, `--print`<br>
  Run in "print" mode, where the results are written to stdout. This is the default, so you normally wouldn't have to use this option.

- `-o`, `--overwrite`<br>
  Run in "overwrite" mode, where any matched file that we can parse will be updated.

- `-x` `<glob>`, `--exclude=<glob>`<br>
  Exclude files that match a certain Glob pattern from the list of files to update. Multiple exclusion Globs can be provided by using this option multiple times. Default exclusion pattern is `**/node_modules/**`

- `-h`, `--help`<br>
  Print a help message.

- `-v`, `--version`<br>
  Print the current uglier version.

#### Globs:

Globs are handled with the excellent [globby](https://github.com/sindresorhus/globby) library, which uses [node-glob](https://github.com/isaacs/node-glob) for the actual glob parsing. That syntax is [described here](https://github.com/isaacs/node-glob#glob-primer).

## License
MIT.
