import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { PurchaseOrder, PurchaseOrderItem, Product, Variant } from '../types';
import { usePurchaseOrders } from '../hooks/usePurchaseOrders';
import { useSuppliers } from '../hooks/useSuppliers';
import { useProducts } from '../hooks/useProducts';

interface PurchaseOrderFormProps {
  orderId: string | null;
  onSave: () => void;
  onCancel: () => void;
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  orderId,
  onSave,
  onCancel,
}) => {
  const { purchaseOrders, savePurchaseOrder, updatePurchaseOrder } = usePurchaseOrders();
  const { suppliers } = useSuppliers();
  const { products } = useProducts();
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [allVariantsQuantity, setAllVariantsQuantity] = useState<number>(1);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const [order, setOrder] = useState<Partial<PurchaseOrder>>({
    supplier_id: '',
    status: 'draft',
    order_date: new Date().toISOString().split('T')[0],
    items: [],
  });

  useEffect(() => {
    if (orderId) {
      const existingOrder = purchaseOrders.find(o => o.id === orderId);
      if (existingOrder) {
        setOrder({
          ...existingOrder,
          order_date: new Date(existingOrder.order_date).toISOString().split('T')[0],
          expected_delivery: existingOrder.expected_delivery 
            ? new Date(existingOrder.expected_delivery).toISOString().split('T')[0]
            : undefined,
        });
      }
    }
  }, [orderId, purchaseOrders]);

  // Update filtered products when supplier changes
  useEffect(() => {
    if (order.supplier_id) {
      setFilteredProducts(products.filter(p => p.supplier_id === order.supplier_id));
      // Reset product selection when supplier changes
      setSelectedProduct('');
      setSelectedVariant('');
    } else {
      setFilteredProducts([]);
    }
  }, [order.supplier_id, products]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!order.supplier_id) {
        setError('Please select a supplier');
        return;
      }

      if (!order.items?.length) {
        setError('Please add at least one item to the order');
        return;
      }

      if (orderId) {
        await updatePurchaseOrder(orderId, order);
      } else {
        await savePurchaseOrder(order as Omit<PurchaseOrder, 'id' | 'order_number'>);
      }
      onSave();
    } catch (error) {
      console.error('Error saving purchase order:', error);
      setError(error instanceof Error ? error.message : 'Failed to save purchase order');
    }
  };

  const addItem = () => {
    if (!selectedProduct || !selectedVariant) return;

    const product = products.find(p => p.id === selectedProduct);
    const variant = product?.variants.find(v => v.id === selectedVariant);

    if (!product || !variant) return;

    const newItem: PurchaseOrderItem = {
      id: crypto.randomUUID(),
      purchase_order_id: orderId || '',
      variant_id: variant.id,
      quantity,
      purchase_price: purchasePrice || variant.purchasePrice,
      variant,
    };

    setOrder(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem],
    }));

    // Reset form
    setSelectedProduct('');
    setSelectedVariant('');
    setQuantity(1);
    setPurchasePrice(0);
  };

  const addAllVariants = () => {
    if (!selectedProduct) return;

    const product = products.find(p => p.id === selectedProduct);

    if (!product) return;

    const newItems: PurchaseOrderItem[] = product.variants.map(variant => ({
      id: crypto.randomUUID(),
      purchase_order_id: orderId || '',
      variant_id: variant.id,
      quantity: allVariantsQuantity,
      purchase_price: variant.purchasePrice,
      variant,
    }));

    setOrder(prev => ({
      ...prev,
      items: [...(prev.items || []), ...newItems],
    }));
  };

  const removeItem = (itemId: string) => {
    setOrder(prev => ({
      ...prev,
      items: prev.items?.filter(item => item.id !== itemId) || [],
    }));
  };

  const calculateTotal = () => {
    return order.items?.reduce((total, item) => total + (item.quantity * item.purchase_price), 0) || 0;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">
          {orderId ? 'Edit Purchase Order' : 'New Purchase Order'}
        </h2>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier
              </label>
              <select
                value={order.supplier_id || ''}
                onChange={(e) => {
                  setOrder({ ...order, supplier_id: e.target.value });
                }}
                className="w-full p-2 border rounded-md bg-white"
                required
              >
                <option value="">Select a supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name} ({supplier.supplier_number})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Date
              </label>
              <input
                type="date"
                value={order.order_date || ''}
                onChange={(e) => setOrder({ ...order, order_date: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Delivery
              </label>
              <input
                type="date"
                value={order.expected_delivery || ''}
                onChange={(e) => setOrder({ ...order, expected_delivery: e.target.value })}
                className="w-full p-2 border rounded-md"
                min={order.order_date}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={order.notes || ''}
                onChange={(e) => setOrder({ ...order, notes: e.target.value })}
                className="w-full p-2 border rounded-md"
                rows={1}
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Order Items</h3>
            
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => {
                      setSelectedProduct(e.target.value);
                      setSelectedVariant('');
                    }}
                    className="w-full p-2 border rounded-md bg-white"
                  >
                    <option value="">Select a product</option>
                    {filteredProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Variant
                  </label>
                  <select
                    value={selectedVariant}
                    onChange={(e) => {
                      setSelectedVariant(e.target.value);
                      const variant = products
                        .find(p => p.id === selectedProduct)
                        ?.variants.find(v => v.id === e.target.value);
                      if (variant) {
                        setPurchasePrice(variant.purchasePrice);
                      }
                    }}
                    className="w-full p-2 border rounded-md bg-white"
                    disabled={!selectedProduct}
                  >
                    <option value="">Select a variant</option>
                    {filteredProducts
                      .find(p => p.id === selectedProduct)
                      ?.variants.map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.sku} - {variant.size} / {variant.color}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full p-2 border rounded-md"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Price
                  </label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full p-2 border rounded-md"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={addItem}
                disabled={!selectedProduct || !selectedVariant}
                className="btn btn-primary btn-icon"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>

            <div className="mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity for All Variants
                  </label>
                  <input
                    type="number"
                    value={allVariantsQuantity}
                    onChange={(e) => setAllVariantsQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full p-2 border rounded-md"
                    min="1"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addAllVariants}
                    disabled={!selectedProduct}
                    className="btn btn-secondary"
                  >
                    Add All Variants with Quantity
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 p-3 rounded-md grid grid-cols-6 gap-4 items-center text-sm border border-gray-100"
                >
                  <div>
                    <span className="text-gray-600">Name:</span>{' '}
                    {products.find(p => p.variants.some(v => v.id === item.variant_id))?.name}
                  </div>
                  <div>
                    <span className="text-gray-600">Product:</span>{' '}
                    {item.variant?.sku}
                  </div>
                  <div>
                    <span className="text-gray-600">Size:</span>{' '}
                    {item.variant?.size}
                  </div>
                  <div>
                    <span className="text-gray-600">Color:</span>{' '}
                    {item.variant?.color}
                  </div>
                  <div>
                    <span className="text-gray-600">Quantity:</span>{' '}
                    {item.quantity} × {item.purchase_price.toFixed(2)} = {(item.quantity * item.purchase_price).toFixed(2)}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {order.items?.length > 0 && (
                <div className="text-right font-medium pt-2">
                  Total: {calculateTotal().toFixed(2)}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {orderId ? 'Update' : 'Create'} Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseOrderForm;
