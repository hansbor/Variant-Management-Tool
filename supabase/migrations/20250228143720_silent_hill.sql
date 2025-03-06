/*
  # Fix barcode generation function

  1. Changes
    - Fix string handling in check digit calculation
    - Add proper string manipulation using substring
    - Improve error handling
*/

-- Improved barcode generation function with proper string handling
CREATE OR REPLACE FUNCTION get_next_barcode()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  gs1_settings jsonb;
  company_prefix text;
  sequence_number text;
  base_number text;
  check_digit int;
  i int;
  sum int := 0;
  digit text;
  multiplier int;
BEGIN
  -- Get GS1 settings
  SELECT value INTO gs1_settings
  FROM settings
  WHERE key = 'gs1_config';

  -- Get company prefix from settings
  company_prefix := gs1_settings->>'company_prefix';

  -- Validate company prefix
  IF company_prefix IS NULL OR company_prefix = '' THEN
    -- Fall back to sequential generation if no GS1 settings
    RETURN lpad(get_next_sequence('barcode_sequence')::text, 13, '0');
  END IF;

  -- Pad company prefix to 7 digits
  company_prefix := lpad(company_prefix, 7, '0');

  -- Get and increment sequence number
  sequence_number := lpad(get_next_sequence('gs1_sequence')::text, 5, '0');

  -- Combine prefix and sequence
  base_number := company_prefix || sequence_number;

  -- Calculate check digit according to GS1 rules
  sum := 0;
  FOR i IN 1..12 LOOP
    digit := substring(base_number from i for 1);
    multiplier := CASE WHEN i % 2 = 1 THEN 3 ELSE 1 END;
    sum := sum + (digit::int * multiplier);
  END LOOP;

  check_digit := (10 - (sum % 10)) % 10;

  -- Return complete barcode
  RETURN base_number || check_digit::text;
EXCEPTION WHEN OTHERS THEN
  -- If anything fails, fall back to sequential generation
  RETURN lpad(get_next_sequence('barcode_sequence')::text, 13, '0');
END;
$$;
