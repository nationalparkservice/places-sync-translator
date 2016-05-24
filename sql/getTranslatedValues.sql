SELECT
  "GIS Field Name",
  "GIS Field Value",
  "Alternate GIS Values",
  "Places Tags"
FROM
  "Value Mapping"
WHERE
  "GIS Field Value" != '*' AND 
  "Places Tags" != '' AND (
  "Translator" = {{translator}} OR
  "Translator" = 'generic');
