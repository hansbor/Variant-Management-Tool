/*
  # Add Category and ProductType tables

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `code` (text, unique, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `product_types`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `code` (text, unique, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Table Modifications
    - Add category and product_type columns to products table
    
  3. Security
    - Enable RLS on new tables
    - Add public access policies
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product_types table
CREATE TABLE IF NOT EXISTS product_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add new columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS category text REFERENCES categories(code),
ADD COLUMN IF NOT EXISTS product_type text REFERENCES product_types(code);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Enable public access to categories"
  ON categories
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create policies for product_types
CREATE POLICY "Enable public access to product_types"
  ON product_types
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_product_types_updated_at
  BEFORE UPDATE ON product_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
