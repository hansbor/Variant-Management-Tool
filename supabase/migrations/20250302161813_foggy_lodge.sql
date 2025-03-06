/*
  # Add Business NXT settings

  1. New Settings
    - Add default Business NXT configuration to settings table
  
  2. Changes
    - Insert or update Business NXT settings with default values
*/

-- Insert or update Business NXT settings
INSERT INTO settings (key, value)
VALUES (
  'business_nxt_config',
  jsonb_build_object(
    'enabled', true,
    'client_id', '',
    'client_secret', '',
    'tenant_id', ''
  )
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value
WHERE settings.key = 'business_nxt_config';
