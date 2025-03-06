/*
  # Add brands and collections tables

  1. New Tables
    - `brands`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `code` (text, unique, not null)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `collections`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `code` (text, unique, not null)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access
*/

-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Create policies for brands
CREATE POLICY "Enable public access to brands"
  ON brands
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create policies for collections
CREATE POLICY "Enable public access to collections"
  ON collections
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
