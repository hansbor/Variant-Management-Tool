/*
  # Fix SKU and barcode number generation

  1. Changes
    - Add sequence management table for SKUs and barcodes
    - Add functions to safely increment and manage sequences
    - Add proper error handling and validation
*/

-- Create sequence management table
CREATE TABLE IF NOT EXISTS sequence_counters (
  id text PRIMARY KEY,
  current_value bigint NOT NULL DEFAULT 0,
  prefix text,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sequence_counters ENABLE ROW LEVEL SECURITY;

-- Create policy for sequence_counters
CREATE POLICY "Enable public access to sequence_counters"
  ON sequence_counters
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Function to safely get and increment sequence
CREATE OR REPLACE FUNCTION get_next_sequence(sequence_id text, prefix text DEFAULT NULL)
RETURNS bigint
LANGUAGE plpgsql
AS $$
DECLARE
  next_value bigint;
BEGIN
  -- Insert or update the sequence counter
  INSERT INTO sequence_counters (id, current_value, prefix)
  VALUES (sequence_id, 0, prefix)
  ON CONFLICT (id) DO UPDATE
  SET current_value = sequence_counters.current_value + 1,
      updated_at = now()
  RETURNING current_value INTO next_value;

  RETURN next_value;
END;
$$;

-- Improved barcode generation function
CREATE OR REPLACE FUNCTION get_next_barcode()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  next_value bigint;
  barcode_length constant int := 13;
  min_value constant bigint := 1000000000000; -- 13 digits starting with 1
  max_value constant bigint := 9999999999999; -- 13 digits
BEGIN
  -- Get next sequence value
  next_value := get_next_sequence('barcode_sequence');
  
  -- Calculate actual barcode number
  next_value := min_value + (next_value % (max_value - min_value + 1));
  
  -- Return formatted barcode with leading zeros
  RETURN lpad(next_value::text, barcode_length, '0');
END;
$$;

-- Improved SKU generation function
CREATE OR REPLACE FUNCTION get_next_sku(prefix text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  next_value bigint;
  sequence_id text;
  max_number constant int := 999999; -- Maximum 6-digit number
BEGIN
  -- Validate prefix
  IF prefix IS NULL OR prefix = '' THEN
    RAISE EXCEPTION 'SKU prefix cannot be empty';
  END IF;

  -- Create unique sequence ID for this prefix
  sequence_id := 'sku_sequence_' || prefix;
  
  -- Get next sequence value
  next_value := get_next_sequence(sequence_id, prefix);
  
  -- Keep number within 6 digits
  next_value := (next_value % max_number) + 1;
  
  -- Return formatted SKU
  RETURN prefix || lpad(next_value::text, 6, '0');
END;
$$;

-- Add trigger to update timestamp
CREATE TRIGGER update_sequence_counters_updated_at
  BEFORE UPDATE ON sequence_counters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
