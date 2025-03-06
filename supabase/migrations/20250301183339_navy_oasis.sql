/*
  # Add Supplier Management

  1. New Tables
    - `suppliers`
      - `id` (uuid, primary key)
      - `supplier_number` (text, unique, auto-generated)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `website` (text)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `addresses`
      - `id` (uuid, primary key)
      - `supplier_id` (uuid, references suppliers)
      - `type` (text) - billing/shipping/etc
      - `street` (text)
      - `street2` (text)
      - `city` (text)
      - `state` (text)
      - `postal_code` (text)
      - `country` (text)
      - `is_default` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access

  3. Functions
    - Add function to generate next supplier number
*/

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_number text UNIQUE NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  website text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'billing',
  street text NOT NULL,
  street2 text,
  city text NOT NULL,
  state text,
  postal_code text,
  country text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_supplier_number ON suppliers(supplier_number);
CREATE INDEX IF NOT EXISTS idx_supplier_addresses ON addresses(supplier_id);
CREATE INDEX IF NOT EXISTS idx_address_type ON addresses(type);

-- Enable RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable public access to suppliers"
  ON suppliers
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable public access to addresses"
  ON addresses
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Add updated_at triggers
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create sequence for supplier numbers
CREATE SEQUENCE IF NOT EXISTS supplier_number_seq START 1000;

-- Function to generate next supplier number
CREATE OR REPLACE FUNCTION get_next_supplier_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  next_number bigint;
BEGIN
  -- Get next value from sequence
  SELECT nextval('supplier_number_seq') INTO next_number;
  
  -- Format as SUP + padded number
  RETURN 'SUP' || lpad(next_number::text, 6, '0');
END;
$$;

-- Add supplier_id to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL;

-- Add index for supplier lookup
CREATE INDEX IF NOT EXISTS idx_product_supplier ON products(supplier_id);
