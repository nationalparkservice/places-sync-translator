SELECT "GIS Field Name" AS "valueField"
FROM "Value Mapping"
WHERE "Translator" = {{translator}} AND "GIS Field Value" = '*' LIMIT 1;
