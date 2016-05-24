module.exports = function (sourceObj, ignoreColumns) {
  var returnColumns = {};
  var thisValue = {};
  ignoreColumns = Array.isArray(ignoreColumns) ? ignoreColumns : [ignoreColumns];
  for (var mainKey in sourceObj) {
    if (ignoreColumns.indexOf(mainKey) === -1) {
      try {
        thisValue = typeof sourceObj[mainKey] === 'string' ? JSON.parse(sourceObj[mainKey]) : sourceObj[mainKey];
        if (typeof thisValue !== 'object') {
          thisValue = {};
        }
      } catch (e) {
        thisValue = {};
      }
    }
    for (var key in thisValue) {
      returnColumns[key] = thisValue[key];
    }
  }
  return returnColumns;
};
