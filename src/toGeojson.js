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
  var metadataColumn = '_primary_key';
  var geometryColumn = 'geometry';
  var feature = {
    'type': 'Feature',
    'geometry': JSON.parse(row[geometryColumn]),
    'foreignKey': row[metadataColumn],
    'properties': {}
  };
  for (var property in row) {
    if (property !== metadataColumn && property !== geometryColumn) {
      if (row[property].toString().trim().length > 0) {
        feature.properties[property] = row[property];
      }
    }
  }
  return feature;
};
