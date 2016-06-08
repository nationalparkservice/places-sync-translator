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
  var metadataColumns = ['id'];
  var geometryColumns = ['geometry'];
  var feature = {
    'type': 'Feature',
    'geometry': JSON.parse(row.geometry),
    'metadata': {},
    'properties': {}
  };
  for (var property in row) {
    if (metadataColumns.indexOf(property) === -1 && geometryColumns.indexOf(property) === -1) {
      feature.properties[property] = row[property];
    } else if (metadataColumns.indexOf(property) !== -1) {
      feature.metadata[property] = row[property];
    }
  }
  return feature;
};
