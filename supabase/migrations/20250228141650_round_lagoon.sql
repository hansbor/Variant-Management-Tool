/*
  # Add SKU settings and functions
  
  1. New Settings
    - Add SKU configuration to settings table
      - prefix: Text prefix for SKUs
      - sequence_counter: Current counter for SKU generation
      - enable_auto_generation: Toggle for automatic SKU generation
  
  2. Functions
    - Add function to get next SKU number
*/

-- Add SKU settings if they don't exist
INSERT INTO settings (key, value)
VALUES (
  'sku_config',
  jsonb_build_object(
    'prefix', '',
    'sequence_counter', 0,
    'enable_auto_generation', false
  )
)
ON CONFLICT (key) DO NOTHING;

-- Create function to get next SKU number
CREATE OR REPLACE FUNCTION get_next_sku(prefix text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  highest_sku text;
  next_number bigint;
  pattern text;
BEGIN
  -- Create pattern to match SKUs with the given prefix followed by numbers
  pattern := '^' || prefix || '(\d+)$';
  
  -- Get the highest SKU number for the given prefix
  SELECT sku INTO highest_sku
  FROM variants
  WHERE sku ~ pattern
  ORDER BY 
    -- Extract the numeric part and cast to bigint for proper ordering
    (regexp_replace(sku, pattern, '\1'))::bigint DESC
  LIMIT 1;

  -- If no SKUs exist with this prefix, start from 1
  IF highest_sku IS NULL THEN
    RETURN prefix || '1';
  END IF;

  -- Extract the numeric part and increment
  next_number := (regexp_replace(highest_sku, pattern, '\1'))::bigint + 1;

  RETURN prefix || next_number::text;
END;
$$;
