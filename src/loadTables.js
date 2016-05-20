var Promise = require('bluebird');
var sourceToTable = require('./sourceToTable');

module.exports = function (database, sources) {
  return Promise.all(sources.map(function (source) {
    return sourceToTable(database, source, source.name);
  }));
};
