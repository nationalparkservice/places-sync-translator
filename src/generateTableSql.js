// Creates the SQL for creating a table and inserting into it
// The name parameter is what the table will be called
// the columns parameter is the same as the columns used in places-sync-sources
var fandlebars = require('fandlebars');
var tools = require('jm-tools');

module.exports = function (name, columns) {
  var createSql = 'CREATE TABLE {{table}} ({{columnFields}}, primary key ({{primaryKeys}}));';
  var insertSql = 'INSERT INTO {{table}} ({{columnNames}}) VALUES ({{columnList}});';
  var replaceFields = {
    'table': tools.surroundValues(name.split('.'), '"').join('.'),
    'columnFields': columns.map(function (column) {
      return tools.surroundValues(column.name, '"') + ' ' + tools.surroundValues(column.type, '"');
    }).join(', '),
    'primaryKeys': columns.filter(function (c) {
      return c.primaryKey || c.primaryKey === 0;
    }).map(function (c) {
      return tools.surroundValues(c.name, '"');
    }).join(', '),
    'columnNames': tools.surroundValues(tools.simplifyArray(columns), '"').join(', '),
    'columnList': tools.surroundValues(tools.simplifyArray(columns), '{{', '}}').join(', ')
  };

  return {
    'create': fandlebars(createSql, replaceFields),
    'insert': fandlebars(insertSql, replaceFields)
  };
};
