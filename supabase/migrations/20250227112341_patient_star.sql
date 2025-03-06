/*
  # Add barcode field to variants

  1. Changes
    - Add barcode column to variants table
    - Make barcode unique to prevent duplicates
    - Add index for faster barcode lookups

  2. Notes
    - Barcode is optional (can be NULL)
    - Using text type to support different barcode formats
*/

ALTER TABLE variants
ADD COLUMN IF NOT EXISTS barcode text;

-- Add unique constraint to prevent duplicate barcodes
ALTER TABLE variants
ADD CONSTRAINT variants_barcode_unique UNIQUE (barcode);

-- Add index for faster barcode lookups
CREATE INDEX IF NOT EXISTS variants_barcode_idx ON variants (barcode);
