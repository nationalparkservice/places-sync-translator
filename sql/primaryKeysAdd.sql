INSERT INTO "tagged_values" (
  "id",
  "translator",
  "geometry_types",
  "value_mapping",
  "field_mapping"
) SELECT
  "GlobalID",
  null,
  null,
  null,
  null
FROM "Input Data";
