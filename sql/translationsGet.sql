UPDATE "tagged_values"
SET
  "translator" = (SELECT "Default Tags" FROM "Translators" WHERE "Name" = {{translator}} LIMIT 1),
  "geometry_types" = (SELECT "Geometry Types" FROM "Translators" WHERE "Name" = {{translator}} LIMIT 1)
WHERE "tagged_values"."translator" IS NULL;
