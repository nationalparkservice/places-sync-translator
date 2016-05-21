#places-sync-osm-translator

The name is quite a mouthful! This project uses four (4) translation files to match tags to what we would expect them to be in places

#### For consistency, this project also includes the SQL code for converting from tags to our Superclass, Class, Type format

## Process
1. First we open a database to add all of those translations

2. Add each translation file to a memory database *(propose to have these added to cartodb)*
  1. Translators (https://docs.google.com/spreadsheets/d/1V8DsAeBipMrll2rmjjTZ6fYTE8g69dI9k6V762K4PYA/edit#gid=2039898153)
  2. Field Mapping (https://docs.google.com/spreadsheets/d/1V8DsAeBipMrll2rmjjTZ6fYTE8g69dI9k6V762K4PYA/edit#gid=2039898153)
  3. Value Mapping (https://docs.google.com/spreadsheets/d/1V8DsAeBipMrll2rmjjTZ6fYTE8g69dI9k6V762K4PYA/edit#gid=2039898153)
  4. Preset_Classes (https://docs.google.com/spreadsheets/d/1XFqkmIYMEp73q9flgNto9QJim6N5hbacgkUAgdf0rhE/edit#gid=0)

3. Add the geojson file into SQLite

4. Find the field that maps to Preset Classes in the value mapping document
  1. SELECT "GIS Field Name" FROM value_mapping WHERE "GIS Field Value" = '*' AND "Translator" = {{translationType}};

5. Create a table to keep track of the tags
  1. CREATE TABLE taggging (id, tagset, priority);

6. Get the default tags for this datatype (if any)
  1. INSERT INTO TABLE id, tagset, 1
  2. SELECT "Default Tags" from "Translators" WHERE "Translator" = {{translationType}};

7. Look through preset classes to determine what the best preset is
  1. INSERT INTO TABLE id, tagset, 2
  2. SELECT name, (SELECT a FROM (SELECT a, CASE WHEN a = tags.name THEN 1 WHEN instr(b, '"' || tags.name || '"') then length(substr(b, 0, instr(b, '"' || tags.name || '"'))) - length(replace(substr(b, 0, instr(b, '"' || tags.name || '"')), ',', '')) + 2 ELSE null END as rank from tmp where rank is not null order by rank limit 1)) AS preset FROM tags;

8. Go through the value mappings and match them up
  1. CREATE TABLE values AS SELECT "Global Id" as id,

9. Go through the field mappings and match them up
  1. CREATE TABLE values AS SELECT "Global Id" as id', '{"' || "Places Tag Name" || '": "' || value || '"}';

10. For each object in the GeoJSON, match the tags that are associated
  1. merge the tag objects with the matches, in the order of their priority

11. Return the GeoJSON with updated dataPlaces-sync-osm-translator

The name is quite a mouthful! This project uses four (4) translation files to match tags to what we would expect them to be in places

### For consistency, this project also *will include* the SQL code for converting from tags to our Superclass, Class, Type format
