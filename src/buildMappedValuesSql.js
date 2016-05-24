var tools = require('jm-tools');
var fandlebars = require('fandlebars');

module.exports = function (id, columns, mappings, inputDataTableName) {
  columns = tools.simplifyArray(columns);
  mappings = mappings.filter(function (m) {
    return columns.indexOf(m['GIS Field Name']) > -1;
  });

  var sqlStatement = 'SELECT {{columns}} FROM "' + inputDataTableName + '";';
  var caseStatement = 'WHEN lower("{{field}}") = lower(\'{{value}}\') THEN \'{{tag}}\'';
  var caseMappings = {};

  mappings.forEach(function (mapping) {
    var parsedMappings;
    var mappedTo;
    try {
      parsedMappings = JSON.parse(mapping['Alternate GIS Values']);
      parsedMappings.unshift(mapping['GIS Field Value']);
    } catch (e) {
      parsedMappings = [mapping['GIS Field Value']];
    }
    try {
      mappedTo = JSON.parse(mapping['Places Tags']);
    } catch(e) {
      mappedTo = {}
    }


    parsedMappings.forEach(function (parsedMapping) {
      caseMappings[mapping['GIS Field Name']] = caseMappings[mapping['GIS Field Name']] || [];
      caseMappings[mapping['GIS Field Name']].push(fandlebars(caseStatement, {
        'field': mapping['GIS Field Name'],
        'value': parsedMapping,
        'tag': mappedTo
      }));
    });
  });

  var sqlParams = {
    'columns': ['"' + id + '" as "id"']
  };

  for (var caseMapping in caseMappings) {
    sqlParams.columns.push('CASE ' + caseMappings[caseMapping].join('\n ') + '\n ELSE null END AS "' + caseMapping + '"');
  }
  sqlParams.columns = sqlParams.columns.join(', ');

  return fandlebars(sqlStatement, sqlParams);
};
