import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { supabase } from '../lib/supabase';
import { saveToFile, loadFromFile } from '../utils/fileStorage';
import { useSettings } from './useSettings';

type ProductWithVariants = Product & {
  variants: {
    id: string;
    sku: string;
    size: string;
    color: string;
    purchase_price: number;
    sales_price: number;
    stock: number;
  }[];
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateNextSku = async (prefix: string = ''): Promise<string> => {
    try {
      const { data, error } = await supabase
        .rpc('get_next_sku', { prefix: prefix.toUpperCase() });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating next SKU:', error);
      throw error;
    }
  };

  const generateNextBarcode = async (): Promise<string> => {
    try {
      const { data, error } = await supabase
        .rpc('get_next_barcode');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating next barcode:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          variants (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our Product type
      const transformedProducts = data?.map(product => ({
        ...product,
        size_category: product.size_category || 'General',
        variants: product.variants?.map(variant => ({
          id: variant.id,
          sku: variant.sku,
          size: variant.size,
          barcode: variant.barcode,
          color: variant.color,
          purchasePrice: variant.purchase_price,
          salesPrice: variant.sales_price,
          stock: variant.stock
        })) || []
      })) || [];

      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const saveProduct = async (product: ProductWithVariants) => {
    try {
      setLoading(true);
      // First save the product
      const { data: savedProduct, error: productError } = await supabase
        .from('products')
        .upsert({
          id: product.id,
          name: product.name,
          brand: product.brand,
          collection: product.collection,
          category: product.category,
          supplier_id: product.supplier_id,
          size_category: product.size_category,
          product_type: product.product_type,
          description: product.description,
          purchase_price: product.purchasePrice,
          sales_price: product.salesPrice
        })
        .select()
        .single();

      if (productError) throw productError;

      // Then save all variants
      const { error: variantsError } = await supabase
        .from('variants')
        .upsert(
          product.variants.map(variant => ({
            product_id: savedProduct.id,
            id: variant.id || undefined, // Allow Supabase to generate ID if new
            sku: variant.sku || '',
            size: variant.size || '',
            barcode: variant.barcode || null,
            color: variant.color || '',
            purchase_price: Number(variant.purchasePrice) || Number(product.purchasePrice) || 0,
            sales_price: Number(variant.salesPrice) || Number(product.salesPrice) || 0,
            stock: Number(variant.stock) || 0
          }))
        );

      if (variantsError) throw variantsError;

      await fetchProducts();
      setLoading(false);
    } catch (error) {
      console.error('Error saving product:', error);
      setLoading(false);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const importProducts = async () => {
    try {
      const importedProducts = await loadFromFile();
      if (importedProducts.length > 0) {
        setProducts(importedProducts);
      }
    } catch (error) {
      console.error('Error importing products:', error);
    }
  };

  const exportProducts = async () => {
    try {
      await saveToFile(products);
    } catch (error) {
      console.error('Error exporting products:', error);
    }
  };

  return {
    products,
    loading,
    error,
    generateNextSku,
    generateNextBarcode,
    saveProduct,
    deleteProduct,
    importProducts,
    exportProducts,
    fetchProducts
  };
};
