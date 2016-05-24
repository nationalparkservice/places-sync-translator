INSERT INTO "tagged_values" (
  "id",
  "translator",
  "geometry_types",
  "value_mapping"
) SELECT
  '{{primaryKey}}',
  null,
  null,
  null
FROM "Input Data";
