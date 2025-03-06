/*
  # Add GS1 settings

  1. New Settings
    - Add GS1 configuration to settings table including:
      - Company prefix (GCP)
      - Location reference
      - Check digit calculation
      - Sequence counter management
*/

-- Insert default GS1 settings if they don't exist
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
ON CONFLICT (key) DO NOTHING;
