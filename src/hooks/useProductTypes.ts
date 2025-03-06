import { useState, useEffect } from 'react';
import { ProductType } from '../types';
import { supabase } from '../lib/supabase';

export interface ProductTypeFormProps {
  initialProductType?: ProductType;
  onSave: () => void;
  onCancel: () => void;
}

export const useProductTypes = () => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductTypes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_types')
        .select('*')
        .order('name');

      if (error) throw error;

      setProductTypes(data || []);
    } catch (error) {
      console.error('Error fetching product types:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const saveProductType = async (productType: Omit<ProductType, 'id'>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('product_types')
        .insert([productType]);

      if (error) throw error;

      await fetchProductTypes();
    } catch (error) {
      console.error('Error saving product type:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProductType = async (id: string, productType: Partial<ProductType>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('product_types')
        .update(productType)
        .eq('id', id);

      if (error) throw error;

      await fetchProductTypes();
    } catch (error) {
      console.error('Error updating product type:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteProductType = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('product_types')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchProductTypes();
    } catch (error) {
      console.error('Error deleting product type:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductTypes();
  }, []);

  return {
    productTypes,
    loading,
    error,
    saveProductType,
    updateProductType,
    deleteProductType,
    fetchProductTypes
  };
};
