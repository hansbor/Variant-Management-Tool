/*
  # Add size category

  1. Changes
    - Add category column to sizes table
    - Add default value for existing rows
    - Add index for faster category lookups

  2. Notes
    - Category will help organize sizes by type (e.g., 'Clothing', 'Shoes', 'Accessories')
    - Default category is 'General' for existing sizes
*/

-- Add category column to sizes table
ALTER TABLE sizes
ADD COLUMN category text NOT NULL DEFAULT 'General';

-- Add index for faster category lookups
CREATE INDEX IF NOT EXISTS sizes_category_idx ON sizes (category);
