const test = require('ava');
const mapLimit = require('../src/promises').mapLimit;
const _ = require('lodash');


test("Can handle arrays under the concurrency limit", function (t) {
  var wrapped = _callStats(_async);
  return mapLimit([1,2,3,4,5], 10, wrapped.fn)
    .then(res => {
      var stats = wrapped.stats();
      t.is(stats.calls, 5);
      t.is(stats.open, 0);
      t.is(stats.maxOpen, 5);
      t.deepEqual(res, [2,3,4,5,6]);
    });
});

test("Can handle arrays over the concurrency limit", function (t) {
  var wrapped = _callStats(_async);
  return mapLimit([1,2,3,4,5,6,7,8,9,10], 5, wrapped.fn)
    .then(res => {
      var stats = wrapped.stats();
      t.is(stats.calls, 10);
      t.is(stats.open, 0);
      t.is(stats.maxOpen, 5);
      t.deepEqual(res, [2,3,4,5,6,7,8,9,10,11]);
    });
});

test("Can handle errors at the beginning", function (t) {
  var wrapped = _callStats(_async);
  return mapLimit([new Error("WAT"),2,3,4,5,6,7,8,9,10], 5, wrapped.fn)
    .then(
      res => t.fail("Error condition resolved"),
      err => {
        var stats = wrapped.stats();
        t.is(stats.calls, 5);
        t.is(stats.open, 0);
        t.is(stats.maxOpen, 5);
        t.is(err.message, "WAT");
      }
    );
});

test("Can handle errors further down the road", function (t) {
  var wrapped = _callStats(_async);
  return mapLimit([1,2,3,4,5,6,7,8,new Error("LOL"),10,11,12,13,14,15,16,17,18,19,20], 5, wrapped.fn)
    .then(
      res => t.fail("Error condition resolved"),
      err => {
        var stats = wrapped.stats();
        t.true(stats.calls < 14);
        t.is(stats.open, 0);
        t.is(stats.maxOpen, 5);
        t.is(err.message, "LOL");
      }
    );
});

test("Can handle rejections without errors", function (t) {
  var wrapped = _callStats(_async);
  return mapLimit([1,2,3,4,5,undefined,7,8,9,10,11,12,13,14,15,16,17,18,19,20], 5, wrapped.fn)
    .then(
      res => t.fail("Error condition resolved"),
      err => {
        var stats = wrapped.stats();
        t.true(stats.calls < 10);
        t.is(stats.open, 0);
        t.is(stats.maxOpen, 5);
        t.is(err.message, "Promise was rejected");
      }
    );
});

// Used to track how callbacks are used:
function _callStats(callMe) {
  var calls = 0, open = 0, maxOpen = 0;
  
  return { stats, fn };

  function stats() {
    return { calls, open, maxOpen };
  }

  function fn() {
    calls++;
    open++;
    maxOpen = Math.max(maxOpen, open);

    return callMe.apply(this, arguments)
      .then(
        res => _done(false, res),
        err => _done(true, err)
      );

    function _done(isError, res) {
      open--;
      return isError 
        ? Promise.reject(res)
        : Promise.resolve(res);
    }
  };
}

// Will resolve to x + 1 in [0,100) ms
// Special case for errors: They resolve immediately
// To give more deterministic behaviors.
function _async(x) {
  return new Promise((resolve, reject) => {
    var time = Math.floor(Math.random() * 100);
    if (!_.isNumber(x)) {
      return reject(x);
    }
    setTimeout(
      () => resolve(x+1),
      time
    );
  });
}
