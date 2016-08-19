var toGeojson = require('../src/toGeojson');

var originalValue = [{
  'val': 1,
  'vala': 10,
  'geometry': '{}'
}, {
  'val': 2,
  'valb': 20,
  'geometry': '{}'
}, {
  'val': 4,
  'geometry': '{}'
}, {
  'val': 5,
  'geometry': '{}'
}];

var newValue = {
  'type': 'FeatureCollection',
  'features': [{
    'type': 'Feature',
    'geometry': {},
    'properties': {
      'val': 1,
      'vala': 10
    }
  }, {
    'type': 'Feature',
    'geometry': {},
    'properties': {
      'val': 2,
      'valb': 20
    }
  }, {
    'type': 'Feature',
    'geometry': {},
    'properties': {
      'val': 4
    }
  }, {
    'type': 'Feature',
    'geometry': {},
    'properties': {
      'val': 5
    }
  }]
};

module.exports = [{
  'name': 'toGeojson',
  'description': 'Run the function on an object',
  'task': toGeojson,
  'params': [originalValue],
  'operator': 'deepEqual',
  'expected': JSON.stringify(newValue)
}];
