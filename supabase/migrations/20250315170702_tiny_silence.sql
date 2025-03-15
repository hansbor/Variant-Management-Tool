/*
  # Fix Product Relationships

  1. Changes
    - Add foreign key relationships between products and brands/collections tables
    - Update existing brand/collection references to use code field
    - Add indexes for better performance

  2. Impact
    - Enables proper joins between products and brands/collections
    - Maintains data integrity with foreign key constraints
    - Improves query performance with indexes
*/

-- Add foreign key constraints for brand and collection
ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_brand_fkey,
DROP CONSTRAINT IF EXISTS products_collection_fkey;

ALTER TABLE products
ADD CONSTRAINT products_brand_fkey
  FOREIGN KEY (brand)
  REFERENCES brands(code)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;

ALTER TABLE products
ADD CONSTRAINT products_collection_fkey
  FOREIGN KEY (collection)
  REFERENCES collections(code)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);