var tools = require('jm-tools');
var extractTags = require('./extractTags');

var parseJson = function (str) {
  var returnValue = {};
  try {
    returnValue = typeof str === 'string' ? JSON.parse(str) : str;
  } catch (e) {
    returnValue = {};
  }
  return returnValue;
};

module.exports = function (id, valueMappings, fieldMappings, origMappings) {
  var findOtherMapping = function (primaryKey, otherMappings) {
    return otherMappings.filter(function (row) {
      return row.id === primaryKey;
    })[0];
  };
  var finalMappings = fieldMappings.map(function (row) {
    var matchedObjs = tools.denullify(findOtherMapping(row[id], origMappings) || {});
    var matchedValueMapping = tools.denullify(findOtherMapping(row[id], valueMappings) || {});
    var cleanedMatchedValueMapping = extractTags(matchedValueMapping, 'id');
    var merged = tools.mergeObjects(
      parseJson(matchedObjs.preset_mapping),
      parseJson(matchedObjs.translator),
      cleanedMatchedValueMapping,
      tools.denullify(row)
    );
    // Remove ids
    delete merged.id;
    delete merged[id];
    return merged;
  });
  return finalMappings;
};
