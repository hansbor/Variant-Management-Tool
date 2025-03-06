import { useState, useEffect } from 'react';
import { Size } from '../types';
import { supabase } from '../lib/supabase';

export interface SizeFormProps {
  initialSize?: Size;
  onSave: () => void;
  onCancel: () => void;
}

export const useSizes = () => {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSizes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sizes')
        .select('*')
        .order('name');

      if (error) throw error;

      setSizes(data || []);
    } catch (error) {
      console.error('Error fetching sizes:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const saveSize = async (size: Omit<Size, 'id'>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('sizes')
        .insert([size]);

      if (error) throw error;

      await fetchSizes();
    } catch (error) {
      console.error('Error saving size:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSize = async (id: string, size: Partial<Size>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('sizes')
        .update(size)
        .eq('id', id);

      if (error) throw error;

      await fetchSizes();
    } catch (error) {
      console.error('Error updating size:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteSize = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('sizes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchSizes();
    } catch (error) {
      console.error('Error deleting size:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSizes();
  }, []);

  return {
    sizes,
    loading,
    error,
    saveSize,
    updateSize,
    deleteSize,
    fetchSizes
  };
};
