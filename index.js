var databases = require('places-sync-databases');
var loadTables = require('./src/loadTables');
var path = require('path');
var tools = require('jm-tools');
var loadFiles = require('./src/loadFiles');

var memoryMasterConfig = {
  'type': 'sqlite',
  'connection': ':memory:'
};

var fandlebars = require('fandlebars');
var doubleReplace = function (orig, replace1, replace2, next) {
  return next(fandlebars(orig, replace1), replace2);
};

var matchColumns = function (actualColumns, mappings) {
  var newMappings = {};
  var rankedColumns = actualColumns.map(function (column) {
    var rankedMappings = mappings.map(function (mapColumn) {
      var altNames = [];
      try {
        altNames = JSON.parse(mapColumn['Alternate GIS Names']);
      } catch (e) {
        altNames = [];
      }
      var rank = -1;
      if (column.name === mapColumn['GIS Field Name']) {
        rank = 0;
      } else {
        rank = altNames.indexOf(column.name);
        rank = rank > -1 ? rank + 1 : -1;
      }
      return {
        'tag': mapColumn['Places Tag Name'],
        'col': column.name,
        'rank': rank
      };
    }).filter(function (r) {
      return r.rank > -1;
    }).sort(function (a, b) {
      return a.rank - b.rank;
    });
    if (rankedMappings[0]) {
      newMappings[column.name] = rankedMappings[0].tag;
    }
    return rankedMappings;
  });
  // TODO: Go through the new mappings and see if there are dups
  return newMappings;
};

var buildMappedFieldsSQL = function (id, mappings) {
  var sqlStatement = 'SELECT {{columns}} FROM "Input Data";';
  var columns = [];
  mappings[id] = id;
  mappings.geometry = 'geometry';
  for (var column in mappings) {
    columns.push(tools.surroundValues(column, '"') + ' AS "' + mappings[column] + '"');
  }
  return fandlebars(sqlStatement, {
    'columns': columns.join(',')
  });
};

var mergeMappings = function (id, fieldMappings, otherMappings) {
  var findOtherMapping = function (primaryKey) {
    return otherMappings.filter(function (row) {
      return row[id] === primaryKey;
    })[0];
  };
  var finalMappings = fieldMappings.map(function (row) {
    var matchedObjs = findOtherMapping(row[id]) || {};
    return tools.mergeObjects(matchedObjs.translator, matchedObjs.value_mapping, row);
  });
  return finalMappings;
};

var matchTags = function (tagDatabase, translationType) {
  var sqlFiles = {
    'taggedValuesCreate': path.join(__dirname, 'sql', 'taggedValuesCreate.sql'),
    'primaryKeysAdd': path.join(__dirname, 'sql', 'primaryKeysAdd.sql'),
    'translationsGet': path.join(__dirname, 'sql', 'translationsGet.sql'),
    'valuesFieldGet': path.join(__dirname, 'sql', 'valuesFieldGet.sql'),
    'valueTagGet': path.join(__dirname, 'sql', 'valueTagGet.sql'),
    'fieldFieldsGet': path.join(__dirname, 'sql', 'fieldFieldsGet.sql'),
    'fieldTagsGet': path.join(__dirname, 'sql', 'fieldTagsGet.sql')
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
    'task': tagDatabase.query,
    'params': '{{loadedSqlFiles.primaryKeysAdd}}'
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
    'name': 'mapValues',
    'description': 'Map the values from the getValueMappedField to the presets',
    'task': doubleReplace,
    'params': ['{{loadedSqlFiles.valueTagGet}}', '{{getValueMappedField.0}}', null, tagDatabase.query]
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
    'params': ['PRAGMA table_info("Input Data");']
  }, {
    'name': 'matchColumns',
    'description': 'Matches the columns in the Input Data table with the mapped ones',
    'task': matchColumns,
    'params': ['{{inputDataColumns}}', '{{mappedFieldInfo}}']
  }, {
    'name': 'buildMappedFieldsSQL',
    'description': 'Creates a SQL statement to get the rest of the fields',
    'task': buildMappedFieldsSQL,
    'params': ['GlobalID', '{{matchColumns}}']
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
    'params': ['GlobalID', '{{runFieldQuery}}', '{{returnTranslations}}']
  }];
  return tools.iterateTasks(tasks, 'matchTags', false);
};

