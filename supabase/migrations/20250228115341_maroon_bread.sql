/*
  # Fix barcode number limits

  1. Changes
    - Update get_next_barcode() function to handle large numbers safely
    - Add validation to ensure barcode stays within valid range
    - Start from a lower number to avoid bigint overflow
*/

CREATE OR REPLACE FUNCTION get_next_barcode()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  highest_barcode text;
  next_number bigint;
  max_barcode bigint := 9999999999999; -- Maximum 13-digit number
  start_barcode bigint := 1000000000000; -- Starting 13-digit number
BEGIN
  -- Get the highest numeric barcode
  SELECT barcode INTO highest_barcode
  FROM variants
  WHERE barcode ~ '^\d+$'  -- Only consider numeric barcodes
  AND length(barcode) <= 13  -- Ensure barcode is not too long
  AND barcode::bigint <= max_barcode  -- Ensure barcode is within valid range
  ORDER BY barcode::bigint DESC
  LIMIT 1;

  -- If no barcodes exist or invalid, start from base number
  IF highest_barcode IS NULL OR highest_barcode::bigint >= max_barcode THEN
    RETURN start_barcode::text;
  END IF;

  -- Convert to number and increment
  next_number := highest_barcode::bigint + 1;

  -- If we've reached the maximum, start over from base number
  IF next_number > max_barcode THEN
    RETURN start_barcode::text;
  END IF;

  RETURN next_number::text;
END;
$$;
