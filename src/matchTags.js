var buildMappedFieldsSQL = require('./buildMappedFieldsSQL');
var doubleReplace = require('./doubleReplace');
var loadFiles = require('./loadFiles');
var matchColumns = require('./matchColumns');
var mergeMappings = require('./mergeMappings');
var path = require('path');
var tools = require('jm-tools');

module.exports = function (tagDatabase, translationType, getjsonSource) {
  var primaryKey = tools.arrayify(getjsonSource.fields.primaryKey)[0];
  var tableName = getjsonSource.name;

  var sqlFiles = {
    'taggedValuesCreate': path.join(__dirname, '..', 'sql', 'taggedValuesCreate.sql'),
    'primaryKeysAdd': path.join(__dirname, '..', 'sql', 'primaryKeysAdd.sql'),
    'translationsGet': path.join(__dirname, '..', 'sql', 'translationsGet.sql'),
    'valuesFieldGet': path.join(__dirname, '..', 'sql', 'valuesFieldGet.sql'),
    'valueTagGet': path.join(__dirname, '..', 'sql', 'valueTagGet.sql'),
    'fieldFieldsGet': path.join(__dirname, '..', 'sql', 'fieldFieldsGet.sql')
  };

  var tasks = [{
    'name': 'loadedSqlFiles',
    'description': 'loads the SQL files into memory so we can run them against sqlite',
    'task': loadFiles,
    'params': sqlFiles
  }, {
    'name': 'createTaggingTable',
    'description': 'Created the table where the tagging values will go',
    'task': tagDatabase.query,
    'params': '{{loadedSqlFiles.taggedValuesCreate}}'
  }, {
    'name': 'addKeys',
    'description': 'add the primary keys to the tagging table',
    'task': doubleReplace,
    'params': ['{{loadedSqlFiles.primaryKeysAdd}}', {
      'primaryKey': primaryKey
    },
      null, tagDatabase.query
    ]
  }, {
    'name': 'addTranslatorInfo',
    'description': 'Add the translator fields',
    'task': tagDatabase.query,
    'params': ['{{loadedSqlFiles.translationsGet}}', {
      'translator': translationType
    }]
  }, {
    'name': 'getValueMappedField',
    'description': 'Determines which field is used for preset mapping',
    'task': tagDatabase.query,
    'params': ['{{loadedSqlFiles.valuesFieldGet}}', {
      'translator': translationType
    }]
  }, {
    'name': 'modifiedValueMappedField',
    'description': 'Add the primaryKey value to the getValueMappedField object',
    'task': function (arr, pk) {
      var obj = arr[0] || {};
      obj.primaryKey = pk;
      return obj;
    },
    'params': ['{{getValueMappedField}}', primaryKey]
  }, {
    'name': 'mapValues',
    'description': 'Map the values from the getValueMappedField to the presets',
    'task': doubleReplace,
    'params': ['{{loadedSqlFiles.valueTagGet}}', '{{modifiedValueMappedField}}', null, tagDatabase.query]
  }, {
    'name': 'mappedFieldInfo',
    'description': 'Get the information for all the mapped fields',
    'task': tagDatabase.query,
    'params': ['{{loadedSqlFiles.fieldFieldsGet}}', {
      'translator': translationType
    }]
  }, {
    'name': 'inputDataColumns',
    'description': 'Gets the columns of the input table to see which ones can be mapped',
    'task': tagDatabase.query,
    'params': ['PRAGMA table_info("' + tableName + '");']
  }, {
    'name': 'matchColumns',
    'description': 'Matches the columns in the Input Data table with the mapped ones',
    'task': matchColumns,
    'params': ['{{inputDataColumns}}', '{{mappedFieldInfo}}']
  }, {
    'name': 'buildMappedFieldsSQL',
    'description': 'Creates a SQL statement to get the rest of the fields',
    'task': buildMappedFieldsSQL,
    'params': [primaryKey, '{{matchColumns}}', tableName]
  }, {
    'name': 'runFieldQuery',
    'description': 'Runs the query from the last step',
    'task': tagDatabase.query,
    'params': '{{buildMappedFieldsSQL}}'
  }, {
    'name': 'returnTranslations',
    'description': 'Selects the full list from the tagged_values table',
    'task': tagDatabase.query,
    'params': 'SELECT * FROM "tagged_values";'
  }, {
    'name': 'finalMappings',
    'description': 'Create the final tag mappings',
    'task': mergeMappings,
    'params': [primaryKey, '{{runFieldQuery}}', '{{returnTranslations}}']
  }];
  return tools.iterateTasks(tasks, 'matchTags', false);
};
