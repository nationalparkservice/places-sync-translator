var buildMappedFieldsSql = require('./buildMappedFieldsSql');
var buildMappedValuesSql = require('./buildMappedValuesSql');
var doubleReplace = require('./doubleReplace');
var loadFiles = require('./loadFiles');
var matchColumns = require('./matchColumns');
var mergeMappings = require('./mergeMappings');
var path = require('path');
var tools = require('jm-tools');

module.exports = function (tagDatabase, getjsonSource) {
  var primaryKey = tools.arrayify(getjsonSource.fields.primaryKey)[0];
  var tableName = getjsonSource.name;
  var translationType = getjsonSource.connection.translationType || 'generic';

  var sqlFiles = { // TODO: These need more descriptive names!
    'createTempTagTable': path.join(__dirname, '..', 'sql', 'createTempTagTable.sql'),
    'insertPrimaryKeys': path.join(__dirname, '..', 'sql', 'insertPrimaryKeys.sql'),
    'addTranslatorSettings': path.join(__dirname, '..', 'sql', 'addTranslatorSettings.sql'),
    'getPresetFields': path.join(__dirname, '..', 'sql', 'getPresetFields.sql'),
    'getTranslatedValues': path.join(__dirname, '..', 'sql', 'getTranslatedValues.sql'),
    'addPresetSettings': path.join(__dirname, '..', 'sql', 'addPresetSettings.sql'),
    'getMappedFields': path.join(__dirname, '..', 'sql', 'getMappedFields.sql')
  };

  var tasks = [{
    'name': 'loadedSqlFiles',
    'description': 'loads the SQL files into memory so we can run them against sqlite',
    'task': loadFiles,
    'params': [sqlFiles]
  }, {
    'name': 'createTaggingTable',
    'description': 'Created the table where the tagging values will go',
    'task': tagDatabase.query,
    'params': ['{{loadedSqlFiles.createTempTagTable}}']
  }, {
    'name': 'addKeys',
    'description': 'add the primary keys to the tagging table',
    'task': doubleReplace,
    'params': ['{{loadedSqlFiles.insertPrimaryKeys}}', {
      'sourceName': tableName,
      'primaryKey': primaryKey
    },
      null, tagDatabase.query
    ]
  }, {
    'name': 'addTranslatorInfo',
    'description': 'Add the translator fields',
    'task': tagDatabase.query,
    'params': ['{{loadedSqlFiles.addTranslatorSettings}}', {
      'translator': translationType
    }]
  }, {
    'name': 'getPresetMappedField',
    'description': 'Determines which field is used for preset mapping',
    'task': tagDatabase.query,
    'params': ['{{loadedSqlFiles.getPresetFields}}', {
      'translator': translationType
    }]
  }, {
    'name': 'modifiedPresetMappedField',
    'description': 'Add the primaryKey value to the getPresetMappedField object',
    'task': function (arr, pk) {
      var obj = arr[0] || {};
      obj.primaryKey = pk;
      obj.sourceName = tableName;
      return obj;
    },
    'params': ['{{getPresetMappedField}}', primaryKey]
  }, {
    'name': 'mapValues',
    'description': 'Map the values from the getPresetMappedField to the presets',
    'task': function (_, mappings) {
      if (!mappings.valueField) {
        return;
      } else {
        return doubleReplace.apply(this, arguments);
      }
    },
    'params': ['{{loadedSqlFiles.addPresetSettings}}', '{{modifiedPresetMappedField}}', null, tagDatabase.query]
  }, {
    'name': 'mappedValueInfo',
    'description': 'Get the information for all the mapped values',
    'task': tagDatabase.query,
    'params': ['{{loadedSqlFiles.getTranslatedValues}}', {
      'translator': translationType
    }]
  }, {
    'name': 'mappedFieldInfo',
    'description': 'Get the information for all the mapped fields',
    'task': tagDatabase.query,
    'params': ['{{loadedSqlFiles.getMappedFields}}', {
      'translator': translationType
    }]
  }, {
    'name': 'inputDataColumns',
    'description': 'Gets the columns of the input table to see which ones can be mapped',
    'task': tagDatabase.query,
    'params': ['PRAGMA table_info("' + tableName + '");']
  }, {
    'name': 'matchFieldColumns',
    'description': 'Matches the columns in the Input Data table with the mapped ones',
    'task': matchColumns,
    'params': ['{{inputDataColumns}}', '{{mappedFieldInfo}}']
  }, {
    'name': 'buildMappedFieldsSql',
    'description': 'Creates a SQL statement to get the rest of the fields',
    'task': buildMappedFieldsSql,
    'params': [primaryKey, '{{matchFieldColumns}}', tableName]
  }, {
    'name': 'buildMappedValuesSql',
    'description': 'Creates a SQL statement to get the rest of the fields',
    'task': buildMappedValuesSql,
    'params': [primaryKey, '{{inputDataColumns}}', '{{mappedValueInfo}}', tableName]
  }, {
    'name': 'runValueQuery',
    'description': 'Runs the query from the last step',
    'task': tagDatabase.query,
    'params': ['{{buildMappedValuesSql}}']
  }, {
    'name': 'runFieldQuery',
    'description': 'Runs the query from the last step',
    'task': tagDatabase.query,
    'params': ['{{buildMappedFieldsSql}}']
  }, {
    'name': 'returnTranslations',
    'description': 'Selects the full list from the tagged_values table',
    'task': tagDatabase.query,
    'params': ['SELECT * FROM "tagged_values";']
  }, {
    'name': 'finalMappings',
    'description': 'Create the final tag mappings',
    'task': mergeMappings,
    'params': [primaryKey, '{{runValueQuery}}', '{{runFieldQuery}}', '{{returnTranslations}}']
  }];
  return tools.iterateTasks(tasks, 'matchTags', false);
};
