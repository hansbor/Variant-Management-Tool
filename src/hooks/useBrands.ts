import { useState, useEffect } from 'react';
import { Brand } from '../types';
import { supabase } from '../lib/supabase';

export interface BrandFormProps {
  initialBrand?: Brand;
  onSave: () => void;
  onCancel: () => void;
}

export const useBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name');

      if (error) throw error;

      setBrands(data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const saveBrand = async (brand: Omit<Brand, 'id'>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('brands')
        .insert([brand]);

      if (error) throw error;

      await fetchBrands();
    } catch (error) {
      console.error('Error saving brand:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateBrand = async (id: string, brand: Partial<Brand>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('brands')
        .update(brand)
        .eq('id', id);

      if (error) throw error;

      await fetchBrands();
    } catch (error) {
      console.error('Error updating brand:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteBrand = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return {
    brands,
    loading,
    error,
    saveBrand,
    updateBrand,
    deleteBrand,
    fetchBrands
  };
};
