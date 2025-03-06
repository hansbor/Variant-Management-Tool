/*
  # Fix product type foreign key constraint

  1. Changes
    - Modify the foreign key constraint on products.product_type to SET NULL on delete/update
    - This allows deleting product types while preserving the products
    
  2. Impact
    - When a product type is deleted, the product_type field in products will be set to NULL
    - Maintains data integrity while allowing product type management
*/

-- First drop the existing constraint
ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_product_type_fkey;

-- Re-add the constraint with SET NULL behavior
ALTER TABLE products
ADD CONSTRAINT products_product_type_fkey
FOREIGN KEY (product_type)
REFERENCES product_types(code)
ON DELETE SET NULL
ON UPDATE CASCADE;
