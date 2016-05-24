var fs = require('fs');
var path = require('path');
var test = require('./');

var geojsonSource = {
  'name': 'Input data',
  'connection': {
    'data': fs.readFileSync(path.join(__dirname, '/test/data/exampleRoads.geojson'), 'UTF8'),
    'type': 'geojson'
  },
  fields: {
    'primaryKey': 'GlobalID'
  }
};

test(geojsonSource, 'roads').then(function (r) {
  console.log(JSON.stringify(JSON.parse(r), null, 2));
}).catch(function (e) {
  throw e;
});
