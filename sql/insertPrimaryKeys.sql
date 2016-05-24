INSERT INTO "tagged_values" (
  "id",
  "translator",
  "geometry_types",
  "preset_mapping"
) SELECT
  '{{primaryKey}}',
  null,
  null,
  null
FROM "{{sourceName}}";
