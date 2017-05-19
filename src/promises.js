exports.mapLimit = mapLimit;

/**
 * Will call `fn` on each item in `array`, and resolve an array of those values, but will
 * make sure that no more than `limit` promises are pending at any given time.
 * 
 * @param  {Any}      array Array of values
 * @param  {Number}   limit Maximum number of promises that will be pending at any given time.
 * @param  {Function} fn    Function to turn individual items in array into promises.
 * @return {Promise<Array>} An array of the values that 
 */
function mapLimit(array, limit, fn) {
  var idx = 0;
  var out = Array(array.length);
  var err = null;
  var pending = 0;

  limit = Math.min(limit, array.length);

  return new Promise((resolve, reject) => {
    
    // Kick off `limit` workers:
    for (var i=0; i<limit; i++) {
      runIndex(idx++);
    }

    function runIndex(myIdx) {
      var item = array[myIdx];
      pending++;

      // Call the function as a Promise callback to protect from exceptions:
      Promise.resolve(item)
        .then(fn)
        .then(
          onOk.bind(null, myIdx),
          onFail
        );
    }

    function onOk(myIdx, val) {
      pending--;

      out[myIdx] = val;

      if (!err && idx < array.length) {
        return runIndex(idx++);
      }

      tryEnd();
    }

    function onFail(fail) {
      pending--;
      err = err || fail || new Error("Promise was rejected");
      tryEnd();
    }

    function tryEnd() {
      if (pending !== 0) { return; }
      if (err) { return reject(err); }
      resolve(out);
    }
  });
}
