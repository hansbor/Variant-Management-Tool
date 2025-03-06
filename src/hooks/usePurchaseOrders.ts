import { useState, useEffect } from 'react';
import { PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus } from '../types';
import { supabase } from '../lib/supabase';

export interface PurchaseOrderFormProps {
  initialPurchaseOrder?: PurchaseOrder;
  onSave: () => void;
  onCancel: () => void;
}

export const usePurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchaseOrders = async (searchTerm: string = '', sortBy: string = 'order_number', sortOrder: string = 'asc') => {
    try {
      setLoading(true);

      let query = supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:suppliers(*),
          items:purchase_order_items(
            *,
            variant:variants(*,
              product:products(
                name
              )
            )
          )
        `);

      if (searchTerm) {
        query = query.ilike('order_number', `%${searchTerm}%`);
      }

      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data: ordersData, error: ordersError } = await query;

      if (ordersError) throw ordersError;

      setPurchaseOrders(ordersData || []);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const savePurchaseOrder = async (order: Omit<PurchaseOrder, 'id' | 'order_number'>) => {
    try {
      setLoading(true);

      // Save purchase order
      const { data: savedOrder, error: orderError } = await supabase
        .from('purchase_orders')
        .insert([{
          supplier_id: order.supplier_id,
          status: order.status,
          order_date: order.order_date,
          expected_delivery: order.expected_delivery,
          notes: order.notes
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Save order items
      if (order.items?.length > 0) {
        const { error: itemsError } = await supabase
          .from('purchase_order_items')
          .insert(
            order.items.map(item => ({
              purchase_order_id: savedOrder.id,
              variant_id: item.variant_id,
              quantity: item.quantity,
              purchase_price: item.purchase_price
            }))
          );

        if (itemsError) throw itemsError;
      }

      await fetchPurchaseOrders();
    } catch (error) {
      console.error('Error saving purchase order:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePurchaseOrder = async (id: string, order: Partial<PurchaseOrder>) => {
    try {
      setLoading(true);

      // Update purchase order
      const { error: orderError } = await supabase
        .from('purchase_orders')
        .update({
          supplier_id: order.supplier_id,
          status: order.status,
          order_date: order.order_date,
          expected_delivery: order.expected_delivery,
          notes: order.notes
        })
        .eq('id', id);

      if (orderError) throw orderError;

      // Handle items updates if provided
      if (order.items) {
        // Delete existing items
        const { error: deleteError } = await supabase
          .from('purchase_order_items')
          .delete()
          .eq('purchase_order_id', id);

        if (deleteError) throw deleteError;

        // Insert new items
        if (order.items.length > 0) {
          const { error: itemsError } = await supabase
            .from('purchase_order_items')
            .insert(
              order.items.map(item => ({
                purchase_order_id: id,
                variant_id: item.variant_id,
                quantity: item.quantity,
                purchase_price: item.purchase_price
              }))
            );

          if (itemsError) throw itemsError;
        }
      }

      await fetchPurchaseOrders();
    } catch (error) {
      console.error('Error updating purchase order:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePurchaseOrder = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchPurchaseOrders();
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, status: PurchaseOrderStatus) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('purchase_orders')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      await fetchPurchaseOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  return {
    purchaseOrders,
    loading,
    error,
    savePurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    updateOrderStatus,
    fetchPurchaseOrders
  };
};
