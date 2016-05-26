UPDATE "tagged_values"
SET "preset_mapping" = (
  SELECT (
    SELECT "best_match"."tags"
    FROM (
      SELECT
        "Preset_Classes"."tags",
        CASE
          WHEN lower("Preset_Classes"."type") =  lower("{{sourceName}}"."{{valueField}}") THEN 1 -- If the requested term equals the type, then rank it as 1
          WHEN instr(lower("Preset_Classes"."altNames"), '"' || lower("{{sourceName}}"."{{valueField}}") || '"') THEN
            length(substr(lower("Preset_Classes"."altNames"), 0, instr(lower("Preset_Classes"."altNames"), '"' || lower("{{sourceName}}"."{{valueField}}") || '"'))) - 
            length(replace(substr(lower("Preset_Classes"."altNames"), 0, instr(lower("Preset_Classes"."altNames"), '"' ||  lower("{{sourceName}}"."{{valueField}}") || '"')), ',', '')) + 
            2
           ELSE null -- If it's in the altNames fields, then the rank is the position in that list plus 2
                    -- The first index in this list will be 0, but our ranks start at one
                    -- the #1 ranking is reserved for matches directly to type
        END as "rank"
        FROM "Preset_Classes"
        WHERE
          (
            "point" = CASE WHEN instr(lower("tagged_values"."geometry_types"),'"point"') THEN 'x' ELSE 'no match' END OR
            "line" = CASE WHEN instr(lower("tagged_values"."geometry_types"),'"polyline"') THEN 'x' ELSE 'no match' END OR
            "polygon" = CASE WHEN instr(lower("tagged_values"."geometry_types"),'"polygon"') THEN 'x' ELSE 'no match' END
          ) AND
          "rank" IS NOT NULL ORDER BY "rank" LIMIT 1
    ) AS "best_match") as "tags"
    FROM "{{sourceName}}"
    WHERE "{{sourceName}}"."{{primaryKey}}" = "tagged_values"."id"
)
WHERE "preset_mapping" IS NULL;
