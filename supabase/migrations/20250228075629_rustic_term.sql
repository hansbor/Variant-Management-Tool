/*
  # Add size category to products table

  1. Changes
    - Add size_category column to products table with default value 'General'
    - Add index for faster lookups
*/

-- Add size_category column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS size_category text NOT NULL DEFAULT 'General';

-- Add index for faster category lookups
CREATE INDEX IF NOT EXISTS products_size_category_idx ON products (size_category);
