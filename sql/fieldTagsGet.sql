UPDATE "tagged_values"
SET "field_mapping" =  (
  SELECT COALESCE("tagged_values"."field_mapping" || ',', '') || '"name":"' || "Input Data"."{{mappedField}}" || '"'
  FROM "Input Data"
  WHERE "Input Data"."GlobalID" = "tagged_values"."id"
);
