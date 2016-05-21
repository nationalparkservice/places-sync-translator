var generateTableSql = require('./generateTableSql');
var sources = require('places-sync-sources');
var tools = require('jm-tools');

module.exports = function (database, sourceConfig, tableName) {
  var tasks = [{
    'name': 'source',
    'description': 'Create the new source',
    'task': sources,
    'params': sourceConfig
  }, {
    'name': 'sourceData',
    'description': 'Pull the data from the source new',
    'task': '{{source.cache.selectAll}}',
    'params': []
  }, {
    'name': 'sourceColumns',
    'description': 'Pull the data from the source new',
    'task': '{{source.get.columns}}',
    'params': []
  }, {
    'name': 'closeCsvSource',
    'description': 'Pull the data from the source new',
    'task': '{{source.close}}',
    'params': []
  }, {
    'name': 'sqlStatements',
    'description': 'Creates SQL for creating and adding data to the table',
    'task': generateTableSql,
    'params': [tableName || sourceConfig.name, '{{sourceColumns}}']
  }, {
    'name': 'createTable',
    'description': 'Create the table in memory',
    'task': database.query,
    'params': '{{sqlStatements.create}}'
  }, {
    'name': 'insertData',
    'description': 'Create the data in memory',
    'task': database.queryList,
    'params': ['{{sqlStatements.insert}}', '{{sourceData}}']
  }];
  return tools.iterateTasks(tasks, 'sourceToTable', false);
};
