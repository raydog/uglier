const fs = require('fs');


exports.readFile = readFile;
exports.writeFile = writeFile;
exports.mkdir = mkdir;


function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, { encoding: 'utf8' }, (err, data) => {
      if (err) { return reject(err); }
      resolve(data);
    });
  });
}

function writeFile(path, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, { encoding: 'utf8' }, (err) => {
      if (err) { return reject(err); }
      resolve(path);
    });
  });
}

function mkdir(path) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, (err) => {
      if (err) { return reject(err); }
      resolve(path);
    });
  });
}
