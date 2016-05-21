var removeNulls = require('../src/removeNulls');

var originalValue = {
  'one': null,
  'two': undefined,
  'three': 3,
  'four': 'four',
  'five': 5.0
};
var newValue = {
  'three': 3,
  'four': 'four',
  'five': 5.0
};

module.exports = [{
  'name': 'removeNulls',
  'description': 'Run the function on an object',
  'task': removeNulls,
  'params': originalValue,
  'operator': 'deepEqual',
  'expected': newValue
}];
