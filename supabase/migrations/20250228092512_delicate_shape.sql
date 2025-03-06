/*
  # Add default clothing sizes

  1. New Data
    - Adds default clothing sizes with proper categories
    - Ensures consistent size codes and names
*/

-- Insert default clothing sizes if they don't exist
INSERT INTO sizes (name, code, category)
VALUES 
  -- Clothing sizes
  ('X-Small', 'XS', 'Clothing'),
  ('Small', 'S', 'Clothing'),
  ('Medium', 'M', 'Clothing'),
  ('Large', 'L', 'Clothing'),
  ('X-Large', 'XL', 'Clothing'),
  ('2X-Large', '2XL', 'Clothing'),
  ('3X-Large', '3XL', 'Clothing'),
  ('4X-Large', '4XL', 'Clothing')
ON CONFLICT (code) DO NOTHING;
