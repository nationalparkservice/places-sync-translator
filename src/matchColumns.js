module.exports = function (actualColumns, mappings) {
  var newMappings = {};
  var rankedColumns = actualColumns.map(function (column) {
    var rankedMappings = mappings.map(function (mapColumn) {
      var altNames = [];
      try {
        altNames = JSON.parse(mapColumn['Alternate GIS Names']);
      } catch (e) {
        altNames = [];
      }
      var rank = -1;
      if (column.name === mapColumn['GIS Field Name']) {
        rank = 0;
      } else {
        rank = altNames.indexOf(column.name);
        rank = rank > -1 ? rank + 1 : -1;
      }
      return {
        'tag': mapColumn['Places Tag Name'],
        'col': column.name,
        'rank': rank
      };
    }).filter(function (r) {
      return r.rank > -1;
    }).sort(function (a, b) {
      return a.rank - b.rank;
    });
    if (rankedMappings[0]) {
      newMappings[column.name] = rankedMappings[0].tag;
    }
    return rankedMappings;
  });
  // TODO: Go through the new mappings and see if there are dups
  return newMappings;
};
