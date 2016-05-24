var extractTags = require('../src/extractTags');

var blankTest = {};
var data = {
  'id': 1,
  'obj': {
    'a': 1,
    'b': 2
  },
  'string': JSON.stringify({
    'c': 3,
    'd': 4
  }),
  'number': 5
};

module.exports = [{
  'name': 'testBlank',
  'description': 'Run with empty data',
  'task': extractTags,
  'params': blankTest,
  'operator': 'deepEqual',
  'expected': {}
}, {
  'name': 'testIgnoreAll',
  'description': 'Run with empty data',
  'task': extractTags,
  'params': [data, ['id', 'obj', 'string', 'number']],
  'operator': 'deepEqual',
  'expected': {}
}, {
  'name': 'testString',
  'description': 'Test the String type',
  'task': extractTags,
  'params': [data, ['id', 'obj', 'number']],
  'operator': 'deepEqual',
  'expected': {
    'c': 3,
    'd': 4
  }
}, {
  'name': 'testObj',
  'description': 'Test the Object type',
  'task': extractTags,
  'params': [data, ['id', 'string', 'number']],
  'operator': 'deepEqual',
  'expected': {
    'a': 1,
    'b': 2
  }
}, {
  'name': 'testNumber',
  'description': 'Test the Number type',
  'task': extractTags,
  'params': [data, ['id', 'obj', 'string']],
  'operator': 'deepEqual',
  'expected': {
  }
}, {
  'name': 'testAll',
  'description': 'Test all types',
  'task': extractTags,
  'params': [data],
  'operator': 'deepEqual',
  'expected': {
    'a': 1,
    'b': 2,
    'c': 3,
    'd': 4
  }
}, {
  'name': 'testWithIdString',
  'description': 'Test by passing id in as a string',
  'task': extractTags,
  'params': [data, 'id'],
  'operator': 'deepEqual',
  'expected': {
    'a': 1,
    'b': 2,
    'c': 3,
    'd': 4
  }
}, {
  'name': 'testWithIdString',
  'description': 'Test by passing id in as an Array',
  'task': extractTags,
  'params': [data, ['id']],
  'operator': 'deepEqual',
  'expected': {
    'a': 1,
    'b': 2,
    'c': 3,
    'd': 4
  }
}];
