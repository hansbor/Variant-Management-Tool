/*
  # Update default editor settings

  Updates the default value for the TinyMCE editor setting to be disabled by default.

  1. Changes
    - Updates the default editor_config setting to have enable_tinymce: false
*/

-- Update the default editor settings
UPDATE settings
SET value = '{"enable_tinymce": false}'::jsonb
WHERE key = 'editor_config';

-- If no setting exists, insert with disabled TinyMCE
INSERT INTO settings (key, value)
VALUES ('editor_config', '{"enable_tinymce": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;
