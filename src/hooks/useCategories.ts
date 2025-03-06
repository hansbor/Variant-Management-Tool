import { useState, useEffect } from 'react';
import { Category } from '../types';
import { supabase } from '../lib/supabase';

export interface CategoryFormProps {
  initialCategory?: Category;
  onSave: () => void;
  onCancel: () => void;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const saveCategory = async (category: Omit<Category, 'id'>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('categories')
        .insert([category]);

      if (error) throw error;

      await fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, category: Partial<Category>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('categories')
        .update(category)
        .eq('id', id);

      if (error) throw error;

      await fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    saveCategory,
    updateCategory,
    deleteCategory,
    fetchCategories
  };
};
