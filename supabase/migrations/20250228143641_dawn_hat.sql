/*
  # Fix GS1 barcode generation

  1. Changes
    - Update barcode generation to use GS1 settings
    - Add proper check digit calculation
    - Add validation for GS1 company prefix
*/

-- Improved barcode generation function with GS1 support
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
  digit int;
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
    RETURN get_next_sequence('barcode_sequence')::text;
  END IF;

  -- Pad company prefix to 7 digits
  company_prefix := lpad(company_prefix, 7, '0');

  -- Get and increment sequence number
  sequence_number := lpad(get_next_sequence('gs1_sequence')::text, 5, '0');

  -- Combine prefix and sequence
  base_number := company_prefix || sequence_number;

  -- Calculate check digit according to GS1 rules
  sum := 0;
  FOR i IN 1..length(base_number) LOOP
    digit := (base_number[i:i])::int;
    multiplier := CASE WHEN i % 2 = 1 THEN 3 ELSE 1 END;
    sum := sum + (digit * multiplier);
  END LOOP;

  check_digit := (10 - (sum % 10)) % 10;

  -- Return complete barcode
  RETURN base_number || check_digit::text;
END;
$$;