var test = module.exports = function (geojson, translationType) {
  var sources = [{
    'name': 'Translators',
    'connection': {
      'filePath': path.join(__dirname, '/translations/datatypes.csv'),
      'type': 'csv'
    },
    'fields': {
      'primaryKey': ['Name']
    }
  }, {
    'name': 'Field Mapping',
    'connection': {
      'filePath': path.join(__dirname, '/translations/fields.csv'),
      'type': 'csv'
    },
    'fields': {
      'primaryKey': ['Translator', 'GIS Field Name']
    }
  }, {
    'name': 'Value Mapping',
    'connection': {
      'filePath': path.join(__dirname, '/translations/values.csv'),
      'type': 'csv'
    },
    'fields': {
      'primaryKey': ['Translator', 'GIS Field Name', 'GIS Field Value']
    }
  }, {
    'name': 'Preset_Classes',
    'connection': {
      'filePath': path.join(__dirname, '/translations/presets.csv'),
      'type': 'csv'
    },
    'fields': {
      'primaryKey': ['superclass', 'class', 'type', 'point', 'line', 'polygon']
    }
  }, {
    'name': 'Input data',
    'connection': {
      'data': geojson,
      'type': 'geojson'
    },
    fields: {
      'primaryKey': 'GlobalID'
    }
  }];

  // First we open a database to add all of those translations
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
    'name': 'matchTags',
    'description': 'Matches the tags',
    'task': matchTags,
    'params': ['{{masterDatabase}}', translationType]
  }, {
    'name': 'finalMappings',
    'description': 'Matches the tags',
    'task': function(_){return _;},
    'params': ['{{matchTags.finalMappings}}']
  }];
  // Add each translation file to a memory database (propose to have these added tp cartodb)
  // Translators (https://docs.google.com/spreadsheets/d/1V8DsAeBipMrll2rmjjTZ6fYTE8g69dI9k6V762K4PYA/edit#gid=2039898153)
  // Field Mapping (https://docs.google.com/spreadsheets/d/1V8DsAeBipMrll2rmjjTZ6fYTE8g69dI9k6V762K4PYA/edit#gid=2039898153)
  // Value Mapping (https://docs.google.com/spreadsheets/d/1V8DsAeBipMrll2rmjjTZ6fYTE8g69dI9k6V762K4PYA/edit#gid=2039898153)
  // Preset_Classes (https://docs.google.com/spreadsheets/d/1XFqkmIYMEp73q9flgNto9QJim6N5hbacgkUAgdf0rhE/edit#gid=0)

  // Add the geojson file into SQLite

  // Probably dont do this
  // Clean up these databases to make our job easier (less where clauses all over the place!)
  // Delete Translators that don't match our translationType
  // Delete field mappings that don't match our translationType
  // Delete value mappings that don't match our translationType
  // Delete presets that don't match our geometry types

  // Find the field that maps to Preset Classes in the value mapping document
  // SELECT "GIS Field Name" FROM value_mapping WHERE "GIS Field Value" = '*' AND "Translator" = {{translationType}}

  // Create a table to keep track of the tags
  // CREATE TABLE taggging (id, tagset, priority)

  // Get the default tags for this datatype (if any)
  // INSERT INTO TABLE id, tagset, 1
  // SELECT "Default Tags" from "Translators" WHERE "Translator" = {{translationType}}

  // Look through preset classes to determine what the best preset is
  // INSERT INTO TABLE id, tagset, 2
  // SELECT name, (SELECT a FROM (SELECT a, CASE WHEN a = tags.name THEN 1 WHEN instr(b, '"' || tags.name || '"') then length(substr(b, 0, instr(b, '"' || tags.name || '"'))) - length(replace(substr(b, 0, instr(b, '"' || tags.name || '"')), ',', '')) + 2 ELSE null END as rank from tmp where rank is not null order by rank limit 1)) AS preset FROM tags

  // Go through the value mappings and match them up
  // CREATE TABLE values AS SELECT "Global Id" as id,

  // Go through the field mappings and match them up
  // CREATE TABLE values AS SELECT "Global Id" as id', '{"' || "Places Tag Name" || '": "' || value || '"}'

  // For each object in the GeoJSON, match the tags that are associated
  // merge the tag objects with the matches, in the order of their priority

  // Return the GeoJSON with updated data
  return tools.iterateTasks(tasks, 'places-sync-translator', false);
};

var fs = require('fs');
test(fs.readFileSync(path.join(__dirname, '/test/data/exampleCampground.geojson'), 'UTF8'), 'poi').then(function (r) {
  console.log('done');
  console.log(JSON.stringify(r.finalMappings, null, 2));
}).catch(function (e) {
  throw e;
});
