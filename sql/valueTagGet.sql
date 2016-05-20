UPDATE "tagged_values"
SET "value_mapping" = (
  SELECT (
    SELECT "best_match"."tags"
    FROM (
      SELECT
        "Preset_Classes"."tags",
        CASE
          WHEN "Preset_Classes"."type" =  "Input Data"."{{valueField}}" THEN 1 -- If the requested term equals the type, then rank it as 1
          WHEN instr("Preset_Classes"."altNames", '"' ||   "Input Data"."{{valueField}}" || '"') THEN
            length(substr("Preset_Classes"."altNames", 0, instr("Preset_Classes"."altNames", '"' ||   "Input Data"."{{valueField}}" || '"'))) - 
            length(replace(substr("Preset_Classes"."altNames", 0, instr("Preset_Classes"."altNames", '"' ||   "Input Data"."{{valueField}}" || '"')), ',', '')) + 
            2
           ELSE null -- If it's in the altNames fields, then the rank is the position in that list plus 2
                    -- The first index in this list will be 0, but our ranks start at one
                    -- the #1 ranking is reserved for matches directly to type
        END as "rank"
        FROM "Preset_Classes"
        WHERE
          (
            "point" = CASE WHEN instr("tagged_values"."geometry_types",'"Point"') THEN 'x' ELSE 'no match' END OR
            "line" = CASE WHEN instr("tagged_values"."geometry_types",'"Polyline"') THEN 'x' ELSE 'no match' END OR
            "polygon" = CASE WHEN instr("tagged_values"."geometry_types",'"Polygon"') THEN 'x' ELSE 'no match' END
          ) AND
          "rank" IS NOT NULL ORDER BY "rank" LIMIT 1
    ) AS "best_match") as "tags"
    FROM "Input Data"
    WHERE "Input Data"."GlobalID" = "tagged_values"."id"
)
WHERE "value_mapping" IS NULL;
