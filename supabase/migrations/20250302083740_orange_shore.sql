/*
  # Add example products and variants

  1. New Data
    - Required categories
    - Required product types
    - Required brands
    - Required collections
    - Required colors
    - Example products with supplier IDs
    - Example variants for each product
*/

-- Insert required brands first
INSERT INTO brands (id, name, code)
VALUES 
  ('a1b2c3d4-e5f6-4a5b-9c8d-1e2f3a4b5c6d', 'Nike', 'NIKE')
ON CONFLICT (code) DO NOTHING;

-- Insert required collections
INSERT INTO collections (id, name, code)
VALUES 
  ('b2c3d4e5-f6a7-5b6c-0d1e-2f3a4b5c6d7e', 'Spring/Summer 2025', 'SS25')
ON CONFLICT (code) DO NOTHING;

-- Insert required categories
INSERT INTO categories (id, name, code)
VALUES 
  ('c3d4e5f6-a7b8-6c7d-1e2f-3a4b5c6d7e8f', 'Tops', 'TOPS'),
  ('d4e5f6a7-b8c9-7d8e-2f3a-4b5c6d7e8f9a', 'Bottoms', 'BOTTOMS')
ON CONFLICT (code) DO NOTHING;

-- Insert required product types
INSERT INTO product_types (id, name, code)
VALUES 
  ('e5f6a7b8-c9d0-8e9f-3a4b-5c6d7e8f9a0b', 'T-Shirt', 'TSHIRT'),
  ('f6a7b8c9-d0e1-9f0a-4b5c-6d7e8f9a0b1c', 'Shorts', 'SHORTS')
ON CONFLICT (code) DO NOTHING;

-- Insert required colors
INSERT INTO colors (id, name, code, hex)
VALUES 
  ('a7b8c9d0-e1f2-0a1b-5c6d-7e8f9a0b1c2d', 'Black', 'BLACK', '#000000'),
  ('b8c9d0e1-f2a3-1b2c-6d7e-8f9a0b1c2d3e', 'Navy', 'NAVY', '#000080')
ON CONFLICT (code) DO NOTHING;

-- Insert example products
INSERT INTO products (id, name, brand, collection, category, size_category, product_type, supplier_id, description, purchase_price, sales_price)
VALUES 
  ('e8c9f5b0-5c1a-4e1d-9c5f-8c7b6a5d4e3c', 'Basic T-Shirt', 'NIKE', 'SS25', 'TOPS', 'Clothing', 'TSHIRT', 
   (SELECT id FROM suppliers ORDER BY created_at ASC LIMIT 1),
   'Classic cotton t-shirt', 149.00, 299.00),
  ('a2b4c6d8-e0f2-4a6c-8e0a-2c4e6f8a0c2e', 'Running Shorts', 'NIKE', 'SS25', 'BOTTOMS', 'Clothing', 'SHORTS',
   (SELECT id FROM suppliers ORDER BY created_at ASC LIMIT 1),
   'Lightweight running shorts', 199.00, 399.00);

-- Insert variants for Basic T-Shirt
INSERT INTO variants (product_id, sku, size, color, barcode, purchase_price, sales_price, stock)
VALUES 
  ('e8c9f5b0-5c1a-4e1d-9c5f-8c7b6a5d4e3c', 'BTS-BLK-S', 'S', 'BLACK', '1000000000001', 149.00, 299.00, 0),
  ('e8c9f5b0-5c1a-4e1d-9c5f-8c7b6a5d4e3c', 'BTS-BLK-M', 'M', 'BLACK', '1000000000002', 149.00, 299.00, 0),
  ('e8c9f5b0-5c1a-4e1d-9c5f-8c7b6a5d4e3c', 'BTS-BLK-L', 'L', 'BLACK', '1000000000003', 149.00, 299.00, 0);

-- Insert variants for Running Shorts
INSERT INTO variants (product_id, sku, size, color, barcode, purchase_price, sales_price, stock)
VALUES 
  ('a2b4c6d8-e0f2-4a6c-8e0a-2c4e6f8a0c2e', 'RNS-NVY-S', 'S', 'NAVY', '1000000000004', 199.00, 399.00, 0),
  ('a2b4c6d8-e0f2-4a6c-8e0a-2c4e6f8a0c2e', 'RNS-NVY-M', 'M', 'NAVY', '1000000000005', 199.00, 399.00, 0),
  ('a2b4c6d8-e0f2-4a6c-8e0a-2c4e6f8a0c2e', 'RNS-NVY-L', 'L', 'NAVY', '1000000000006', 199.00, 399.00, 0);
