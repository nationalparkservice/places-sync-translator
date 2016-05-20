var databases = require('places-sync-databases');
var sourceToTable = require('../src/sourceToTable');
// var generateTableSql = require('../src/generateTableSql')

var memoryMasterConfig = {
  'type': 'sqlite',
  'connection': ':memory:'
};

var csvSourceConfig = {
  'name': 'csvTest',
  connection: {
    filePath: 'test/data/test.csv',
    'type': 'csv'
  },
  fields: {
    'primaryKey': 'a'
  }
};

module.exports = [{
  'name': 'memoryMaster',
  'description': 'Create a database in memory',
  'task': databases,
  'params': [memoryMasterConfig],
  'operator': 'structureEqual',
  'expected': {}
}, {
  'name': 'createTable',
  'description': 'Create the CSV source',
  'task': sourceToTable,
  'params': ['{{memoryMaster}}', csvSourceConfig],
  'operator': 'structureEqual',
  'expected': {}
}, {
  'name': 'checkTable',
  'description': 'Pull the data from the source CSV',
  'task': '{{memoryMaster.query}}',
  'params': ['SELECT * FROM ' + csvSourceConfig.name],
  'operator': 'structureEqual',
  'expected': []
}, {
  'name': 'closeMemoryMaster',
  'description': 'Closes the master database',
  'task': '{{memoryMaster.close}}',
  'params': [],
  'operator': 'structureEqual',
  'expected': {}
}];
