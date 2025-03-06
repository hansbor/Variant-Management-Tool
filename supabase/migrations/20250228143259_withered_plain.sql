/*
  # Fix SKU and barcode number generation

  1. Changes
    - Fix get_next_barcode function to handle numeric overflow
    - Fix get_next_sku function to handle numeric overflow
    - Add proper error handling and validation
*/

-- Improved barcode generation function
CREATE OR REPLACE FUNCTION get_next_barcode()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  highest_barcode text;
  next_number numeric;
  max_barcode numeric := 9999999999999; -- Maximum 13-digit number
  start_barcode numeric := 1000000000000; -- Starting 13-digit number
BEGIN
  -- Get the highest numeric barcode
  SELECT barcode INTO highest_barcode
  FROM variants
  WHERE barcode ~ '^\d+$'  -- Only consider numeric barcodes
  AND length(barcode) = 13  -- Ensure barcode is exactly 13 digits
  ORDER BY barcode::numeric DESC
  LIMIT 1;

  -- If no barcodes exist or invalid, start from base number
  IF highest_barcode IS NULL THEN
    RETURN start_barcode::text;
  END IF;

  -- Safely convert to number and increment
  BEGIN
    next_number := highest_barcode::numeric + 1;
  EXCEPTION WHEN OTHERS THEN
    RETURN start_barcode::text;
  END;

  -- If we've reached the maximum, start over from base number
  IF next_number > max_barcode THEN
    RETURN start_barcode::text;
  END IF;

  RETURN lpad(next_number::text, 13, '0');
END;
$$;

-- Improved SKU generation function
CREATE OR REPLACE FUNCTION get_next_sku(prefix text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  highest_sku text;
  next_number numeric;
  pattern text;
  max_number numeric := 999999; -- Maximum 6-digit number
BEGIN
  -- Validate prefix
  IF prefix IS NULL OR prefix = '' THEN
    RAISE EXCEPTION 'SKU prefix cannot be empty';
  END IF;

  -- Create pattern to match SKUs with the given prefix followed by numbers
  pattern := '^' || prefix || '(\d+)$';
  
  -- Get the highest SKU number for the given prefix
  SELECT sku INTO highest_sku
  FROM variants
  WHERE sku ~ pattern
  ORDER BY 
    -- Extract the numeric part and cast to numeric for proper ordering
    (regexp_replace(sku, pattern, '\1'))::numeric DESC
  LIMIT 1;

  -- If no SKUs exist with this prefix, start from 1
  IF highest_sku IS NULL THEN
    RETURN prefix || '1';
  END IF;

  -- Safely extract the numeric part and increment
  BEGIN
    next_number := (regexp_replace(highest_sku, pattern, '\1'))::numeric + 1;
  EXCEPTION WHEN OTHERS THEN
    RETURN prefix || '1';
  END;

  -- If we've reached the maximum, start over from 1
  IF next_number > max_number THEN
    RETURN prefix || '1';
  END IF;

  -- Return formatted SKU with leading zeros for the number part
  RETURN prefix || lpad(next_number::text, 6, '0');
END;
$$;
