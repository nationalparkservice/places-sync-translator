SELECT
  "GIS Field Name",
  "Alternate GIS Names",
  "Places Tag Name"
FROM
  "Field Mapping"
WHERE
  "Translator" = {{translator}} OR
  "Translator" = 'generic';
