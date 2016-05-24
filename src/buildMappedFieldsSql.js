var tools = require('jm-tools');
var fandlebars = require('fandlebars');

module.exports = function (id, mappings, inputDataTableName) {
  var sqlStatement = 'SELECT {{columns}} FROM "' + inputDataTableName + '";';
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
