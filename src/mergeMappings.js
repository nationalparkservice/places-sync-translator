var tools = require('jm-tools');
var extractTags = require('./extractTags');

module.exports = function (id, valueMappings, fieldMappings, origMappings) {
  var findOtherMapping = function (primaryKey, otherMappings) {
    return otherMappings.filter(function (row) {
      return row['id'] === primaryKey;
    })[0];
  };
  var finalMappings = fieldMappings.map(function (row) {
    var matchedObjs = tools.denullify(findOtherMapping(row[id], origMappings) || {});
    var matchedValueMapping = tools.denullify(findOtherMapping(row[id], valueMappings) || {});
    var matchedCleanValues = extractTags(matchedValueMapping, 'id');
    return tools.mergeObjects(matchedObjs.translator, matchedObjs.preset_mapping, matchedCleanValues, tools.denullify(row));
  });
  return finalMappings;
};
