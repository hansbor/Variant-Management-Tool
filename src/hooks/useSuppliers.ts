import { useState, useEffect } from 'react';
import { Supplier } from '../types';
import { supabase } from '../lib/supabase';

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = async (
    searchTerm: string = '',
    sortBy: 'name' | 'supplier_number' = 'name',
    sortOrder: 'asc' | 'desc' = 'asc'
  ) => {
    try {
      setLoading(true);
      let query = supabase
        .from('suppliers')
        .select(`
          *,
          addresses (*)
        `);

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) throw error;

      setSuppliers(data?.map(supplier => ({
        ...supplier,
        addresses: supplier.addresses || []
      })) || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const saveSupplier = async (supplier: Omit<Supplier, 'id' | 'supplier_number'>) => {
    try {
      setLoading(true);
      
      // First save the supplier
      const { data: savedSupplier, error: supplierError } = await supabase
        .from('suppliers')
        .insert({
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          website: supplier.website,
          notes: supplier.notes
        })
        .select()
        .single();

      if (supplierError) throw supplierError;

      // Then save all addresses
      if (supplier.addresses?.length) {
        const { error: addressError } = await supabase
          .from('addresses')
          .insert(
            supplier.addresses.map(address => ({
              ...address,
              supplier_id: savedSupplier.id
            }))
          );

        if (addressError) throw addressError;
      }

      await fetchSuppliers();
    } catch (error) {
      console.error('Error saving supplier:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSupplier = async (id: string, supplier: Partial<Supplier>) => {
    try {
      setLoading(true);

      // Update supplier details
      const { error: supplierError } = await supabase
        .from('suppliers')
        .update({
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          website: supplier.website,
          notes: supplier.notes
        })
        .eq('id', id);

      if (supplierError) throw supplierError;

      // Handle addresses
      if (supplier.addresses) {
        // Delete existing addresses
        const { error: deleteError } = await supabase
          .from('addresses')
          .delete()
          .eq('supplier_id', id);

        if (deleteError) throw deleteError;

        // Insert new addresses
        if (supplier.addresses.length > 0) {
          const { error: addressError } = await supabase
            .from('addresses')
            .insert(
              supplier.addresses.map(address => ({
                ...address,
                supplier_id: id
              }))
            );

          if (addressError) throw addressError;
        }
      }

      await fetchSuppliers();
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchSuppliers();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return {
    suppliers,
    loading,
    error,
    saveSupplier,
    updateSupplier,
    deleteSupplier,
    fetchSuppliers
  };
};
