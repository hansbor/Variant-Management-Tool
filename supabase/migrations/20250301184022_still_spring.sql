/*
  # Add suppliers and addresses tables

  1. New Tables
    - `suppliers`
      - `id` (uuid, primary key)
      - `supplier_number` (text, unique, auto-generated)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `website` (text)
      - `notes` (text)
      - Timestamps (created_at, updated_at)

    - `addresses`
      - `id` (uuid, primary key)
      - `supplier_id` (uuid, foreign key)
      - `type` (text)
      - `street` (text)
      - `street2` (text)
      - `city` (text)
      - `state` (text)
      - `postal_code` (text)
      - `country` (text)
      - `is_default` (boolean)
      - Timestamps (created_at, updated_at)

  2. Functions and Triggers
    - Function to generate next supplier number
    - Trigger to auto-generate supplier numbers
    - Trigger to ensure single default address
*/

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_number text UNIQUE,
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
  type text NOT NULL CHECK (type IN ('billing', 'shipping', 'other')),
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_addresses_supplier_id ON addresses(supplier_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON addresses(is_default) WHERE is_default = true;

-- Function to generate next supplier number
CREATE OR REPLACE FUNCTION generate_supplier_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  next_number integer;
  new_supplier_number text;
BEGIN
  -- Get the current highest number
  SELECT COALESCE(MAX(NULLIF(regexp_replace(supplier_number, '\D', '', 'g'), '')::integer), 0) + 1
  INTO next_number
  FROM suppliers;
  
  -- Format as SUP + 6 digit number
  new_supplier_number := 'SUP' || LPAD(next_number::text, 6, '0');
  
  RETURN new_supplier_number;
END;
$$;

-- Trigger to auto-generate supplier number before insert
CREATE OR REPLACE FUNCTION set_supplier_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.supplier_number IS NULL THEN
    NEW.supplier_number := generate_supplier_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_supplier_number
  BEFORE INSERT ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION set_supplier_number();

-- Ensure only one default address per supplier
CREATE OR REPLACE FUNCTION update_default_address()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_default THEN
    UPDATE addresses
    SET is_default = false
    WHERE supplier_id = NEW.supplier_id
      AND id != NEW.id
      AND is_default;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER ensure_single_default_address
  BEFORE INSERT OR UPDATE OF is_default ON addresses
  FOR EACH ROW
  WHEN (NEW.is_default)
  EXECUTE FUNCTION update_default_address();
