import { useState, useEffect } from 'react';
import { Color } from '../types';
import { supabase } from '../lib/supabase';

export interface ColorFormProps {
  initialColor?: Color;
  onSave: () => void;
  onCancel: () => void;
}

export const useColors = () => {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchColors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('colors')
        .select('*')
        .order('name');

      if (error) throw error;

      setColors(data || []);
    } catch (error) {
      console.error('Error fetching colors:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const saveColor = async (color: Omit<Color, 'id'>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('colors')
        .insert([color]);

      if (error) throw error;

      await fetchColors();
    } catch (error) {
      console.error('Error saving color:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateColor = async (id: string, color: Partial<Color>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('colors')
        .update(color)
        .eq('id', id);

      if (error) throw error;

      await fetchColors();
    } catch (error) {
      console.error('Error updating color:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteColor = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('colors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchColors();
    } catch (error) {
      console.error('Error deleting color:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  return {
    colors,
    loading,
    error,
    saveColor,
    updateColor,
    deleteColor,
    fetchColors
  };
};
