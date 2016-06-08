module.exports = function (tableJson) {
  var geojson = {
    'type': 'FeatureCollection',
    'features': []
  };

  for (var index = 0; index < tableJson.length; index++) {
    geojson.features.push(createFeature(tableJson[index]));
  }

  return JSON.stringify(geojson);
};

var createFeature = function (row) {
  row = JSON.parse(JSON.stringify(row));
  var metadataColumn = 'id';
  var geometryColumn = 'geometry';
  var feature = {
    'type': 'Feature',
    'geometry': JSON.parse(row[geometryColumn]),
    'osmId': undefined,
    'osmVersion': undefined,
    'foreignKey': row[metadataColumn],
    'properties': {}
  };
  for (var property in row) {
    if (property !== metadataColumn && property !== geometryColumn) {
      feature.properties[property] = row[property];
    }
  }
  return feature;
};
