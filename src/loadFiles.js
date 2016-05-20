var Promise = require('bluebird');
var fs = require('fs');
Promise.promisifyAll(fs);

module.exports = function (files) {
  var loadedFiles = {};
  var tasks = [];
  for (var file in files) {
    loadedFiles[file] = tasks.push(fs.readFileAsync(files[file], 'utf8')) - 1;
  }
  return Promise.all(tasks).then(function (results) {
    for (var loadedFile in loadedFiles) {
      loadedFiles[loadedFile] = results[loadedFiles[loadedFile]];
    }
    return new Promise(function (fulfill) {
      fulfill(loadedFiles);
    });
  });
};
