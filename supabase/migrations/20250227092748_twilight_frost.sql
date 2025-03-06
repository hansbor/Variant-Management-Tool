/*
  # Update RLS Policies for Public Access

  1. Changes
    - Update RLS policies to allow public access
    - Enable anonymous access to products and variants tables
    - Maintain data integrity with foreign key constraints

  2. Security Note
    - This configuration allows public access for development
    - In production, implement proper authentication
*/

-- Update policies for products
DROP POLICY IF EXISTS "Users can read all products" ON products;
DROP POLICY IF EXISTS "Users can insert products" ON products;
DROP POLICY IF EXISTS "Users can update their products" ON products;
DROP POLICY IF EXISTS "Users can delete their products" ON products;

CREATE POLICY "Enable public access to products"
  ON products
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Update policies for variants
DROP POLICY IF EXISTS "Users can read all variants" ON variants;
DROP POLICY IF EXISTS "Users can insert variants" ON variants;
DROP POLICY IF EXISTS "Users can update their variants" ON variants;
DROP POLICY IF EXISTS "Users can delete their variants" ON variants;

CREATE POLICY "Enable public access to variants"
  ON variants
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
