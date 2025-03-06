import { useState, useEffect } from 'react';
import { Collection } from '../types';
import { supabase } from '../lib/supabase';

export interface CollectionFormProps {
  initialCollection?: Collection;
  onSave: () => void;
  onCancel: () => void;
}

export const useCollections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('name');

      if (error) throw error;

      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const saveCollection = async (collection: Omit<Collection, 'id'>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('collections')
        .insert([collection]);

      if (error) throw error;

      await fetchCollections();
    } catch (error) {
      console.error('Error saving collection:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCollection = async (id: string, collection: Partial<Collection>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('collections')
        .update(collection)
        .eq('id', id);

      if (error) throw error;

      await fetchCollections();
    } catch (error) {
      console.error('Error updating collection:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCollection = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  return {
    collections,
    loading,
    error,
    saveCollection,
    updateCollection,
    deleteCollection,
    fetchCollections
  };
};
