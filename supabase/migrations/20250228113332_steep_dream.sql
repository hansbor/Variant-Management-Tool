/*
  # Add GS1 Settings

  1. Changes
    - Add default GS1 settings with barcode configuration
    - Update existing settings if needed
*/

-- Insert or update GS1 settings
INSERT INTO settings (key, value)
VALUES (
  'gs1_config',
  jsonb_build_object(
    'company_prefix', '',
    'location_reference', '',
    'sequence_counter', 0,
    'enable_auto_generation', false,
    'barcode_format', 'GTIN-13'
  )
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value
WHERE settings.key = 'gs1_config'
  AND (settings.value->>'company_prefix' IS NULL
    OR settings.value->>'location_reference' IS NULL
    OR settings.value->>'sequence_counter' IS NULL
    OR settings.value->>'enable_auto_generation' IS NULL
    OR settings.value->>'barcode_format' IS NULL);
