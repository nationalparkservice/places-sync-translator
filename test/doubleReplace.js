var doubleReplace = require('../src/doubleReplace');

var originalValue = 'This is an {{adjective}} test of a {{adjective2}} tool that will {{verb}} your {{pluralNoun}}.';
var replacers = {
  'adjective': 'awesome',
  'adjective2': 'super cool',
  'verb': 'changify',
  'pluralNoun': 'strings'
};
var newValue = 'This is an awesome test of a super cool tool that will changify your strings.';

module.exports = [{
  'name': 'doubleReplace',
  'description': 'Run the function on a string',
  'task': doubleReplace,
  'params': [originalValue, replacers, {},
    function (a, b) {
      return [a, b];
    }
  ],
  'operator': 'deepEqual',
  'expected': [newValue, {}]
}];
