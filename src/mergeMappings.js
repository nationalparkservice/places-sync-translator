var tools = require('jm-tools');

module.exports = function (id, fieldMappings, otherMappings) {
  var findOtherMapping = function (primaryKey) {
    return otherMappings.filter(function (row) {
      return row[id] === primaryKey;
    })[0];
  };
  var finalMappings = fieldMappings.map(function (row) {
    var matchedObjs = findOtherMapping(row[id]) || {};
    return tools.mergeObjects(matchedObjs.translator, matchedObjs.value_mapping, row);
  });
  return finalMappings;
};
