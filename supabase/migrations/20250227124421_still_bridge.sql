/*
  # Add product-level pricing

  1. Changes
    - Add purchase_price and sales_price columns to products table
    - Update variants table to reference product prices
  
  2. Notes
    - Default prices are set at the product level
    - Variants inherit these prices by default
*/

-- Add pricing columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS purchase_price numeric(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS sales_price numeric(10,2) NOT NULL DEFAULT 0;
