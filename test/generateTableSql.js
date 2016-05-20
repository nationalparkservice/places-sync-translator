var generateTableSql = require('../src/generateTableSql');

var name = 'test';
var columns = [{
  'name': 'a',
  'type': 'text',
  'primaryKey': 0
}, {
  'name': 'b',
  'type': 'integer',
  'primaryKey': 1
}, {
  'name': 'c',
  'type': 'text'
}, {
  'name': 'd',
  'type': 'blob'
}, {
  'name': 'e',
  'type': 'real'
}];
var expectedCreate = 'CREATE TABLE "test" ("a" "text", "b" "integer", "c" "text", "d" "blob", "e" "real", primary key ("a", "b"));';
var expectedInsert = 'INSERT INTO "test" ("a", "b", "c", "d", "e") VALUES ({{a}}, {{b}}, {{c}}, {{d}}, {{e}});';

module.exports = [{
  'name': 'sqlStatements',
  'description': 'Creates SQL for creating and adding data to the table',
  'task': generateTableSql,
  'params': [name, columns],
  'operator': 'deepEqual',
  'expected': {
    'create': expectedCreate,
    'insert': expectedInsert
  }
}];
