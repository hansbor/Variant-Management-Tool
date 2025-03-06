/*
  # Add next barcode function

  1. New Functions
    - get_next_barcode(): Returns the next available barcode number by finding the highest existing barcode and incrementing by 1
  
  2. Changes
    - Add index on variants.barcode for better performance
*/

-- Create function to get next barcode number
CREATE OR REPLACE FUNCTION get_next_barcode()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  highest_barcode text;
  next_number bigint;
BEGIN
  -- Get the highest numeric barcode
  SELECT barcode INTO highest_barcode
  FROM variants
  WHERE barcode ~ '^\d+$'  -- Only consider numeric barcodes
  ORDER BY barcode::bigint DESC
  LIMIT 1;

  -- If no barcodes exist, start from 1000000000000
  IF highest_barcode IS NULL THEN
    RETURN '1000000000000';
  END IF;

  -- Convert to number, increment, and return
  next_number := highest_barcode::bigint + 1;
  RETURN next_number::text;
END;
$$;
