var fs = require('fs');
var path = require('path');
var test = require('./');

var geojsonSource = {
  'name': 'Input data',
  'connection': {
    // 'data': fs.readFileSync(path.join(__dirname, '/test/data/exampleCampground.geojson'), 'UTF8'), // poi
    'data': fs.readFileSync(path.join(__dirname, '/test/data/exampleRoads.geojson'), 'UTF8'), // roads
    // 'data': fs.readFileSync(path.join(__dirname, '/test/data/exampleParkingLots.geojson'), 'UTF8'), //parkinglots
    'translationType': 'roads', // poi trails parkinglots
    'type': 'geojson'
  },
  fields: {
    'primaryKey': 'GlobalID'
  }
};

test(geojsonSource).then(function (r) {
  console.log(JSON.stringify(JSON.parse(r), null, 2));
}).catch(function (e) {
  throw e;
});
