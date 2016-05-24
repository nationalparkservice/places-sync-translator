var tools = require('jm-tools');

module.exports = function (id, valueMappings, fieldMappings, origMappings) {
  var findOtherMapping = function (primaryKey, otherMappings) {
    return otherMappings.filter(function (row) {
      return row['id'] === primaryKey;
    })[0];
  };
  var finalMappings = fieldMappings.map(function (row) {
    var matchedObjs = findOtherMapping(row[id], origMappings) || {};
    var matchedValueMapping = findOtherMapping(row[id], valueMappings) || {};
    return tools.mergeObjects(matchedObjs.translator, matchedObjs.value_mapping, matchedValueMapping, row);
  });
  return finalMappings;
};
