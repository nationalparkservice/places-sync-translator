var Promise = require('bluebird');
var databases = require('places-sync-databases');
var loadTables = require('./src/loadTables');
var matchTags = require('./src/matchTags');
var path = require('path');
var removeNulls = require('./src/removeNulls');
var sources = require('./translations');
var toGeojson = require('./src/toGeojson');
var tools = require('jm-tools');

var memoryMasterConfig = {
  'type': 'sqlite',
  'connection': ':memory:'
};

// Add the path to the csv files
sources = sources.map(function (source) {
  source.connection.filePath = path.join(__dirname, 'translations', source.connection.filePath);
  return source;
});

module.exports = function (geojsonSource) {
  var tasks = [{
    'name': 'masterDatabase',
    'description': 'Create a new database in memory',
    'task': databases,
    'params': [memoryMasterConfig]
  }, {
    'name': 'loadedTables',
    'description': 'Load the tables all into the database',
    'task': loadTables,
    'params': ['{{masterDatabase}}', sources]
  }, {
    'name': 'loadedGeojson',
    'description': 'Load the geojson source into the database',
    'task': loadTables,
    'params': ['{{masterDatabase}}', [geojsonSource]]
  }, {
    'name': 'matchTags',
    'description': 'Matches the tags',
    'task': matchTags,
    'params': ['{{masterDatabase}}', geojsonSource]
  }, {
    'name': 'finalMappings',
    'description': 'Matches the tags',
    'task': function (_) {
      return _;
    },
    'params': ['{{matchTags.finalMappings}}']
  }];
  return tools.iterateTasks(tasks, 'places-sync-translator', false).then(function (results) {
    return new Promise(function (resolve) {
      resolve(toGeojson(results.finalMappings.map(function (row) {
        return removeNulls(row);
      })));
    });
  });
};
