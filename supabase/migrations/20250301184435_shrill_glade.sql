/*
  # Add supplier reference to products table

  1. Changes
    - Add supplier_id column to products table
    - Add foreign key constraint to suppliers table
    - Add index for faster supplier lookups
*/

-- Add supplier_id column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL;

-- Add index for faster supplier lookups
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
